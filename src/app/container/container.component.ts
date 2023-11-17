import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { IButton } from './../sound-buttons/Buttons';
import { IFullConfig, ConfigService } from '../services/config.service';
import { SEOService } from './../services/seo.service';
import { DialogService } from './../services/dialog.service';
import * as mime from 'mime';
import { EnvironmentToken } from '../app.module';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit, OnDestroy {
  config: IFullConfig | undefined;
  configSubscription: Subscription | undefined;
  displaySet = 0;
  origin = '';
  onHide: Subscription | undefined;
  routerParams: Subscription | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private SEOService: SEOService,
    private dialogService: DialogService,
    private modalService: BsModalService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(EnvironmentToken) private env: any
  ) {
    this.origin = this.env.origin;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      this.configService.name = p.get('name') ?? 'template';
    });

    this.route.queryParamMap.subscribe((q) => {
      this.configService.isLiveUpdate = q.has('liveUpdate');
    });

    this.dialogService.onHideModal.subscribe(() => {
      this.router.navigate(['/', this.config?.name], {
        relativeTo: this.route,
        queryParams: { filename: null },
        queryParamsHandling: 'merge',
      });
    });

    this.configSubscription = this.configService.OnConfigChanged.subscribe((config) => {
      if (config) {
        this.config = config;

        if (this.routerParams) this.routerParams.unsubscribe();
        this.routerParams = this.route.params
          .pipe(
            filter((p) => !('id' in p) || p.id !== 'upload'),
            take(1)
          )
          .subscribe((p) => {
            if (!this.config) return;

            if (this.modalService.getModalsCount() !== 0) return;

            if (p.id) {
              let button: IButton | undefined;
              const id = p.id;
              const filename =
                (p.id as string).indexOf('.') >= 0
                  ? p.id.split('.').slice(0, -1).join('.') + '.webm'
                  : p.id + '.webm';
              this.config.buttonGroups?.forEach((group) => {
                button ??= group.buttons.find((btn) => btn.id === id);
                button ??= group.buttons.find((btn) => btn.filename === filename);
              });

              if (button) {
                this.showDetail(button);

                const buttonName = button.text || filename;

                this.SEOService.setTitle(`${buttonName} | ${this.config.fullName} | Sound Buttons`);
                this.SEOService.setUrl(`${this.origin}/${this.config.name}/${button.id}`);
              }
            } else {
              this.SEOService.setTitle(config.fullName + ' | Sound Buttons');
              this.SEOService.setUrl(`${this.origin}/${config.name}`);
              this.SEOService.setImage(`${this.origin}/assets/img/preview/${config.name}.png`);
            }
          });
      }
    });
  }

  private showDetail(button: IButton | undefined) {
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
    }
  }

  ngOnDestroy(): void {
    this.configSubscription?.unsubscribe();
  }
}
