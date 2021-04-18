import { DialogService } from './../services/dialog.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColorService } from '../services/color.service';
import { ConfigService, IFullConfig } from '../services/config.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnDestroy {
  config!: IFullConfig;
  api = 'https://soundbuttons.azure-api.net/sound-buttons';
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
          || c.value - (c.parent?.get('start')?.value ?? 0) > 60)
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private colorService: ColorService,
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService
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

    let start: number;
    if (parseFromLink) {
      start = parseInt(value.match(/^.*[?&]t=([^&smh]*).*$/)?.pop() ?? '0', 10);
      this.form.patchValue({ start });
      this.patchEnd();
    // } else {
    //   start = this.getFormControl('start').value ?? 0;
    }

    // 拼youtube embed連結
    const url = new URL('https://www.youtube.com/embed/' + videoId);
    url.searchParams.append('start', `${this.getFormControl('start').value ?? 0}`);
    url.searchParams.append('end', `${this.getFormControl('end').value ?? 0}`);

    this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());

    // 重新計算file的驗證
    this.getFormControl('file').updateValueAndValidity();
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

    formData.append('start', this.getFormControl('start').value);
    formData.append('end', this.getFormControl('end').value);

    this.http.post(this.api, formData, { observe: 'response' }).subscribe((response) => {
      const name = (response.body as string[])[0] ?? '';
      switch (response.status) {
        case 200:
          this.dialogService.toastSuccess(`上傳${name}成功`);
          break;
        case 400:
          this.dialogService.toastError(`上傳${name}失敗，欄位錯誤!!`);
          break;
        case 408:
          this.dialogService.toastError(`上傳${name}回應超時!!`);
          break;
        case 500:
          this.dialogService.toastError(`上傳${name}失敗，伺服器錯誤!!`);
          break;
        default:
          this.dialogService.toastWarning(`上傳${name}回應異常!!`);
      }
    });

    this.dialogService.toastInfo(`表單${this.getFormControl('nameZH').value}已送出`);
    this.form.reset();
    this.youtubeEmbedLink = '';

    if (!this.file) {
      this.dialogService.showModal.emit({
        title: '提醒',
        message: 'Youtube來源運算需要時間<br>請於3~5分鐘後再重整查看'
      });
    }
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
}
