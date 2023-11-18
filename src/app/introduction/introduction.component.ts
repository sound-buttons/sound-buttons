import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { IButton } from './../sound-buttons/Buttons';
import { ILink } from '../services/config.service';
import { ContextMenuComponent } from '../sound-buttons/context-menu/context-menu.component';
import { ConfigService } from './../services/config.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss'],
})
export class IntroductionComponent implements OnInit {
  initTime = Date.now();

  @Input() imgs: string[] | string = [];

  @Input() public intro = '';

  @Input() link: ILink | undefined;

  @Input() button: IButton | undefined;

  isLiveUpdate = false;

  menu = ContextMenuComponent;

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((m) => {
      this.isLiveUpdate = m.get('liveUpdate') === '1';
    });
  }

  reloadConfig(): void {
    this.configService.reloadConfig(() => (this.initTime = Date.now()));
  }

  buttonClick($event: MouseEvent, btn: IButton): void {
    this.audioService.add(btn);
    if (!this.audioService.isPaused() && !this.audioService.isPlaying()) this.audioService.play();
  }
}
