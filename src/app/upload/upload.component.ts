import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColorService } from '../services/color.service';
import { ConfigService, IFullConfig } from '../services/config.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  config!: IFullConfig;
  api = 'https://soundbuttons.azure-api.net/sound-buttons';
  public uploadForm = this.formBuilder.group({
    nameZH: [''],
    nameJP: [''],
    group: [''],
    videoId: [''],
    start: [''],
    file: ['']
  });
  file: File | undefined | null;
  duration = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private colorService: ColorService,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? 'template';
    this.configService.name = name;
    this.configService.OnConfigChanged.subscribe(config => {
      this.colorService.color = config.color ?? this.colorService.defaultColor;
      this.config = config;
      return;
    });
  }

  uploadFile($event: Event): void {
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

  OnSubmit($event: any): void {
    if (!this.file) { return; }

    // const formData: any = new FormData();
    const formData = new FormData();
    formData.append('nameZH', this.uploadForm.get('nameZH')?.value);
    formData.append('nameJP', this.uploadForm.get('nameJP')?.value);
    formData.append('group', this.uploadForm.get('group')?.value);
    formData.append('videoId', this.uploadForm.get('videoId')?.value);
    formData.append('start', this.uploadForm.get('start')?.value);
    formData.append('file', this.file);
    formData.append('directory', this.configService.name);

    formData.append('end', '' + (parseFloat(this.uploadForm.get('start')?.value) + this.duration));

    // console.log(formData);
    this.http.post(this.api, formData).subscribe(response => {
      if (confirm('上傳完成，是否前往預覧頁?')) {
        this.router.navigate([this.configService.name], { queryParams: { liveUpdate: '' } });
      }
      this.uploadForm.reset();
    });
  }

}
