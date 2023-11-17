/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, InjectionToken, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogService } from './../services/dialog.service';
import { ColorService } from '../services/color.service';
import { ConfigService, IFullConfig } from '../services/config.service';
import { Subscription, timer } from 'rxjs';
import { concatMap, skipWhile, switchMap, take } from 'rxjs/operators';
import { ISource } from '../sound-buttons/Buttons';
import { EnvironmentToken } from '../app.module';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit, OnDestroy {
  config!: IFullConfig;
  apiBase = '';
  api = '';
  apiWake = '';
  origin = '';
  public form = this.fb.group({
    nameZH: '',
    nameJP: this.fb.control({ value: '', disabled: false }),
    useSTT: this.fb.control(false),
    group: this.fb.control('', {
      validators: Validators.required,
      updateOn: 'blur',
    }),
    videoId: this.fb.control('', {
      validators: [
        (c) =>
          +!Validators.required(c) +
            +!!c.parent?.get('file')?.value +
            +!!c.parent?.get('clip')?.value !==
            1 ||
          !(
            !!('' + c.value).match(
              /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])?([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/
            ) || !!Validators.required(c)
          )
            ? { videoId: true }
            : null,
      ],
    }),
    start: this.fb.control('', {
      validators: [
        (c) => (c.parent?.get('videoId')?.dirty && c.value < 0 ? { start: true } : null),
      ],
    }),
    end: this.fb.control('', {
      validators: [
        (c) =>
          c.parent?.get('videoId')?.dirty &&
          ((c.parent?.get('start')?.value ?? 0) >= c.value ||
            c.value - (c.parent?.get('start')?.value ?? 0) > 180)
            ? { end: true }
            : null,
      ],
    }),
    file: this.fb.control(null, {
      validators: [
        (c) =>
          +!Validators.required(c) +
            +!!c.parent?.get('videoId')?.value +
            +!!c.parent?.get('clip')?.value !==
          1
            ? { file: true }
            : null,
      ],
    }),
    clip: this.fb.control('', {
      validators: [
        (c) =>
          +!Validators.required(c) +
            +!!c.parent?.get('videoId')?.value +
            +!!c.parent?.get('file')?.value !==
            1 ||
          !('' + c.value).match(/^(?:https?:\/\/(?:www.)?youtube.com\/clip\/)?[\w-]*(?:\?[\w=]*)?$/)
            ? { clip: true }
            : null,
      ],
    }),
  });
  file: File | undefined | null;
  duration = 0;

  youtubeEmbedLink: SafeResourceUrl = '';
  routerSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private colorService: ColorService,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    public translate: TranslateService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(EnvironmentToken) private env: any
  ) {
    this.apiBase = this.env.api;
    this.api = this.apiBase + '/sound-buttons';
    this.apiWake = this.apiBase + '/wake';
    this.origin = this.env.origin;
  }

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? 'template';
    this.configService.name = name;
    this.routerSubscription = this.configService.OnConfigChanged.subscribe((config) => {
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
    document.addEventListener('wheel', () => {
      return;
    });
  }

  OnFileUpload($event: Event): void {
    const clearFile = (message?: string) => {
      if (message) {
        this.dialogService.toastError(message);
        // alert(message);
      }
      this.file = undefined;
      this.getFormControl('file').reset();
    };

    // 檔案驗證
    this.file = ($event.target as HTMLInputElement).files?.item(0);

    this.updateValueAndValidity();
    if (!this.file) {
      clearFile();
      return;
    }
    if (this.file.size && this.file?.size > 30000000) {
      this.translate.get('音檔上限', { value: '30MB' }).subscribe((res: string) => {
        clearFile(`${res}!!`);
      });
      return;
    }
    if (!this.file.type.startsWith('audio') && !this.file.type.startsWith('video')) {
      this.translate.get('僅限上傳音訊檔案').subscribe((res: string) => {
        clearFile(`${res}!!`);
      });
      return;
    }

    // 讀出音檔長度，用來計算end
    const reader = new FileReader();

    reader.onload = (e) => {
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

    this.updateValueAndValidity();
  }

  OnYoutubeLinkChange($event: Event, parseFromLink = true): void {
    // 自動帶入start、end
    const value: string = this.form.get('videoId')?.value ?? '';
    const videoId =
      value
        .match(
          /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])?([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/
        )
        ?.pop() ?? '';

    if ('' === videoId) {
      this.youtubeEmbedLink = '';
      this.updateValueAndValidity();
      if ('' !== value) {
        this.dialogService.toastError('Invalid Link: ' + value);
      }
      return;
    }

    let start: number;
    if (parseFromLink) {
      start = parseInt(value.match(/^.*[?&]t=([^&smh]*).*$/)?.pop() ?? '0', 10);
      this.form.patchValue({ start });
      this.patchEnd();
    }

    // 拼youtube embed連結
    // https://developers.google.com/youtube/player_parameters
    const url = new URL('https://www.youtube.com/embed/' + videoId);
    url.searchParams.append(
      'start',
      `${Math.floor(this.getFormControl('start').value as number) ?? 0}`
    );
    url.searchParams.append('end', `${Math.ceil(this.getFormControl('end').value) ?? 0}`);
    url.searchParams.append('playsinline', '1');
    url.searchParams.append('enablejsapi', '1');
    url.searchParams.append('origin', this.origin);
    url.searchParams.append('widget_referrer', this.origin);
    url.searchParams.append('widgetid', '1');
    url.searchParams.append('iv_load_policy', '3');
    // url.searchParams.append('controls', '0');
    url.searchParams.append('fs', '0');
    url.searchParams.append('rel', '0');
    url.searchParams.append('autoplay', '1');

    this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());

    this.updateValueAndValidity();
  }

  OnYoutubeClipChange($event: Event): void {
    const clip: string = this.form.get('clip')?.value ?? '';

    if (
      clip !== '' &&
      !clip.match(/^(?:https?:\/\/(?:www.)?youtube.com\/clip\/)?[\w-]*(?:\?[\w=]*)?$/)
    ) {
      this.dialogService.toastError('Invalid Clip Link: ' + clip);
    }
    this.updateValueAndValidity();
  }

  OnSubmit($event: Event): void {
    if (this.form.invalid) {
      this.translate.get('請填入必填欄位').subscribe((res: string) => {
        this.dialogService.toastError(`${res}!`);
      });
      return;
    }

    const formData = new FormData();
    formData.append('nameZH', this.getFormControl('nameZH').value);
    formData.append(
      'nameJP',
      this.getFormControl('useSTT').value ? '[useSTT]' : this.getFormControl('nameJP').value
    );
    formData.append('group', this.getFormControl('group').value);
    formData.append('videoId', this.getFormControl('videoId').value);
    formData.append('clip', this.getFormControl('clip').value);
    formData.append('file', this.file ?? '');
    formData.append('directory', this.configService.name);
    formData.append('volume', '1');

    formData.append('start', this.getFormControl('start').value);
    formData.append('end', this.getFormControl('end').value);

    formData.append(
      'toastId',
      this.dialogService
        .toastPending(`Uploading ${this.getFormControl('nameZH').value} ...`)
        .toString()
    );

    // Long polling
    this.http
      .post<IAcceptedResponse>(this.api, formData)
      .pipe(
        concatMap((acceptResponse) => {
          const uri = acceptResponse.statusQueryGetUri;
          if (!uri) {
            this.dialogService.clearPending();
            this.translate.get('上傳失敗，伺服器未回應輪詢 URI').subscribe((res: string) => {
              this.dialogService.toastError(res);
            });
            throw Error('No recall location.');
          }

          return timer(10000, 20000).pipe(
            take(30),
            switchMap(() => {
              return this.http.get<ILongPollingResponse>(uri, {
                observe: 'response',
              });
            }),
            skipWhile((response) => response.status === 202),
            take(1)
          );
        })
      )
      .subscribe(
        (response) => {
          const toastId = response.body?.input.toastId ?? -1;
          this.dialogService.disablePending(+toastId);
          const name = response.body?.input.nameZH;
          if (response.body?.output) {
            this.translate.get('上傳成功').subscribe((res: string) => {
              this.dialogService.toastSuccess(`${name} ${res}`);
            });
          } else {
            this.translate.get('上傳失敗').subscribe((res: string) => {
              this.dialogService.toastError(`${name} ${res}`);
            });
          }
          this.configService.reloadConfig();
        },
        (response) => {
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
              this.translate.get('上傳失敗，欄位錯誤').subscribe((res: string) => {
                this.dialogService.toastError(`${name} ${res}`);
              });
              break;
            case 0: // 由瀏覧器timeout
            case 408:
              this.translate.get('上傳回應超時').subscribe((res: string) => {
                this.dialogService.toastError(`${name} ${res}`);
              });
              break;
            case 500:
              this.translate.get('上傳失敗，伺服器錯誤').subscribe((res: string) => {
                this.dialogService.toastError(`${name} ${res}`);
              });
              break;
            default:
              this.translate.get('上傳回應異常').subscribe((res: string) => {
                this.dialogService.toastWarning(`${name} ${res}`);
              });
          }
        }
      );
    this.youtubeEmbedLink = '';

    this.form.reset();
    this.router.navigate(['/', this.config.name], {
      queryParams: { liveUpdate: '1' },
      queryParamsHandling: 'merge',
    });
  }

  patchEnd(): void {
    this.form.patchValue({
      end: Math.ceil(parseFloat(this.getFormControl('start').value ?? '0') + this.duration),
    });
  }

  /**
   * 重新計算驗證
   *
   */
  updateValueAndValidity(): void {
    this.getFormControl('file').updateValueAndValidity();
    this.getFormControl('clip').updateValueAndValidity();
    this.getFormControl('videoId').updateValueAndValidity();
    this.getFormControl('start').updateValueAndValidity();
    this.getFormControl('end').updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  public getFormControl = (name: string): UntypedFormControl =>
    this.form.get(name) as UntypedFormControl;

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
    sasContainerToken?: never;
    toastId: string;
  };
  customStatus?: never;
  output: boolean;
  createdTime: string;
  lastUpdatedTime: string;
}
