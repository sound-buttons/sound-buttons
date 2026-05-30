// Capabilities: content-routing-and-seo, privacy-and-analytics.
// Integration tests for the character board container: conditional rendering, route
// parameter handling, deep-link button modal opening (id or derived .webm filename),
// modal content composition, SEO meta tags, URL cleanup, and the sound_play analytics
// event. Assertions exercise REAL behavior, not smoke checks.

import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Params } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';

import { ContainerComponent } from './container.component';
import { ConfigService, IFullConfig } from '../services/config.service';
import { SEOService } from '../services/seo.service';
import { DialogService } from '../services/dialog.service';
import { EnvironmentToken } from '../environment.token';
import { makeDialogServiceSpy, DialogServiceSpy } from '../../testing/angular';
import { installGtagSpy } from '../../testing/fakes';
import { makeButton, makeFullConfig, makeIButtonGroup, makeSource } from '../../testing/fixtures';

const ENV = { origin: 'https://x', api: 'https://api.example', version: 'v' };

describe('ContainerComponent (content-routing-and-seo, privacy-and-analytics)', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;
  let dialogSpy: DialogServiceSpy;
  let configSpy: jasmine.SpyObj<ConfigService>;
  let seoSpy: jasmine.SpyObj<SEOService>;
  let modalSpy: jasmine.SpyObj<BsModalService>;
  let location: Location;
  let gtag: jasmine.Spy;
  let onConfigChanged: EventEmitter<IFullConfig | undefined>;

  let paramMap$: BehaviorSubject<ParamMap>;
  let queryParamMap$: BehaviorSubject<ParamMap>;
  let params$: BehaviorSubject<Params>;

  beforeEach(async () => {
    gtag = installGtagSpy();
    onConfigChanged = new EventEmitter<IFullConfig | undefined>();
    dialogSpy = makeDialogServiceSpy();
    configSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['reloadConfig'], {
      OnConfigChanged: onConfigChanged,
    });
    seoSpy = jasmine.createSpyObj<SEOService>('SEOService', [
      'setTitle',
      'setUrl',
      'setImage',
      'setDescription',
    ]);
    modalSpy = jasmine.createSpyObj<BsModalService>('BsModalService', ['getModalsCount']);
    modalSpy.getModalsCount.and.returnValue(0);

    paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ name: 'template' }));
    queryParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
    params$ = new BehaviorSubject<Params>({ name: 'template' });

    await TestBed.configureTestingModule({
      declarations: [ContainerComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ConfigService, useValue: configSpy },
        { provide: SEOService, useValue: seoSpy },
        { provide: DialogService, useValue: dialogSpy },
        { provide: BsModalService, useValue: modalSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$, queryParamMap: queryParamMap$, params: params$ },
        },
        { provide: EnvironmentToken, useValue: ENV },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerComponent);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);
  });

  // ----- Conditional rendering -----

  it('renders the board content only when a config is present', () => {
    fixture.detectChanges(); // ngOnInit; no config emitted yet
    expect(fixture.nativeElement.querySelector('.d-flex')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-introduction')).toBeNull();

    onConfigChanged.emit(makeFullConfig());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.d-flex')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-introduction')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-sound-buttons')).not.toBeNull();
  });

  it('renders audio-control and scroll-to-top regardless of config', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-audio-control')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-scroll-to-top-button')).not.toBeNull();
  });

  // ----- Route parameter handling -----

  it('Scenario: Selecting the active character — defaults the name param to "template"', () => {
    paramMap$.next(convertToParamMap({})); // no name
    fixture.detectChanges();
    expect((configSpy as unknown as { name: string }).name).toBe('template');

    paramMap$.next(convertToParamMap({ name: 'sup' }));
    expect((configSpy as unknown as { name: string }).name).toBe('sup');
  });

  it('mirrors a liveUpdate query param onto configService.isLiveUpdate', () => {
    fixture.detectChanges();
    queryParamMap$.next(convertToParamMap({ liveUpdate: '1' }));
    expect((configSpy as unknown as { isLiveUpdate: boolean }).isLiveUpdate).toBeTrue();
  });

  it('Scenario: Excluding the upload segment from button lookup', () => {
    const showModalSpy = spyOn(dialogSpy.showModal, 'emit').and.callThrough();
    fixture.detectChanges();
    params$.next({ id: 'upload' }); // excluded by filter(p => p.id !== 'upload')
    onConfigChanged.emit(makeFullConfig());
    expect(component.buttonGuid).toBeUndefined();
    expect(showModalSpy).not.toHaveBeenCalled(); // no button modal opened
    expect(seoSpy.setTitle).toHaveBeenCalled(); // setMeta() path, character (no button)
  });

  // ----- Deep link button modal -----

  it('Scenario: Opening a button modal from a deep link by id — sets meta and emits sound_play', () => {
    const showModalSpy = spyOn(dialogSpy.showModal, 'emit').and.callThrough();
    const config = makeFullConfig({
      name: 'template',
      buttonGroups: [
        makeIButtonGroup({ buttons: [makeButton({ id: 'btn-1', text: 'Hello', source: makeSource() })] }),
      ],
    });

    fixture.detectChanges();
    params$.next({ id: 'btn-1' });
    onConfigChanged.emit(config);

    expect(showModalSpy).toHaveBeenCalled();
    expect(seoSpy.setTitle).toHaveBeenCalledWith(jasmine.stringMatching(/^Hello \| Template Chara \|/));
    expect(seoSpy.setUrl).toHaveBeenCalledWith('https://x/template/btn-1');
    expect(seoSpy.setImage).toHaveBeenCalledWith('https://x/assets/img/preview/template.png');
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'sound_play',
      jasmine.objectContaining({ button: 'btn-1', name: 'Hello' })
    );
  });

  it('Scenario: Opening a button modal from a deep link by derived .webm filename', () => {
    const showModalSpy = spyOn(dialogSpy.showModal, 'emit').and.callThrough();
    const config = makeFullConfig({
      buttonGroups: [
        makeIButtonGroup({ buttons: [makeButton({ id: 'btn-1', filename: 'hello.webm' })] }),
      ],
    });

    fixture.detectChanges();
    params$.next({ id: 'hello' }); // -> derived filename 'hello.webm'
    onConfigChanged.emit(config);

    expect(showModalSpy).toHaveBeenCalled();
  });

  it('Scenario: Button not found — does not open a modal or emit analytics', () => {
    const showModalSpy = spyOn(dialogSpy.showModal, 'emit').and.callThrough();
    fixture.detectChanges();
    params$.next({ id: 'no-such-button' });
    onConfigChanged.emit(makeFullConfig());

    expect(showModalSpy).not.toHaveBeenCalled();
    expect(gtag).not.toHaveBeenCalledWith('event', 'sound_play', jasmine.anything());
  });

  // ----- Modal content composition -----

  it('Scenario: Modal content audio source — src is baseRoute+filename+SASToken', () => {
    let payload: { title: string; message: string } | undefined;
    dialogSpy.showModal.subscribe((p) => (payload = p));
    const config = makeFullConfig({
      buttonGroups: [
        makeIButtonGroup({
          buttons: [
            makeButton({
              id: 'btn-1',
              baseRoute: 'assets/sound/',
              filename: 'hello.webm',
              SASToken: '?sas',
              source: undefined,
            }),
          ],
        }),
      ],
    });

    fixture.detectChanges();
    params$.next({ id: 'btn-1' });
    onConfigChanged.emit(config);

    expect(payload).toBeDefined();
    expect(payload!.message).toContain('<audio');
    expect(payload!.message).toContain('controls');
    expect(payload!.message).toContain('src="assets/sound/hello.webm?sas"');
    expect(payload!.message).not.toContain('<iframe'); // no source.videoId
  });

  it('falls back to type "audio/webm" when mime cannot resolve the extension', () => {
    let payload: { title: string; message: string } | undefined;
    dialogSpy.showModal.subscribe((p) => (payload = p));
    const config = makeFullConfig({
      buttonGroups: [
        makeIButtonGroup({
          buttons: [makeButton({ id: 'btn-1', filename: 'clip.unknownext', source: undefined })],
        }),
      ],
    });

    fixture.detectChanges();
    params$.next({ id: 'btn-1' });
    onConfigChanged.emit(config);

    expect(payload!.message).toContain('type="audio/webm"');
  });

  it('Scenario: Modal content adds a sandboxed YouTube iframe when the button has a source.videoId', () => {
    let payload: { title: string; message: string } | undefined;
    dialogSpy.showModal.subscribe((p) => (payload = p));
    const config = makeFullConfig({
      buttonGroups: [
        makeIButtonGroup({
          buttons: [makeButton({ id: 'btn-1', source: makeSource({ videoId: 'dQw4w9WgXcQ' }) })],
        }),
      ],
    });

    fixture.detectChanges();
    params$.next({ id: 'btn-1' });
    onConfigChanged.emit(config);

    expect(payload!.message).toContain('<iframe');
    expect(payload!.message).toContain('youtube.com/embed/dQw4w9WgXcQ');
    expect(payload!.message).toContain('sandbox="allow-scripts allow-same-origin allow-presentation"');
    expect(payload!.message).toContain('credentialless');
  });

  // ----- URL cleanup on modal hide -----

  it('Scenario: Cleaning the URL on modal hide — clears the guid, rewrites URL, refreshes meta', () => {
    const goSpy = spyOn(location, 'go');
    const config = makeFullConfig({ name: 'template' });
    config.buttonGroups = [makeIButtonGroup({ buttons: [makeButton({ id: 'btn-1' })] })];

    fixture.detectChanges();
    params$.next({ id: 'btn-1' });
    onConfigChanged.emit(config);
    expect(component.buttonGuid).toBe('btn-1');

    seoSpy.setUrl.calls.reset();
    dialogSpy.onHideModal.emit(); // modal hidden

    expect(component.buttonGuid).toBeUndefined();
    expect(goSpy).toHaveBeenCalled();
    // setMeta() with no button rewrites the canonical character URL.
    expect(seoSpy.setUrl).toHaveBeenCalledWith('https://x/template');
  });

  // ----- Character SEO meta without a selected button -----

  it('Scenario: Character page meta without a selected button', () => {
    fixture.detectChanges();
    onConfigChanged.emit(makeFullConfig({ name: 'template', fullName: 'Template Chara' }));

    expect(seoSpy.setTitle).toHaveBeenCalledWith(jasmine.stringMatching(/^Template Chara \| Sound Buttons -/));
    expect(seoSpy.setUrl).toHaveBeenCalledWith('https://x/template');
    expect(seoSpy.setImage).toHaveBeenCalledWith('https://x/assets/img/preview/template.png');
  });
});
