// Capabilities: right-click-context-menu, sharing.
// Behaviour-preservation harness for the Angular CDK Overlay based context menu.
// Assertions mirror the scenarios in openspec/specs/right-click-context-menu/spec.md
// (and the share delegations described in openspec/specs/sharing/spec.md).

import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import mime from 'mime';

import { ContextMenuComponent } from './context-menu.component';
import { CONTEXT_MENU_DATA, ContextMenuRef } from './context-menu.tokens';
import { DialogService } from '../../services/dialog.service';
import { ShareService } from '../../services/share.service';
import { IButton } from '../Buttons';
import { makeButton, makeSource } from '../../../testing/fixtures';
import {
  translateTestingImports,
  makeDialogServiceSpy,
  DialogServiceSpy,
} from '../../../testing/angular';
import { spyWindowOpen } from '../../../testing/fakes';

describe('ContextMenuComponent', () => {
  let fixture: ComponentFixture<ContextMenuComponent>;
  let comp: ContextMenuComponent;
  let menuRef: jasmine.SpyObj<ContextMenuRef>;
  let share: jasmine.SpyObj<ShareService>;
  let dialog: DialogServiceSpy;

  afterEach(() => {
    fixture?.destroy();
  });

  function setup(button: IButton = makeButton()): ComponentFixture<ContextMenuComponent> {
    menuRef = jasmine.createSpyObj<ContextMenuRef>('ContextMenuRef', ['dispose']);
    share = jasmine.createSpyObj<ShareService>('ShareService', [
      'copyLink',
      'generateYoutubeLink',
      'copyYoutubeLink',
      'shareToMastodon',
      'shareToTwitter',
      'shareToFacebook',
    ]);
    dialog = makeDialogServiceSpy();

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ...translateTestingImports()],
      declarations: [ContextMenuComponent],
      providers: [
        { provide: CONTEXT_MENU_DATA, useValue: button },
        { provide: ContextMenuRef, useValue: menuRef },
        { provide: DialogService, useValue: dialog },
        { provide: ShareService, useValue: share },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(ContextMenuComponent);
    comp = fixture.componentInstance;
    return fixture;
  }

  // --- Requirement: Context menu trigger and context binding ---

  // Scenario: Right-clicking a sound button (the clicked button is the menu context)
  it('reads its target button from the CONTEXT_MENU_DATA token', () => {
    const button = makeButton({ id: 'ctx-id', text: 'Ctx' });
    setup(button);
    expect(comp.button).toBe(button);
  });

  // --- Requirement: Menu open/close animation ---

  // Scenario: Menu fades in on open
  it('starts in the "enter" animation state so the menu fades in on open', () => {
    setup();
    expect(comp.animationState).toBe('enter');
  });

  // Scenario: Menu fades out on close, then the overlay is disposed when the animation completes
  it('close() switches to the "exit" state and disposal happens only after the exit animation done', () => {
    setup();
    comp.close();
    expect(comp.animationState).toBe('exit');
    // Disposal is deferred to the animation-done handler.
    expect(menuRef.dispose).not.toHaveBeenCalled();

    // The enter-animation completion must NOT dispose the overlay.
    comp.onAnimationDone({ toState: 'enter' } as unknown as never);
    expect(menuRef.dispose).not.toHaveBeenCalled();

    // The exit-animation completion disposes the hosting overlay.
    comp.onAnimationDone({ toState: 'exit' } as unknown as never);
    expect(menuRef.dispose).toHaveBeenCalledTimes(1);
  });

  // --- Requirement: Closing behaviour after actions ---

  // Scenario: An outside click closes the menu
  it('closes on an outside document click', () => {
    setup();
    comp.onDocumentClick();
    expect(comp.animationState).toBe('exit');
  });

  // Scenario: Escape closes the menu
  it('closes on Escape', () => {
    setup();
    comp.onEscape();
    expect(comp.animationState).toBe('exit');
  });

  // Scenario: Action closes the menu (close() -> fade-out -> overlay disposed)
  it('close() requests the fade-out that ends in overlay disposal', () => {
    setup();
    comp.close();
    comp.onAnimationDone({ toState: 'exit' } as unknown as never);
    expect(menuRef.dispose).toHaveBeenCalledTimes(1);
  });

  // --- Requirement: Always-available menu items ---

  // Scenario: Copy button link
  it('copyLink() delegates to shareService.copyLink and then closes', () => {
    const button = makeButton();
    setup(button);
    comp.copyLink();
    expect(share.copyLink).toHaveBeenCalledOnceWith(button);
    expect(comp.animationState).toBe('exit');
  });

  // --- Requirement: YouTube source items (conditional visibility) ---

  // Scenario: Copy YouTube link
  it('copyYoutubeLink() delegates to shareService.copyYoutubeLink and closes', () => {
    const button = makeButton({ source: makeSource() });
    setup(button);
    comp.copyYoutubeLink();
    expect(share.copyYoutubeLink).toHaveBeenCalledOnceWith(button);
    expect(comp.animationState).toBe('exit');
  });

  // Scenario: Watch on YouTube (button with source)
  it('openSource() opens the generated YouTube link and closes when a source exists', () => {
    const button = makeButton({ source: makeSource({ videoId: 'abc', start: 9.9 }) });
    setup(button);
    const openSpy = spyWindowOpen();
    share.generateYoutubeLink.and.returnValue('https://youtu.be/abc?t=9');

    comp.openSource();

    expect(share.generateYoutubeLink).toHaveBeenCalledOnceWith(button);
    expect(openSpy).toHaveBeenCalledOnceWith('https://youtu.be/abc?t=9');
    expect(comp.animationState).toBe('exit');
  });

  // Scenario: Button without a YouTube source (openSource still closes, never opens)
  it('openSource() does not open a window when the button has no source, but still closes', () => {
    setup(makeButton({ source: undefined }));
    const openSpy = spyWindowOpen();

    comp.openSource();

    expect(openSpy).not.toHaveBeenCalled();
    expect(comp.animationState).toBe('exit');
  });

  // --- Requirement: Social share items ---

  // Scenario: Share to 𝕏 (Twitter)
  it('shareToTwitter() delegates to shareService and closes', () => {
    const button = makeButton();
    setup(button);
    comp.shareToTwitter();
    expect(share.shareToTwitter).toHaveBeenCalledOnceWith(button);
    expect(comp.animationState).toBe('exit');
  });

  // Scenario: Share to Mastodon
  it('shareToMastodon() delegates to shareService and closes', () => {
    const button = makeButton();
    setup(button);
    comp.shareToMastodon();
    expect(share.shareToMastodon).toHaveBeenCalledOnceWith(button);
    expect(comp.animationState).toBe('exit');
  });

  // Scenario: Share to Facebook
  it('shareToFacebook() delegates to shareService and closes', () => {
    const button = makeButton();
    setup(button);
    comp.shareToFacebook();
    expect(share.shareToFacebook).toHaveBeenCalledOnceWith(button);
    expect(comp.animationState).toBe('exit');
  });

  // --- Requirement: Audio file download ---

  describe('download()', () => {
    let anchor: HTMLAnchorElement;
    let clickSpy: jasmine.Spy;
    let createElementSpy: jasmine.Spy;
    let createObjectUrlSpy: jasmine.Spy;

    function installDownloadSpies(): void {
      anchor = document.createElement('a');
      clickSpy = spyOn(anchor, 'click');
      const realCreate = document.createElement.bind(document);
      createElementSpy = spyOn(document, 'createElement').and.callFake(
        (tag: string): HTMLElement => (tag === 'a' ? anchor : (realCreate(tag) as HTMLElement))
      );
      createObjectUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:fake-url');
    }

    // Scenario: Downloading a button's audio (immediate toast + close, before fetch resolves)
    it('dispatches fetch(baseRoute+filename+SASToken) and immediately toasts + closes', fakeAsync(() => {
      const button = makeButton({ baseRoute: 'route/', filename: 'hello.webm', SASToken: '?sas' });
      setup(button);
      installDownloadSpies();
      const blob = new Blob(['audio-bytes'], { type: 'video/webm' });
      const fetchSpy = spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(blob),
      } as unknown as Response);

      comp.download();

      // Immediately (before the fetch resolves) the success toast shows and the menu closes.
      expect(fetchSpy).toHaveBeenCalledOnceWith('route/hello.webm?sas');
      expect(dialog.toastSuccess).toHaveBeenCalledOnceWith('已開始下載', '', 2000);
      expect(comp.animationState).toBe('exit');
      // The anchor has not been clicked yet (fetch pending).
      expect(clickSpy).not.toHaveBeenCalled();

      flushMicrotasks();

      // After the fetch resolves the anchor is built and clicked.
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(anchor.download).toBe('hello.webm');
      expect(anchor.href).toContain('blob:fake-url');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    }));

    // Scenario: Blob MIME type prefers mime.getType(filename)
    it('builds the Blob with mime.getType(filename) when known', fakeAsync(() => {
      setup(makeButton({ filename: 'hello.webm' }));
      installDownloadSpies();
      spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(new Blob(['x'], { type: 'application/octet-stream' })),
      } as unknown as Response);

      comp.download();
      flushMicrotasks();

      const built = createObjectUrlSpy.calls.mostRecent().args[0] as Blob;
      expect(built.type).toBe(mime.getType('hello.webm') as string); // 'video/webm'
    }));

    // Scenario: Blob MIME type falls back to response.type when filename has no known type
    it('falls back to response.type when mime.getType(filename) is null', fakeAsync(() => {
      setup(makeButton({ filename: 'clip.zzz' }));
      installDownloadSpies();
      spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(new Blob(['x'], { type: 'application/x-custom' })),
      } as unknown as Response);

      comp.download();
      flushMicrotasks();

      expect(mime.getType('clip.zzz')).toBeNull();
      const built = createObjectUrlSpy.calls.mostRecent().args[0] as Blob;
      expect(built.type).toBe('application/x-custom');
    }));

    // Scenario: Download side effects are independent of the fetch outcome
    it('fires the toast + close immediately and never blocks on the fetch result', fakeAsync(() => {
      setup(makeButton({ filename: 'hello.webm' }));
      installDownloadSpies();
      // Use a fetch that never settles: this pins the observable behaviour that the
      // success toast and menu close happen up front, independently of (and without
      // waiting for) the download response — and that no error handling/anchor click
      // occurs while the request is outstanding. Avoids depending on zone.js
      // unhandled-rejection semantics, which change across Angular versions.
      spyOn(window, 'fetch').and.returnValue(new Promise<Response>(() => undefined));

      expect(() => comp.download()).not.toThrow();
      expect(dialog.toastSuccess).toHaveBeenCalledOnceWith('已開始下載', '', 2000);
      expect(comp.animationState).toBe('exit');

      flushMicrotasks();
      expect(clickSpy).not.toHaveBeenCalled();
    }));
  });

  // --- Requirement: Menu DOM structure and class-based hiding ---

  describe('rendered Bootstrap dropdown markup', () => {
    // Scenario: Bootstrap dropdown markup
    it('renders dropdown-menu show root, 7 dropdown-item rows, and 2 dropdown-divider separators', () => {
      setup(makeButton({ source: makeSource() }));
      fixture.detectChanges();

      const root = fixture.debugElement.query(By.css('div.dropdown-menu'));
      expect(root).not.toBeNull();
      expect(root.nativeElement.classList).toContain('show');

      const items = fixture.debugElement.queryAll(By.css('button.dropdown-item'));
      expect(items.length).toBe(7);

      const dividers = fixture.debugElement.queryAll(By.css('.dropdown-divider'));
      expect(dividers.length).toBe(2);
    });

    // Scenario: Button with a YouTube source -> YouTube divider + items visible (no d-none)
    it('shows the YouTube divider and items when source.videoId is truthy', () => {
      setup(makeButton({ source: makeSource({ videoId: 'present' }) }));
      fixture.detectChanges();

      const youtubeDivider = fixture.debugElement.queryAll(By.css('.dropdown-divider'))[0];
      const items = fixture.debugElement.queryAll(By.css('button.dropdown-item'));
      const copyYoutube = items[2].nativeElement as HTMLElement;
      const watch = items[3].nativeElement as HTMLElement;

      expect(youtubeDivider.nativeElement.classList).not.toContain('d-none');
      expect(copyYoutube.classList).not.toContain('d-none');
      expect(watch.classList).not.toContain('d-none');
    });

    // Scenario: Hiding YouTube items via d-none (hidden, not removed)
    it('hides the YouTube divider and items via d-none when no source.videoId', () => {
      setup(makeButton({ source: undefined }));
      fixture.detectChanges();

      const youtubeDivider = fixture.debugElement.queryAll(By.css('.dropdown-divider'))[0];
      const items = fixture.debugElement.queryAll(By.css('button.dropdown-item'));
      // Items are still present in the DOM (not removed), only class-hidden.
      expect(items.length).toBe(7);
      expect(youtubeDivider.nativeElement.classList).toContain('d-none');
      expect((items[2].nativeElement as HTMLElement).classList).toContain('d-none');
      expect((items[3].nativeElement as HTMLElement).classList).toContain('d-none');
    });
  });

  describe('template click wiring -> service delegation + close', () => {
    function clickItem(index: number): void {
      const items = fixture.debugElement.queryAll(By.css('button.dropdown-item'));
      (items[index].nativeElement as HTMLButtonElement).click();
    }

    // Scenario: Copy button link (clicking the rendered item)
    it('clicking "複製按鈕網址" calls copyLink and closes', () => {
      const button = makeButton({ source: makeSource() });
      setup(button);
      fixture.detectChanges();
      clickItem(0);
      expect(share.copyLink).toHaveBeenCalledOnceWith(button);
      expect(comp.animationState).toBe('exit');
    });

    // Scenario: Copy YouTube link (clicking the rendered item)
    it('clicking "複製 Youtube 網址" calls copyYoutubeLink and closes', () => {
      const button = makeButton({ source: makeSource() });
      setup(button);
      fixture.detectChanges();
      clickItem(2);
      expect(share.copyYoutubeLink).toHaveBeenCalledOnceWith(button);
      expect(comp.animationState).toBe('exit');
    });

    // Scenario: Share to 𝕏 (Twitter) (clicking the rendered item)
    it('clicking the 𝕏 item calls shareToTwitter and closes', () => {
      const button = makeButton({ source: makeSource() });
      setup(button);
      fixture.detectChanges();
      clickItem(4);
      expect(share.shareToTwitter).toHaveBeenCalledOnceWith(button);
      expect(comp.animationState).toBe('exit');
    });

    // Scenario: Share to Mastodon (clicking the rendered item)
    it('clicking the Mastodon item calls shareToMastodon and closes', () => {
      const button = makeButton({ source: makeSource() });
      setup(button);
      fixture.detectChanges();
      clickItem(5);
      expect(share.shareToMastodon).toHaveBeenCalledOnceWith(button);
      expect(comp.animationState).toBe('exit');
    });

    // Scenario: Share to Facebook (clicking the rendered item)
    it('clicking the Facebook item calls shareToFacebook and closes', () => {
      const button = makeButton({ source: makeSource() });
      setup(button);
      fixture.detectChanges();
      clickItem(6);
      expect(share.shareToFacebook).toHaveBeenCalledOnceWith(button);
      expect(comp.animationState).toBe('exit');
    });
  });
});
