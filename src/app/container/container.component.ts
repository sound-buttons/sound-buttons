import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { IButton } from './../sound-buttons/Buttons';
import { AudioService } from '../services/audio.service';
import { IFullConfig, ConfigService } from '../services/config.service';
import { SEOService } from './../services/seo.service';
import { DisplayService } from './../services/display.service';
import { DialogService } from './../services/dialog.service';
import * as mime from 'mime';

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
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private audioService: AudioService,
    private displayService: DisplayService,
    private SEOService: SEOService,
    private dialogService: DialogService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.configSubscription = this.configService.OnConfigChanged.subscribe((config) => {
      if (config) {
        this.config = config;
        this.audioService.lastSource = undefined;

        this.SEOService.setTitle(config.fullName + ' - Sound Buttons');
        this.SEOService.setUrl('https://sound-buttons.maki0419.com/' + config.name);
        this.SEOService.setImage(
          `https://sound-buttons.maki0419.com/assets/img/preview/${config.name}.png`
        );

        this.route.queryParams
          .pipe(
            filter((p) => !!p.filename),
            take(1)
          )
          .subscribe((params) => {
            if (this.modalService.getModalsCount() === 0) {
              let button: IButton | undefined;
              const filename =
                (params.filename as string).indexOf('.') >= 0
                  ? params.filename.split('.').slice(0, -1).join('.') + '.webm'
                  : params.filename + '.webm';
              this.config.buttonGroups?.forEach((group) => {
                button ??= group.buttons.find((btn) => btn.filename === filename);
              });

              if (typeof button !== 'undefined') {
                const audioElement = document.createElement('audio');
                audioElement.controls = true;
                const source = document.createElement('source');
                source.src = button.baseRoute + button.filename + button.SASToken;
                source.type = mime.getType(button.filename) ?? 'audio/webm';
                audioElement.appendChild(source);

                this.dialogService.showModal.emit({
                  title: button.text,
                  message: audioElement.outerHTML,
                });

                this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: { filename: null },
                  queryParamsHandling: 'merge',
                });
              }
            }
          });
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
