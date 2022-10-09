import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AudioService } from '../services/audio.service';
import { IFullConfig, ConfigService } from '../services/config.service';
import { SEOService } from './../services/seo.service';
import { DisplayService } from './../services/display.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit, OnDestroy {
  config!: IFullConfig;
  configSubscription: Subscription | undefined;
  displaySet = 0;

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private audioService: AudioService,
    private displayService: DisplayService,
    private SEOService: SEOService
  ) {}

  ngOnInit(): void {
    this.configSubscription = this.configService.OnConfigChanged.subscribe((config) => {
      if (config) {
        this.config = config;

        if (config.introButton?.source) {
          this.audioService.lastSource = config.introButton?.source;
        } else {
          this.audioService.lastSource = undefined;
        }

        this.SEOService.setTitle(config.fullName + ' - Sound Buttons');
        this.SEOService.setOgUrl('https://sound-buttons.maki0419.com/' + config.name);
        this.SEOService.setCanonicalLink('https://sound-buttons.maki0419.com/' + config.name);
      }
    });
    this.route.paramMap.subscribe((p) => {
      this.configService.name = p.get('name') ?? 'template';
    });
    this.route.queryParamMap.subscribe((q) => {
      this.configService.isLiveUpdate = q.has('liveUpdate');
    });

    this.displaySet = this.displayService.getDisplay();
    this.displayService.OnConfigChanged.subscribe((p) => {
      this.displaySet = p[0];
    });
  }

  ngOnDestroy(): void {
    this.configSubscription?.unsubscribe();
  }
}
