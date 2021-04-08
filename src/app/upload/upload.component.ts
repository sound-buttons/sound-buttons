import { HttpClient } from '@angular/common/http';
import { ColorService } from './../color.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService, IFullConfig } from '../config.service';
import { FormBuilder } from '@angular/forms';

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
    end: [''],
    file: ['']
  });
  file: File | undefined | null;

  constructor(
    private route: ActivatedRoute,
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
  };

  uploadFile($event: Event): void {
    console.log($event);
    this.file = ($event.target as HTMLInputElement).files?.item(0);
  }

  OnSubmit($event: any): void {
    if (!this.file) { return; }

    const formData: any = new FormData();
    formData.append('nameZH', this.uploadForm.get('nameZH')?.value);
    formData.append('nameJP', this.uploadForm.get('nameJP')?.value);
    formData.append('group', this.uploadForm.get('group')?.value);
    formData.append('videoId', this.uploadForm.get('videoId')?.value);
    formData.append('start', this.uploadForm.get('start')?.value);
    formData.append('end', this.uploadForm.get('end')?.value);
    formData.append('file', this.file);
    formData.append('directory', this.configService.name.replace('_liveupdate', ''));

    // console.log(formData);
    this.http.post(this.api, formData).subscribe(response => {
      console.log(response);
    });
  }

}
