import { ConfigService } from './../../services/config.service';
import { IButton } from './../Buttons';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding, HostListener } from '@angular/core';
import { MenuComponent, ContextMenuService, MenuPackage } from '@ctrl/ngx-rightclick';
import { AnimationEvent } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'src/app/services/dialog.service';
import * as mime from 'mime';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  animations: [
    trigger('menu', [
      state('enter', style({ opacity: 1 })),
      state('exit, void', style({ opacity: 0 })),
      transition('* => *', animate(250)),
    ]),
  ],
})
export class ContextMenuComponent extends MenuComponent {
  @HostBinding('[@menu]') _state = super._state;
  @HostListener('(@menu.done)') _onAnimationDone($event: AnimationEvent): void {
    super._onAnimationDone($event);
  }
  button: IButton;
  lazy = false;

  constructor(
    public menuPackage: MenuPackage,
    public contextMenuService: ContextMenuService,
    public translate: TranslateService,
    public dialogService: DialogService,
    public configService: ConfigService,
    public shareService: ShareService
  ) {
    super(menuPackage, contextMenuService);
    this.button = menuPackage.context;
  }

  /**
   * IMPORTANT! tell the menu to close, anything passed in here is given to (menuAction)
   *
   * @memberof ContextMenuComponent
   */
  close(): void {
    this.contextMenuService.closeAll();
  }

  copyLink(): void {
    this.shareService.copyLink(this.button);
    this.close();
  }

  download(): void {
    const url = `${this.button.baseRoute}${this.button.filename}${this.button.SASToken}`;

    fetch(url)
      .then((response) => response.blob())
      .then((response) => {
        const file = new Blob([response], {
          type: mime.getType(this.button.filename) ?? response.type,
        });
        const anchor = document.createElement('a');
        anchor.download = this.button.filename;
        anchor.href = window.URL.createObjectURL(file);
        anchor.click();
      });
    this.dialogService.toastSuccess(this.translate.instant('已開始下載'), '', 2000);
    this.close();
  }

  copyYoutubeLink(): void {
    this.shareService.copyYoutubeLink(this.button);
    this.close();
  }

  openSource(): void {
    if (this.button.source) {
      window.open(this.shareService.generateYoutubeLink(this.button));
    }
    this.close();
  }

  shareToMastodon(): void {
    this.shareService.shareToMastodon(this.button);
    this.close();
  }

  shareToTwitter(): void {
    this.shareService.shareToTwitter(this.button);
    this.close();
  }

  shareToFacebook(): void {
    this.shareService.shareToFacebook(this.button);
    this.close();
  }
}
