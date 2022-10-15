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

        this.route.queryParams
          .pipe(
            filter((p) => !!p.filename),
            take(1)
          )
          .subscribe((params) => {
            if (this.modalService.getModalsCount() === 0) {
              let button: IButton | undefined;
              this.config.buttonGroups?.forEach((group) => {
                button ??= group.buttons.find((btn) => btn.filename === params.filename);
              });

              if (typeof button !== 'undefined') {
                const audioElement = document.createElement('audio');
                audioElement.controls = true;
                audioElement.src = button.baseRoute + button.filename + button.SASToken;

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
