// Capabilities: sound-button-grid, audio-playback.
// Behaviour-preservation harness for the grid component. Assertions mirror the
// scenarios in openspec/specs/sound-button-grid/spec.md and the click-to-play
// flow from openspec/specs/audio-playback/spec.md.

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ContextMenuModule, ContextMenuTriggerDirective } from '@ctrl/ngx-rightclick';
import * as tocbot from 'tocbot';

import { SoundButtonsComponent } from './sound-buttons.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ButtonFilterPipe } from '../pipe/button-filter.pipe';
import { DisplayService } from '../services/display.service';
import { ConfigService } from '../services/config.service';
import { AudioService } from '../services/audio.service';
import { EnvironmentToken } from '../environment.token';
import { IFullConfig } from '../services/config.service';
import { translateTestingImports } from '../../testing/angular';
import { makeButton, makeIButtonGroup } from '../../testing/fixtures';

describe('SoundButtonsComponent', () => {
  let fixture: ComponentFixture<SoundButtonsComponent>;
  let comp: SoundButtonsComponent;
  let displaySpy: jasmine.SpyObj<DisplayService>;
  let configSpy: jasmine.SpyObj<ConfigService>;
  let audioSpy: jasmine.SpyObj<AudioService>;
  let displayChanged: EventEmitter<string>;
  let configChanged: EventEmitter<IFullConfig | undefined>;
  let tocInit: jasmine.Spy;
  let tocRefresh: jasmine.Spy;

  function setup(filterText = ''): void {
    displayChanged = new EventEmitter<string>();
    configChanged = new EventEmitter<IFullConfig | undefined>();

    displaySpy = jasmine.createSpyObj<DisplayService>(
      'DisplayService',
      ['getFilterText', 'setFilterText'],
      { OnConfigChanged: displayChanged }
    );
    displaySpy.getFilterText.and.returnValue(filterText);

    configSpy = jasmine.createSpyObj<ConfigService>(
      'ConfigService',
      [],
      { OnConfigChanged: configChanged }
    );

    audioSpy = jasmine.createSpyObj<AudioService>('AudioService', [
      'add',
      'isPaused',
      'isPlaying',
      'play',
    ]);
    audioSpy.isPaused.and.returnValue(false);
    audioSpy.isPlaying.and.returnValue(false);

    tocInit = spyOn(tocbot, 'init').and.stub();
    tocRefresh = spyOn(tocbot, 'refresh').and.stub();

    TestBed.configureTestingModule({
      imports: [ContextMenuModule, ...translateTestingImports()],
      declarations: [SoundButtonsComponent, ButtonFilterPipe],
      providers: [
        ButtonFilterPipe,
        { provide: DisplayService, useValue: displaySpy },
        { provide: ConfigService, useValue: configSpy },
        { provide: AudioService, useValue: audioSpy },
        {
          provide: EnvironmentToken,
          useValue: { origin: 'https://x', api: 'https://api', version: 'v' },
        },
      ],
    });

    fixture = TestBed.createComponent(SoundButtonsComponent);
    comp = fixture.componentInstance;
  }

  // --- Requirement: Grouped button rendering ---

  // Scenario: Rendering button groups (non-empty cards, reversed buttons, wired triggers)
  it('renders each non-empty group as a card with buttons in reversed order', () => {
    setup();
    comp.buttonGroups = [
      makeIButtonGroup({
        name: 'Group A',
        buttons: [
          makeButton({ id: 'a', text: 'A' }),
          makeButton({ id: 'b', text: 'B' }),
          makeButton({ id: 'c', text: 'C' }),
        ],
      }),
    ];
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.card'));
    expect(cards.length).toBe(1);
    expect(cards[0].query(By.css('h2')).nativeElement.textContent).toContain('Group A');

    const labels = fixture.debugElement
      .queryAll(By.css('button.btn-primary'))
      .map((d) => (d.nativeElement.textContent as string).trim());
    // buttons.slice().reverse() => C, B, A
    expect(labels).toEqual(['C', 'B', 'A']);
  });

  // Scenario: Rendering button groups (right-click trigger wiring with [menuContext])
  it('wires each button with the ContextMenuComponent trigger and its own button as context', () => {
    setup();
    const btnA = makeButton({ id: 'a', text: 'A' });
    comp.buttonGroups = [makeIButtonGroup({ name: 'Group A', buttons: [btnA] })];
    fixture.detectChanges();

    expect(comp.menu).toBe(ContextMenuComponent);

    const triggers = fixture.debugElement.queryAll(By.directive(ContextMenuTriggerDirective));
    expect(triggers.length).toBe(1);
    const directive = triggers[0].injector.get(ContextMenuTriggerDirective);
    expect(directive.contextMenuTrigger).toBe(ContextMenuComponent);
    expect(directive.menuContext).toBe(btnA);
  });

  // Scenario: Hiding empty group cards
  it('hides a group card whose buttons list is empty', () => {
    setup();
    comp.buttonGroups = [
      makeIButtonGroup({ name: 'Empty', buttons: [] }),
      makeIButtonGroup({ name: 'Full', buttons: [makeButton({ id: 'x', text: 'X' })] }),
    ];
    fixture.detectChanges();

    const headings = fixture.debugElement
      .queryAll(By.css('h2.card-header'))
      .map((d) => (d.nativeElement.textContent as string).trim());
    expect(headings).toEqual(['Full']);
  });

  // Scenario: Empty group objects retained by pipe but hidden in DOM (filter empties a group)
  it('hides group cards emptied by the filter while keeping matching ones', () => {
    setup('Apple');
    comp.buttonGroups = [
      makeIButtonGroup({
        name: 'Group A',
        buttons: [makeButton({ id: 'a', text: 'Apple' }), makeButton({ id: 'b', text: 'Banana' })],
      }),
      makeIButtonGroup({
        name: 'Group B',
        buttons: [makeButton({ id: 'c', text: 'Cherry' })],
      }),
    ];
    fixture.detectChanges();

    const headings = fixture.debugElement
      .queryAll(By.css('h2.card-header'))
      .map((d) => (d.nativeElement.textContent as string).trim());
    // Only Group A retains a matching button; Group B is emptied and hidden.
    expect(headings).toEqual(['Group A']);
    const labels = fixture.debugElement
      .queryAll(By.css('button.btn-primary'))
      .map((d) => (d.nativeElement.textContent as string).trim());
    expect(labels).toEqual(['Apple']);
  });

  // --- Requirement: Text search/filter (no-results message) ---

  // Scenario: No-results message
  it('shows the 沒有符合條件的按鈕 alert when the filter matches nothing', () => {
    setup('ZZZ-no-match');
    comp.buttonGroups = [
      makeIButtonGroup({ name: 'Group A', buttons: [makeButton({ id: 'a', text: 'Apple' })] }),
    ];
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('.alert.alert-warning'));
    expect(alert).not.toBeNull();
    expect(comp.isFilteredEmpty()).toBeTrue();
  });

  it('does not show the no-results alert when at least one button matches', () => {
    setup();
    comp.buttonGroups = [
      makeIButtonGroup({ name: 'Group A', buttons: [makeButton({ id: 'a', text: 'Apple' })] }),
    ];
    comp.filterText = '';
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.alert.alert-warning'))).toBeNull();
    expect(comp.isFilteredEmpty()).toBeFalse();
  });

  // --- Requirement: Per-button grid column span ---

  // Scenario: Computing a button's span (ceil(adjustedLen/2)+5 clamped to [10,50])
  describe('gridColumnLen', () => {
    it('clamps short labels to the minimum of 10', () => {
      setup();
      // 'Hello' => len 5 => ceil(5/2)+5 = 8 => clamped up to 10
      expect(comp.gridColumnLen('Hello')).toBe(10);
    });

    it('treats non-single-byte characters as 2 bytes each', () => {
      setup();
      // '哈囉' => 'xxxx' (len 4) => ceil(4/2)+5 = 7 => clamped to 10
      expect(comp.gridColumnLen('哈囉')).toBe(10);
    });

    it('returns the computed value when within range', () => {
      setup();
      // 12 ascii chars => ceil(12/2)+5 = 11
      expect(comp.gridColumnLen('a'.repeat(12))).toBe(11);
    });

    it('clamps long labels to the maximum of 50', () => {
      setup();
      // 200 ascii chars => ceil(200/2)+5 = 105 => clamped down to 50
      expect(comp.gridColumnLen('a'.repeat(200))).toBe(50);
    });
  });

  // --- Requirement: Sequential single-clip playback queue (click-to-play flow) ---

  describe('buttonClick (audio-playback)', () => {
    const evt = new MouseEvent('click');

    // Scenario: Click-to-play flow (plays only when neither paused nor playing)
    it('adds the button and plays when neither paused nor playing', () => {
      setup();
      audioSpy.isPaused.and.returnValue(false);
      audioSpy.isPlaying.and.returnValue(false);
      const btn = makeButton({ id: 'p' });

      comp.buttonClick(evt, btn);

      expect(audioSpy.add).toHaveBeenCalledOnceWith(btn);
      expect(audioSpy.play).toHaveBeenCalledTimes(1);
    });

    it('adds but does not play when already paused', () => {
      setup();
      audioSpy.isPaused.and.returnValue(true);
      audioSpy.isPlaying.and.returnValue(false);

      comp.buttonClick(evt, makeButton());

      expect(audioSpy.add).toHaveBeenCalledTimes(1);
      expect(audioSpy.play).not.toHaveBeenCalled();
    });

    it('adds but does not play when already playing', () => {
      setup();
      audioSpy.isPaused.and.returnValue(false);
      audioSpy.isPlaying.and.returnValue(true);

      comp.buttonClick(evt, makeButton());

      expect(audioSpy.add).toHaveBeenCalledTimes(1);
      expect(audioSpy.play).not.toHaveBeenCalled();
    });

    // Clicking the rendered button triggers buttonClick with that button.
    it('clicking a rendered button calls buttonClick -> audioService.add', () => {
      setup();
      audioSpy.isPaused.and.returnValue(false);
      audioSpy.isPlaying.and.returnValue(false);
      const btn = makeButton({ id: 'dom', text: 'DomBtn' });
      comp.buttonGroups = [makeIButtonGroup({ name: 'G', buttons: [btn] })];
      fixture.detectChanges();

      (fixture.debugElement.query(By.css('button.btn-primary')).nativeElement as HTMLButtonElement).click();

      expect(audioSpy.add).toHaveBeenCalledOnceWith(btn);
      expect(audioSpy.play).toHaveBeenCalledTimes(1);
    });
  });

  // --- Requirement: Table-of-contents navigation ---

  // Scenario: Initializing the TOC
  it('initializes tocbot on ngAfterViewInit with the expected settings', () => {
    setup();
    fixture.detectChanges(); // triggers ngAfterViewInit via lifecycle

    expect(tocInit).toHaveBeenCalled();
    const settings = tocInit.calls.mostRecent().args[0] as Record<string, unknown>;
    expect(settings.tocSelector).toBe('#toc');
    expect(settings.contentSelector).toBe('app-sound-buttons');
    expect(settings.headingSelector).toBe('h2');
    expect(settings.scrollSmooth).toBeFalse();
    expect(settings.headingsOffset).toBe(63);
  });

  // Scenario: Refreshing the TOC on changes (display service filter change)
  it('refreshes the TOC (deferred) when the display OnConfigChanged fires', fakeAsync(() => {
    setup();
    comp.ngOnInit();
    tocRefresh.calls.reset();

    displayChanged.emit('new-filter');
    expect(tocRefresh).not.toHaveBeenCalled(); // deferred via setTimeout(0)
    tick(0);

    expect(tocRefresh).toHaveBeenCalled();
    expect(comp.filterText).toBe('new-filter');
  }));

  // Scenario: Refreshing the TOC on changes (config change)
  it('refreshes the TOC (deferred) when the config OnConfigChanged fires', fakeAsync(() => {
    setup();
    comp.ngOnInit();
    tocRefresh.calls.reset();

    configChanged.emit(undefined);
    tick(0);

    expect(tocRefresh).toHaveBeenCalled();
  }));

  it('seeds filterText from DisplayService.getFilterText on init', () => {
    setup('seeded');
    comp.ngOnInit();
    expect(comp.filterText).toBe('seeded');
  });

  // --- Helper behaviour ---

  it('trackById returns the button id', () => {
    setup();
    expect(comp.trackById(0, makeButton({ id: 'track-me' }))).toBe('track-me');
  });

  it('exposes origin from the injected environment', () => {
    setup();
    expect(comp.origin).toBe('https://x');
  });
});
