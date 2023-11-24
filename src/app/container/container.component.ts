import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import * as mime from 'mime';
import { IButton } from './../sound-buttons/Buttons';
import { IFullConfig, ConfigService } from '../services/config.service';
import { SEOService } from './../services/seo.service';
import { DialogService } from './../services/dialog.service';
import { EnvironmentToken } from '../app.module';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit, OnDestroy {
  configSubscription: Subscription | undefined;
  config: IFullConfig | undefined;
  displaySet = 0;
  origin = '';
  buttonGuid: string | undefined = undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
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

    this.route.params.pipe(filter((p) => p.id !== 'upload')).subscribe((p) => {
      this.buttonGuid = p.id;
    });

    this.configSubscription = this.configService.OnConfigChanged.subscribe((config) => {
      this.config = config;
      if (!this.config) return;

      if (this.buttonGuid) {
        if (this.modalService.getModalsCount() !== 0) return;
        let button: IButton | undefined;
        const filename =
          (this.buttonGuid as string).indexOf('.') >= 0
            ? this.buttonGuid.split('.').slice(0, -1).join('.') + '.webm'
            : this.buttonGuid + '.webm';
        this.config.buttonGroups?.forEach((group) => {
          button ??= group.buttons.find((btn) => btn.id === this.buttonGuid);
          button ??= group.buttons.find((btn) => btn.filename === filename);
        });

        if (!button) return;

        this.dialogService.onHideModal.pipe(take(1)).subscribe(() => {
          this.buttonGuid = undefined;
          const url = this.router.createUrlTree(['/', this.config?.name], {
            preserveFragment: true,
            queryParams: { filename: null },
            queryParamsHandling: 'merge',
          });
          this.location.go(url.toString());
          this.setMeta();
        });

        this.showButton(button);
        this.setMeta(button);
      } else {
        this.setMeta();
      }
    });
  }

  private setMeta(button?: IButton) {
    if (!this.config) return;

    this.SEOService.setImage(`${this.origin}/assets/img/preview/${this.config.name}.png`);
    if (button) {
      this.SEOService.setTitle(
        `${button.text || button.filename} | ${this.config.fullName} | Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.`
      );
      this.SEOService.setUrl(`${this.origin}/${this.config.name}/${button.id}`);
    } else {
      this.SEOService.setTitle(this.config.fullName + ' | Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.');
      this.SEOService.setUrl(`${this.origin}/${this.config.name}`);
    }
  }

  private showButton(button: IButton) {
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.classList.add('w-100');

    const source = document.createElement('source');
    source.src = button.baseRoute + button.filename + button.SASToken;
    source.type = mime.getType(button.filename) ?? 'audio/webm';
    audioElement.appendChild(source);

    this.dialogService.showModal.emit({
      title: button.text,
      message: audioElement.outerHTML,
    });

    gtag('event', 'sound_play', {
      page: window.location.pathname,
      button: button.id,
      name: button.text,
    });
  }

  ngOnDestroy(): void {
    this.configSubscription?.unsubscribe();
  }
}
