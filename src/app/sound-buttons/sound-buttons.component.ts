import { DisplayService } from './../services/display.service';
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
  displaySet = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private audioService: AudioService,
    private displayService: DisplayService
  ) { }

  ngOnInit(): void {
    this.audioService.OnSourceChanged.subscribe((s) => this.changeYoutubeEmbed(s));
    if (this.audioService.lastSource) {
      this.changeYoutubeEmbed(this.audioService.lastSource);
    }

    this.displayService.OnConfigChanged.subscribe(display => {
      this.displaySet = display;
    });
  }

  changeYoutubeEmbed(source: ISource | undefined): void {
    if (source && source?.videoId && source?.videoId !== 'null') {
      const url = new URL('https://www.youtube.com/embed/' + source.videoId);
      url.searchParams.append('start', `${source.start}`);
      url.searchParams.append('end', `${source.end}`);
      // url.searchParams.append('autoplay', '1');

      this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    } else {
      this.youtubeEmbedLink = '';
    }
  }

  buttonClick($event: MouseEvent, btn: IButton): void {
    btn.click($event);
  }

  gridColumnLen(str: string): number {
    let len: number = str.replace(/[^\x00-\xff]/g, 'xx').length;
    len = Math.ceil(len / 2) + 5;
    len = len > 50 ? 50 : len;
    len = len < 10 ? 10 : len;
    return len;
  }
}
