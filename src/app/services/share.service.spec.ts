import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { ShareService } from './share.service';
import { DialogService } from './dialog.service';
import { ConfigService } from './config.service';
import { EnvironmentToken } from '../environment.token';
import { makeButton, makeSource, makeFullConfig } from '../../testing/fixtures';
import { spyClipboard, spyWindowOpen } from '../../testing/fakes';

// Capabilities: sharing, right-click-context-menu — link generation & social sharing.
describe('ShareService', () => {
  let service: ShareService;
  let dialog: jasmine.SpyObj<DialogService>;
  let config: { config: unknown; name: string };
  let clipboard: jasmine.Spy;
  let openSpy: jasmine.Spy;
  const ORIGIN = 'https://sound-buttons.test';

  beforeEach(() => {
    clipboard = spyClipboard();
    openSpy = spyWindowOpen();
    dialog = jasmine.createSpyObj<DialogService>('DialogService', ['toastSuccess']);
    config = { config: undefined, name: 'CharaName' };
    const translate = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translate.instant.and.callFake((k: string) => k);

    TestBed.configureTestingModule({
      providers: [
        ShareService,
        { provide: TranslateService, useValue: translate },
        { provide: DialogService, useValue: dialog },
        { provide: ConfigService, useValue: config },
        { provide: EnvironmentToken, useValue: { origin: ORIGIN } },
      ],
    });
    service = TestBed.inject(ShareService);
  });

  it('copyLink writes the raw-id URL to the clipboard and toasts success', () => {
    service.copyLink(makeButton({ id: 'my id' }));

    expect(clipboard).toHaveBeenCalledWith(`${ORIGIN}${location.pathname}/my id`);
    expect(dialog.toastSuccess).toHaveBeenCalled();
  });

  it('generateYoutubeLink builds a youtu.be link with floored start, undefined without a source', () => {
    const withSource = makeButton({ source: makeSource({ videoId: 'abc', start: 12.9 }) });
    expect(service.generateYoutubeLink(withSource)).toBe('https://youtu.be/abc?t=12');

    expect(service.generateYoutubeLink(makeButton({ source: undefined }))).toBeUndefined();
  });

  it('copyYoutubeLink copies the youtube link and toasts', () => {
    service.copyYoutubeLink(makeButton({ source: makeSource({ videoId: 'abc', start: 5 }) }));

    expect(clipboard).toHaveBeenCalledWith('https://youtu.be/abc?t=5');
    expect(dialog.toastSuccess).toHaveBeenCalled();
  });

  it('shareToMastodon opens toot.kytta.dev with encoded hashtag text and url', () => {
    config.config = makeFullConfig({ fullName: 'MyChara' });
    service.shareToMastodon(makeButton({ id: 'b1' }));

    const url = openSpy.calls.mostRecent().args[0] as string;
    expect(url).toContain('https://toot.kytta.dev/?text=');
    expect(url).toContain(encodeURIComponent('#sound_buttons #MyChara'));
    expect(url).toContain('%0A');
    expect(url).toContain(encodeURIComponent(`${ORIGIN}${location.pathname}/b1`));
  });

  it('shareToTwitter opens the tweet intent and encodes the button id in the url', () => {
    config.config = makeFullConfig({ fullName: 'MyChara' });
    service.shareToTwitter(makeButton({ id: 'a b' }));

    const url = openSpy.calls.mostRecent().args[0] as string;
    expect(url).toContain('https://twitter.com/intent/tweet?text=');
    expect(url).toContain(encodeURIComponent(`${ORIGIN}${location.pathname}/${encodeURI('a b')}`));
  });

  it('produces "#undefined" hashtag text when there is no config (documented precedence quirk)', () => {
    config.config = undefined;
    service.shareToTwitter(makeButton({ id: 'b1' }));

    const url = openSpy.calls.mostRecent().args[0] as string;
    expect(url).toContain(encodeURIComponent('#sound_buttons #undefined'));
  });

  it('shareToFacebook opens the sharer with the encoded url and no share text', () => {
    service.shareToFacebook(makeButton({ id: 'b1' }));

    const url = openSpy.calls.mostRecent().args[0] as string;
    expect(url).toContain('https://www.facebook.com/sharer/sharer.php?u=');
    expect(url).toContain(encodeURIComponent(`${ORIGIN}${location.pathname}/b1`));
    expect(url).toContain('hashtag=%23sound_buttons');
  });
});
