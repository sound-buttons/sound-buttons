import { FormBuilder } from '@angular/forms';
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
export class UploadComponent implements OnInit, OnDestroy{
  config!: IFullConfig;
  api = 'https://soundbuttons.azure-api.net/sound-buttons';
  public uploadForm = this.formBuilder.group({
    nameZH: [''],
    nameJP: [''],
    group: [''],
    videoId: [''],
    start: [''],
    end: { value: [''], disabled: true },
    file: ['']
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
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer
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
    this.file = ($event.target as HTMLInputElement).files?.item(0);

    if (this.file) {
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
    }
  }

  OnYoutubeLinkChange($event: Event, parseFromLink: boolean = true): void {
    // console.log($event);
    const txt: string = this.uploadForm.get('videoId')?.value ?? '';

    let videoId: string = txt;
    if (videoId.startsWith('https://youtu.be/')) {
      videoId = txt.match(/^.*\/([^?]*).*$/)?.pop() ?? '';
    }
    else if (videoId.startsWith('https://www.youtube.com/watch')) {
      videoId = txt.match(/^.*[?&]v=([^&]*).*$/)?.pop() ?? '';
    }

    let start: number;
    if (parseFromLink) {
      start = parseInt(txt.match(/^.*[?&]t=([^&smh]*).*$/)?.pop() ?? '0', 10);
    } else {
      start = this.uploadForm.get('start')?.value ?? 0;
    }
    this.uploadForm.patchValue({ start });
    this.patchEnd();

    const url = new URL('https://www.youtube.com/embed/' + videoId);
    url.searchParams.append('start', `${this.uploadForm.get('start')?.value ?? 0}`);
    url.searchParams.append('end', `${this.uploadForm.get('end')?.value ?? 0}`);

    this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
  }

  OnSubmit($event: any): void {
    const start = this.uploadForm.get('start')?.value;
    if (!this.file || this.uploadForm.invalid) {
      alert('請填入必填欄位！');
      return;
    } else if (start && start < 0) {
      alert('起始時間不能小於零！');
      return;
    }

    // const formData: any = new FormData();
    const formData = new FormData();
    formData.append('nameZH', this.uploadForm.get('nameZH')?.value);
    formData.append('nameJP', this.uploadForm.get('nameJP')?.value);
    formData.append('group', this.uploadForm.get('group')?.value);
    formData.append('videoId', this.uploadForm.get('videoId')?.value);
    formData.append('file', this.file);
    formData.append('directory', this.configService.name);

    formData.append('start', start);
    formData.append('end', this.uploadForm.get('end')?.value);

    // console.log(formData);
    this.http.post(this.api, formData).subscribe(response => {
      if (confirm('上傳完成，是否前往預覧頁?')) {
        this.router.navigate([this.configService.name], { queryParams: { liveUpdate: '' } });
      }
      this.uploadForm.reset();
    });
  }

  patchEnd(): void {
    this.uploadForm.patchValue({
      end: Math.ceil(parseFloat(this.uploadForm.get('start')?.value ?? '0') + this.duration)
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

}
