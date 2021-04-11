import { AudioService } from './../services/audio.service';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IButtonGroup } from './ButtonGroup';
import { IButton, ISource } from './Buttons';

@Component({
  selector: 'app-sound-buttons',
  templateUrl: './sound-buttons.component.html',
  styleUrls: ['./sound-buttons.component.scss']
})
export class SoundButtonsComponent implements OnInit {
  @Input() buttonGroups: IButtonGroup[] = [];
  youtubeEmbedLink: SafeResourceUrl = '';
  youtubeEmbedSource: ISource | undefined = undefined;

  constructor(
    private sanitizer: DomSanitizer,
    private audioService: AudioService
  ) { }

  ngOnInit(): void {
  }

  buttonClick($event: MouseEvent, btn: IButton): void {
    btn.click($event);
    // console.log(btn);

    this.youtubeEmbedSource = this.audioService.lastSource;
    if (this.youtubeEmbedSource !== undefined && this.youtubeEmbedSource?.videoId) {
      const url = new URL('https://www.youtube.com/embed/' + this.youtubeEmbedSource.videoId);
      url.searchParams.append('start', `${this.youtubeEmbedSource.start}`);
      // url.searchParams.append('autoplay', '1');

      this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    } else {
      this.youtubeEmbedLink = '';
    }

  }

}
