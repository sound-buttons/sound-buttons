import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import random from 'random';

import { AudioControlComponent } from './audio-control.component';
import { AudioService } from '../services/audio.service';
import { ClickService } from '../services/click.service';
import { ConfigService } from '../services/config.service';
import { IButton } from '../sound-buttons/Buttons';
import { FakeAudio, installFakeAudio, installGtagSpy } from '../../testing/fakes';
import { makeButton, makeFullConfig, makeIButtonGroup } from '../../testing/fixtures';

// Stub for the right-click directive so we can assert the menu context wiring
// without pulling in the real CDK-overlay context-menu trigger.
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[contextMenuTrigger]',
    standalone: false
})
class StubContextMenuTriggerDirective {
  @Input() contextMenuTrigger: unknown;
  @Input() menuContext: IButton | undefined;
}

// Capability: audio-playback (audio-control UI integrated with the real AudioService).
describe('AudioControlComponent', () => {
  let fixture: ComponentFixture<AudioControlComponent>;
  let component: AudioControlComponent;
  let audioService: AudioService;
  let configService: jasmine.SpyObj<ConfigService>;
  let audioCtl: { created: FakeAudio[]; restore: () => void };

  function setup(configValue = makeFullConfig()) {
    audioCtl = installFakeAudio();
    installGtagSpy();

    const clickSpy = jasmine.createSpyObj<ClickService>('ClickService', [
      'StepClicks',
      'GetClicks',
    ]);
    configService = jasmine.createSpyObj<ConfigService>('ConfigService', [], {
      config: configValue,
    });

    TestBed.configureTestingModule({
      declarations: [AudioControlComponent, StubContextMenuTriggerDirective],
      providers: [
        { provide: ClickService, useValue: clickSpy },
        { provide: AudioService, useClass: AudioService },
        { provide: ConfigService, useValue: configService },
      ],
    });

    fixture = TestBed.createComponent(AudioControlComponent);
    component = fixture.componentInstance;
    audioService = TestBed.inject(AudioService);
    return fixture;
  }

  afterEach(() => audioCtl.restore());

  describe('Requirement: Per-button and global volume', () => {
    it('Scenario: Adjusting global volume — defaults the slider to 0.5 with min0/max1/step0.01', () => {
      setup();
      fixture.detectChanges();

      expect(component.volume).toBe(0.5);
      const input = fixture.debugElement.query(By.css('input[type=range]'))
        .nativeElement as HTMLInputElement;
      expect(input.min).toBe('0');
      expect(input.max).toBe('1');
      expect(input.step).toBe('0.01');
      expect(input.value).toBe('0.5');
    });

    it('Scenario: Effective clip volume — initial 0.5 nowVolume scales queued audio', () => {
      setup();
      fixture.detectChanges(); // ngOnInit applies volume(0.5)

      audioService.add(makeButton({ volume: 1 }));
      expect(audioCtl.created[0].volume).toBeCloseTo(0.5);
    });

    it('Scenario: Adjusting global volume — a slider value of 0 is coerced to 0.0001', () => {
      setup();
      fixture.detectChanges();
      audioService.add(makeButton({ volume: 1 }));

      const input = fixture.debugElement.query(By.css('input[type=range]'))
        .nativeElement as HTMLInputElement;
      input.value = '0';
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // 0 must not zero-out volume permanently; it is coerced to 0.0001.
      expect(audioCtl.created[0].volume).toBeCloseTo(0.0001, 6);
    });
  });

  describe('Requirement: Synchronous queue state predicates (control visibility)', () => {
    it('Scenario: Querying queue state — shuffle shown only when the queue is empty', () => {
      setup();
      fixture.detectChanges();
      expect(audioService.isEmpty()).toBeTrue();
      expect(fixture.debugElement.query(By.css('.bi-collection-play'))).not.toBeNull();

      audioService.add(makeButton());
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.bi-collection-play'))).toBeNull();
    });

    it('Scenario: pause/play controls reflect canPause/canPlay predicates', () => {
      setup();
      fixture.detectChanges();
      // Empty queue: neither play nor pause shown.
      expect(fixture.debugElement.query(By.css('.bi-play-fill'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.bi-pause-fill'))).toBeNull();

      audioService.add(makeButton());
      fixture.detectChanges();
      // Queued and not paused: pause shown, play hidden.
      expect(fixture.debugElement.query(By.css('.bi-pause-fill'))).not.toBeNull();
      expect(fixture.debugElement.query(By.css('.bi-play-fill'))).toBeNull();

      audioService.pause();
      fixture.detectChanges();
      // Paused: play shown, pause hidden.
      expect(fixture.debugElement.query(By.css('.bi-play-fill'))).not.toBeNull();
      expect(fixture.debugElement.query(By.css('.bi-pause-fill'))).toBeNull();
    });

    it('Scenario: Stopping all sounds — the trash control clears the queue', () => {
      setup();
      fixture.detectChanges();
      audioService.add(makeButton());
      audioService.add(makeButton());
      fixture.detectChanges();

      const trash = fixture.debugElement.query(By.css('.bi-trash3'))
        .nativeElement as HTMLElement;
      trash.click();

      expect(audioService.isEmpty()).toBeTrue();
    });
  });

  describe('Requirement: queued-button chips', () => {
    it('renders a chip per queued button with the menu context, removing on click', () => {
      setup();
      fixture.detectChanges();
      audioService.add(makeButton({ id: 'b1', text: 'One' }));
      audioService.add(makeButton({ id: 'b2', text: 'Two' }));
      fixture.detectChanges();

      const chips = fixture.debugElement.queryAll(By.css('.buttonContainer button'));
      expect(chips.map((c) => (c.nativeElement as HTMLElement).textContent?.trim())).toEqual([
        'One',
        'Two',
      ]);

      // Each chip carries the right-click menu context.
      const triggers = fixture.debugElement.queryAll(
        By.directive(StubContextMenuTriggerDirective)
      );
      expect(triggers.length).toBe(2);
      expect((triggers[0].injector.get(StubContextMenuTriggerDirective).menuContext as IButton).id).toBe(
        'b1'
      );

      // Clicking a chip removes that queued button.
      (chips[0].nativeElement as HTMLElement).click();
      fixture.detectChanges();
      expect(audioService.getQueuedButtons().map((b) => b.id)).toEqual(['b2']);
    });
  });

  describe('Requirement: Shuffle playback', () => {
    it('Scenario: Shuffling buttons — excludes 大叫/悲鳴/自肥 groups and enqueues the rest', () => {
      const config = makeFullConfig({
        buttonGroups: [
          makeIButtonGroup({
            name: '普通',
            buttons: [makeButton({ id: 'n1' }), makeButton({ id: 'n2' })],
          }),
          makeIButtonGroup({ name: '大叫組', buttons: [makeButton({ id: 'shout' })] }),
          makeIButtonGroup({ name: '悲鳴組', buttons: [makeButton({ id: 'scream' })] }),
          makeIButtonGroup({ name: '自肥組', buttons: [makeButton({ id: 'self' })] }),
        ],
      });
      setup(config);
      fixture.detectChanges();

      // Deterministic RNG so the test is reproducible; we never assert order.
      spyOn(random, 'int').and.returnValue(0);

      component.OnShuffleClick();

      const ids = audioService.getQueuedButtons().map((b) => b.id);
      expect(new Set(ids)).toEqual(new Set(['n1', 'n2']));
      expect(ids).not.toContain('shout');
      expect(ids).not.toContain('scream');
      expect(ids).not.toContain('self');
    });

    it('OnShuffleClick is a no-op when no config button groups exist', () => {
      setup(makeFullConfig({ buttonGroups: undefined }));
      fixture.detectChanges();
      component.OnShuffleClick();
      expect(audioService.isEmpty()).toBeTrue();
    });
  });
});
