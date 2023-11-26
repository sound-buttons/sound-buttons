import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentToken } from '../app.module';
import { IButton } from '../sound-buttons/Buttons';
import { ConfigService } from './config.service';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  origin: string;

  constructor(
    public translate: TranslateService,
    public dialogService: DialogService,
    public configService: ConfigService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    @Inject(EnvironmentToken) private env: any
  ) {
    this.origin = this.env.origin;
  }

  copyLink(button: IButton): void {
    const url = `${this.origin}${location.pathname}/${button.id}`;
    navigator.clipboard.writeText(url);
    this.dialogService.toastSuccess(this.translate.instant('已複製至剪貼簿'), '', 2000);
  }

  generateYoutubeLink(button: IButton): string | undefined {
    return !button.source
      ? undefined
      : `https://youtu.be/${button.source.videoId}?t=${Math.floor(button.source.start)}`;
  }

  copyYoutubeLink(button: IButton): void {
    if (button.source) {
      navigator.clipboard.writeText(this.generateYoutubeLink(button) || '');
    }
    this.dialogService.toastSuccess(this.translate.instant('已複製至剪貼簿'), '', 2000);
  }

  shareToMastodon(button: IButton): void {
    const url = `${this.origin}${location.pathname}/${encodeURI(button.id)}`;
    window.open(
      `https://toot.kytta.dev/?text=${
        `${encodeURIComponent(
          '#sound_buttons #' + this.configService.config?.fullName ?? this.configService.name
        )}` +
        '%0A' +
        encodeURIComponent(url)
      }`
    );
  }

  shareToTwitter(button: IButton): void {
    const url = `${this.origin}${location.pathname}/${encodeURI(button.id)}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${
        `${encodeURIComponent(
          '#sound_buttons #' + this.configService.config?.fullName ?? this.configService.name
        )}` +
        '%0A' +
        encodeURIComponent(url)
      }`
    );
  }

  shareToFacebook(button: IButton): void {
    const url = `${this.origin}${location.pathname}/${encodeURI(button.id)}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}&hashtag=%23sound_buttons`
    );
  }
}
