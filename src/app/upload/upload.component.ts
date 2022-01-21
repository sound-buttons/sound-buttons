import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogService } from './../services/dialog.service';
import { ColorService } from '../services/color.service';
import { ConfigService, IFullConfig } from '../services/config.service';
import { Subscription, timer } from 'rxjs';
import { concatMap, skipWhile, switchMap, take } from 'rxjs/operators';
import { ISource } from '../sound-buttons/Buttons';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnDestroy {
  config!: IFullConfig;
  api = 'https://soundbuttons.azure-api.net/sound-buttons';
  apiWake = 'https://soundbuttons.azure-api.net/wake';
  apiExist = 'https://soundbuttons.azure-api.net/cache-exists';
  public form = this.fb.group({
    nameZH: this.fb.control('', {
      validators: Validators.required,
      updateOn: 'blur'
    }),
    nameJP: '',
    group: '',
    videoId: this.fb.control(null, {
      validators: [(c) =>
        c.parent?.get('file')?.pristine && !!Validators.required(c)
          ? { videoId: true }
          : null
      ]
    }),
    start: this.fb.control('', {
      validators: [(c) => (
        c.parent?.get('videoId')?.dirty
        && c.value < 0
      ) ? { start: true }
        : null
      ]
    }),
    end: this.fb.control('', {
      validators: [(c) => (
        c.parent?.get('videoId')?.dirty
        && ((c.parent?.get('start')?.value ?? 0) >= c.value
          || c.value - (c.parent?.get('start')?.value ?? 0) > 180)
      ) ? { end: true }
        : null
      ]
    }),
    file: this.fb.control(null, {
      validators: [(c) =>
        c.parent?.get('videoId')?.pristine && !!Validators.required(c)
          ? { file: true }
          : null
      ]
    })
  });
  file: File | undefined | null;
  duration = 0;

  youtubeEmbedLink: SafeResourceUrl = '';
  routerSubscription: Subscription | undefined;

  cacheExists = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private colorService: ColorService,
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    public translate: TranslateService
  ) { }

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? 'template';
    this.configService.name = name;
    this.routerSubscription = this.configService.OnConfigChanged.subscribe(config => {
      if (config) {
        this.colorService.color = config.color ?? this.colorService.defaultColor;
        this.config = config;
      } else {
        this.router.navigate(['/']);
      }
    });

    // 因為cold start，在開啟上傳表單時直接送一個http get啟動azure function，而結果我不管它
    this.http.get(this.apiWake).subscribe();

    // 使input type=number能使用滾輪
    document.addEventListener('wheel', () => { });
  }

  OnFileUpload($event: Event): void {
    const clearFile = (message?: string) => {
      if (message) {
        this.dialogService.toastError(
          message
        );
        // alert(message);
      }
      this.file = undefined;
      this.getFormControl('file').reset();
    };

    // 檔案驗證
    this.file = ($event.target as HTMLInputElement).files?.item(0);

    if (!this.file) {
      clearFile();
      return;
    }
    if ((this.file.size && this.file?.size > 30000000)) {
      clearFile('音檔上限30MB!!');
      return;
    }
    if (!this.file.type.startsWith('audio')) {
      clearFile('僅限上傳音訊檔!!');
      return;
    }

    // 讀出音檔長度，用來計算end
    const reader = new FileReader();

    reader.onload = e => {
      // Create an instance of AudioContext
      const audioContext = new window.AudioContext();

      // Asynchronously decode audio file data contained in an ArrayBuffer.
      if (e.target && typeof e.target.result !== 'string') {
        audioContext.decodeAudioData(e.target.result as ArrayBuffer, (buffer) => {
          this.duration = buffer.duration;
          this.patchEnd();
        });
      }
    };

    // In case that the file couldn't be read
    reader.onerror = (event) => {
      console.error('An error ocurred reading the file: ', event);
    };

    // Read file as an ArrayBuffer, important !
    reader.readAsArrayBuffer(this.file);

    // 重新計算video相關的三格驗證
    this.getFormControl('videoId').updateValueAndValidity();
    this.getFormControl('start').updateValueAndValidity();
    this.getFormControl('end').updateValueAndValidity();
  }

  OnYoutubeLinkChange($event: Event, parseFromLink: boolean = true): void {
    // 自動帶入start、end
    const value: string = this.form.get('videoId')?.value ?? '';

    let videoId: string = value;
    if (videoId.startsWith('https://youtu.be/')) {
      videoId = value.match(/^.*\/([^?]*).*$/)?.pop() ?? '';
    }
    else if (videoId.startsWith('https://www.youtube.com/watch')) {
      videoId = value.match(/^.*[?&]v=([^&]*).*$/)?.pop() ?? '';
    }

    if ('' === videoId) { return; }

    let start: number;
    if (parseFromLink) {
      start = parseInt(value.match(/^.*[?&]t=([^&smh]*).*$/)?.pop() ?? '0', 10);
      this.form.patchValue({ start });
      this.patchEnd();
    }

    // 拼youtube embed連結
    const url = new URL('https://www.youtube.com/embed/' + videoId);
    url.searchParams.append('start', `${this.getFormControl('start').value ?? 0}`);
    url.searchParams.append('end', `${this.getFormControl('end').value ?? 0}`);

    this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());

    // 重新計算驗證
    this.getFormControl('file').updateValueAndValidity();
    this.getFormControl('start').updateValueAndValidity();
    this.getFormControl('end').updateValueAndValidity();

    this.http.get<boolean>(this.apiExist, { params: { id: videoId } }).subscribe((response) => {
      this.cacheExists = response;
    });
  }

  OnSubmit($event: any): void {
    if (this.form.invalid) {
      this.dialogService.toastError('請填入必填欄位！');
      return;
    }

    // const formData: any = new FormData();
    const formData = new FormData();
    formData.append('nameZH', this.getFormControl('nameZH').value);
    formData.append('nameJP', this.getFormControl('nameJP').value);
    formData.append('group', this.getFormControl('group').value);
    formData.append('videoId', this.getFormControl('videoId').value);
    formData.append('file', this.file ?? '');
    formData.append('directory', this.configService.name);
    formData.append('volume', '1');

    formData.append('start', this.getFormControl('start').value);
    formData.append('end', this.getFormControl('end').value);

    formData.append('toastId',
      this.dialogService.toastPending(`上傳${this.getFormControl('nameZH').value}運算中`).toString());

    // Long polling
    this.http.post<IAcceptedResponse>(this.api, formData)
      .pipe(
        concatMap(acceptResponse => {
          const uri = acceptResponse.statusQueryGetUri;
          if (!uri) {
            this.dialogService.clearPending();
            this.dialogService.toastError(`上傳失敗，伺服器未回應輪詢URI`);
            throw Error('No recall location.');
          }

          return timer(10000, 20000).pipe(
            take(30),
            switchMap(() => {
              return this.http.get<ILongPollingResponse>(uri, { observe: 'response' });
            }),
            skipWhile(response => response.status === 202),
            take(1)
          );
        })
      ).subscribe(
        response => {
          const toastId = response.body?.input.toastId ?? -1;
          this.dialogService.disablePending(+toastId);
          const name = response.body?.input.nameZH;
          if (response.body?.output) {
            this.dialogService.toastSuccess(`上傳${name}成功`);
          } else {
            this.dialogService.toastError(`上傳${name}失敗`);
          }
          this.configService.reloadConfig();
        },
        response => {
          let name = '';
          try {
            const toastId = response.body?.input.toastId ?? -1;
            this.dialogService.disablePending(+toastId);

            name = response.body?.input.nameZH;
          } catch (e) {
            /* 錯誤時不一定會正確回傳設定的結果，直接抓掉 */
            this.dialogService.clearPending();
          }

          switch (response.status) {
            case 400:
              this.dialogService.toastError(`上傳${name}失敗，欄位錯誤!!`);
              break;
            case 0: // 由瀏覧器timeout
            case 408:
              this.dialogService.toastError(`上傳${name}回應超時!!`);
              break;
            case 500:
              this.dialogService.toastError(`上傳${name}失敗，伺服器錯誤!!`);
              break;
            default:
              this.dialogService.toastWarning(`上傳${name}回應異常!!`);
          }
        },
      );
    this.youtubeEmbedLink = '';

    if (!this.file && !this.cacheExists) {
      this.dialogService.showModal.emit({
        title: '提醒',
        message: '此影片尚未建立快取，有可能在下載中逾時<br>請留意！'
      });
    }
    this.form.reset();
    this.router.navigate(['/', this.config.name], { queryParams: { liveUpdate: '1' } });
  }

  patchEnd(): void {
    this.form.patchValue({
      end: Math.ceil(parseFloat(this.getFormControl('start').value ?? '0') + this.duration)
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  public getFormControl = (name: string): FormControl =>
    this.form.get(name) as FormControl;

  groupNames = () => this.configService.groupNames;
}

interface IAcceptedResponse {
  id: string;
  statusQueryGetUri: string;
  sendEventPostUri: string;
  terminatePostUri: string;
  purgeHistoryDeleteUri: string;
}

interface ILongPollingResponse {
  name: string;
  instanceId: string;
  runtimeStatus: string;
  input: {
    ip: string;
    filename: string;
    directory: string;
    source: ISource;
    nameZH: string;
    nameJP: string;
    volume: string;
    group: string;
    tempPath: string;
    sasContainerToken?: any;
    toastId: string;
  };
  customStatus?: any;
  output: boolean;
  createdTime: string;
  lastUpdatedTime: string;
}
