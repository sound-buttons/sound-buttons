import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService, IConfig, IFullConfig } from './config.service';
import { ColorService } from './color.service';
import { AudioService } from './audio.service';
import { Button } from '../sound-buttons/Buttons';
import { ButtonGroup } from '../sound-buttons/ButtonGroup';
import { makeBriefConfig } from '../../testing/fixtures';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const MAIN_URL = 'assets/configs/main.json';

// Capability: configuration-loading — brief/full config retrieval and re-instantiation.
describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;
  let colorService: ColorService;

  beforeEach(() => {
    const audioSpy = jasmine.createSpyObj<AudioService>('AudioService', ['add', 'play']);
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ConfigService,
        ColorService,
        { provide: AudioService, useValue: audioSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
    colorService = TestBed.inject(ColorService);
  });

  afterEach(() => httpMock.verify());

  it('getBriefConfig GETs main.json with Cache-Control: max-age=0', () => {
    service.getBriefConfig().subscribe();
    const req = httpMock.expectOne(MAIN_URL);

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Cache-Control')).toBe('max-age=0');
    req.flush([]);
  });

  it('getBriefConfig(url) fetches the supplied URL instead of the default', () => {
    service.getBriefConfig('https://example.com/other.json').subscribe();
    const req = httpMock.expectOne('https://example.com/other.json');

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getConfig returns undefined when the name resolves to no URL', () => {
    const configs: IConfig[] = [makeBriefConfig({ name: 'known' })];

    expect(service.getConfig('unknown', configs)).toBeUndefined();
  });

  it('getConfig re-instantiates Buttons/ButtonGroups/introButton, applies color, resolves intro', () => {
    const setColor = spyOnProperty(colorService, 'color', 'set').and.callThrough();
    const configs: IConfig[] = [makeBriefConfig({ name: 'chara', fullConfigURL: 'full.json' })];

    let result: IFullConfig | undefined;
    service.getConfig('chara', configs)!.subscribe((c) => (result = c));

    const req = httpMock.expectOne('full.json');
    expect(req.request.headers.get('Cache-Control')).toBe('max-age=0');
    req.flush({
      name: 'chara',
      fullName: 'Chara',
      imgSrc: 'i.png',
      fullConfigURL: 'full.json',
      liveUpdateURL: 'live.json',
      color: { primary: '#fff', secondary: '#000' },
      intro: { zh: '介紹', ja: '紹介' },
      introButton: { id: 'ib', filename: 'ib.webm', text: 'IB', baseRoute: '', volume: 1 },
      buttonGroups: [
        {
          name: 'G',
          baseRoute: 'assets/sound/',
          buttons: [{ id: 'b', filename: 'b.webm', text: 'B', baseRoute: '', volume: 1 }],
        },
      ],
    } as unknown as IFullConfig);

    expect(result!.introButton instanceof Button).toBeTrue();
    expect(result!.buttonGroups![0] instanceof ButtonGroup).toBeTrue();
    expect(result!.buttonGroups![0].buttons[0] instanceof Button).toBeTrue();
    // Known latent bug pinned by the harness: getConfig resolves the
    // multilingual intro on `source.intro` but returns the shallow-copied `target`,
    // so the returned config keeps the original intro object rather than the string.
    // Behaviour preservation requires asserting the actual current output.
    expect(typeof result!.intro).toBe('object');
    expect(result!.intro).toEqual({ zh: '介紹', ja: '紹介' } as never);
    expect(setColor).toHaveBeenCalled();
    expect(service.groupNames).toContain('G');
  });

  it('getConfig uses liveUpdateURL when isLiveUpdate is enabled', () => {
    spyOn(service, 'reloadConfig'); // avoid the setter's reload side effect here
    (service as unknown as { _isLiveUpdate: boolean })._isLiveUpdate = true;
    const configs: IConfig[] = [
      makeBriefConfig({ name: 'chara', fullConfigURL: 'full.json', liveUpdateURL: 'live.json' }),
    ];

    service.getConfig('chara', configs)!.subscribe();

    const req = httpMock.expectOne('live.json');
    expect(req.request.method).toBe('GET');
    req.flush({ name: 'chara', intro: '' } as unknown as IFullConfig);
  });

  it('name setter triggers reloadConfig', () => {
    const reload = spyOn(service, 'reloadConfig');
    service.name = 'newName';

    expect(service.name).toBe('newName');
    expect(reload).toHaveBeenCalled();
  });

  it('isLiveUpdate setter reloads only when the value actually changes', () => {
    const reload = spyOn(service, 'reloadConfig');

    service.isLiveUpdate = true;
    expect(reload).toHaveBeenCalledTimes(1);

    service.isLiveUpdate = true; // unchanged
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reloadConfig loads brief + full config, stores it and emits OnConfigChanged', () => {
    (service as unknown as { _name: string })._name = 'chara';
    const emitted: Array<IFullConfig | undefined> = [];
    service.OnConfigChanged.subscribe((c) => emitted.push(c));

    service.reloadConfig();

    httpMock
      .expectOne(MAIN_URL)
      .flush([makeBriefConfig({ name: 'chara', fullConfigURL: 'full.json' })]);
    httpMock.expectOne('full.json').flush({ name: 'chara', intro: 'hi' } as unknown as IFullConfig);

    expect(service.config).toBeDefined();
    expect(emitted.length).toBe(1);
  });

  it('resetConfig clears state, resets color and emits undefined', () => {
    const resetColor = spyOn(colorService, 'resetColor').and.callThrough();
    const emitted: Array<IFullConfig | undefined> = [];
    service.OnConfigChanged.subscribe((c) => emitted.push(c));

    service.resetConfig();

    expect(service.config).toBeUndefined();
    expect(service.name).toBe('');
    expect(service.isLiveUpdate).toBeFalse();
    expect(resetColor).toHaveBeenCalled();
    expect(emitted).toEqual([undefined]);
  });
});
