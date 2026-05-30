import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding, HostListener, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import mime from 'mime';
import { IButton } from '../Buttons';
import { DialogService } from 'src/app/services/dialog.service';
import { ShareService } from 'src/app/services/share.service';
import { CONTEXT_MENU_DATA, ContextMenuRef } from './context-menu.tokens';

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
  standalone: false,
})
export class ContextMenuComponent {
  /** Drives the fade-in (`enter`) / fade-out (`exit`) host animation. */
  @HostBinding('@menu') animationState: 'enter' | 'exit' = 'enter';

  button: IButton;

  constructor(
    @Inject(CONTEXT_MENU_DATA) button: IButton,
    private menuRef: ContextMenuRef,
    public translate: TranslateService,
    public dialogService: DialogService,
    public shareService: ShareService
  ) {
    this.button = button;
  }

  /** Dispose the hosting overlay once the fade-out animation has finished. */
  @HostListener('@menu.done', ['$event'])
  onAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'exit') {
      this.menuRef.dispose();
    }
  }

  /** Close on an outside click. */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.close();
  }

  /** Close on Escape. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  /**
   * Trigger the fade-out animation; teardown happens in {@link onAnimationDone}.
   *
   * @memberof ContextMenuComponent
   */
  close(): void {
    this.animationState = 'exit';
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
