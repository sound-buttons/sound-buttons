import { DisplayService } from './../services/display.service';
import { AudioService } from './../services/audio.service';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IButtonGroup } from './ButtonGroup';
import { IButton, ISource } from './Buttons';
import { EnvironmentToken } from '../app.module';
import { ContextMenuComponent } from './context-menu/context-menu.component';

@Component({
  selector: 'app-sound-buttons',
  templateUrl: './sound-buttons.component.html',
  styleUrls: ['./sound-buttons.component.scss'],
})
export class SoundButtonsComponent implements OnInit {
  @Input() buttonGroups: IButtonGroup[] = [];
  youtubeEmbedLink: SafeResourceUrl = '';
  displaySet = 0;
  filterText = '';
  origin = '';
  menu = ContextMenuComponent;

  constructor(
    private sanitizer: DomSanitizer,
    private audioService: AudioService,
    private displayService: DisplayService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(EnvironmentToken) private env: any
  ) {
    this.origin = this.env.origin;
  }

  ngOnInit(): void {
    this.audioService.OnSourceChanged.subscribe((s) => this.changeYoutubeEmbed(s));
    if (this.audioService.lastSource) {
      this.changeYoutubeEmbed(this.audioService.lastSource);
    }

    this.filterText = this.displayService.getFilterText();
    this.displayService.OnConfigChanged.subscribe((p) => {
      this.displaySet = p[0];
      this.filterText = p[1];
    });
  }

  changeYoutubeEmbed(source: ISource | undefined): void {
    if (source && source?.videoId && source?.videoId !== 'null') {
      const url = new URL('https://www.youtube.com/embed/' + source.videoId);
      url.searchParams.append('start', `${source.start}`);
      url.searchParams.append('end', `${source.end}`);
      url.searchParams.append('playsinline', '1');
      url.searchParams.append('enablejsapi', '1');
      url.searchParams.append('origin', this.origin);
      url.searchParams.append('widget_referrer', this.origin);
      url.searchParams.append('widgetid', '1');
      url.searchParams.append('iv_load_policy', '3');
      url.searchParams.append('controls', '0');
      url.searchParams.append('fs', '0');
      url.searchParams.append('rel', '0');
      url.searchParams.append('autoplay', '0');

      this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    } else {
      this.youtubeEmbedLink = '';
    }
  }

  buttonClick($event: MouseEvent, btn: IButton): void {
    btn.click($event);
  }

  gridColumnLen(str: string): number {
    // eslint-disable-next-line no-control-regex
    let len: number = str.replace(/[^\x00-\xff]/g, 'xx').length;
    len = Math.ceil(len / 2) + 5;
    len = len > 50 ? 50 : len;
    len = len < 10 ? 10 : len;
    return len;
  }
}
