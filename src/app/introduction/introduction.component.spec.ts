import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';

import { IntroductionComponent } from './introduction.component';
import { AudioService } from '../services/audio.service';
import { ConfigService, ILink } from '../services/config.service';
import { makeButton, makeFullConfig } from '../../testing/fixtures';

// Capability: character-board (introduction panel).
describe('IntroductionComponent', () => {
  let fixture: ComponentFixture<IntroductionComponent>;
  let component: IntroductionComponent;
  let audioService: jasmine.SpyObj<AudioService>;
  let configService: jasmine.SpyObj<ConfigService>;

  function setup(queryParams: Record<string, string> = {}) {
    audioService = jasmine.createSpyObj<AudioService>('AudioService', [
      'add',
      'play',
      'isPaused',
      'isPlaying',
    ]);
    configService = jasmine.createSpyObj<ConfigService>('ConfigService', ['reloadConfig'], {
      config: makeFullConfig({ fullName: 'Chara Full Name' }),
    });

    const queryParamMap: ParamMap = convertToParamMap(queryParams);

    TestBed.configureTestingModule({
      declarations: [IntroductionComponent],
      providers: [
        { provide: AudioService, useValue: audioService },
        { provide: ConfigService, useValue: configService },
        { provide: ActivatedRoute, useValue: { queryParamMap: of(queryParamMap) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(IntroductionComponent);
    component = fixture.componentInstance;
    // icon() reads imgs[0]; provide a realistic image path.
    component.imgs = ['assets/img/chara/main.png'];
    return fixture;
  }

  describe('Requirement: Introduction panel', () => {
    it('Scenario: Rendering social links — shows icons only for provided platforms', () => {
      setup();
      const link: ILink = {
        youtube: 'https://youtube.com/c',
        twitter: 'https://twitter.com/c',
      };
      component.link = link;
      fixture.detectChanges();

      const hrefs = fixture.debugElement
        .queryAll(By.css('.linkIcon'))
        .map((a) => (a.nativeElement as HTMLAnchorElement).getAttribute('href'));
      expect(hrefs).toEqual(['https://youtube.com/c', 'https://twitter.com/c']);
    });

    it('Scenario: Rendering intro text — renders the intro via [innerHTML]', () => {
      setup();
      component.intro = '<b>Hello intro</b>';
      fixture.detectChanges();

      const p = fixture.debugElement.query(By.css('.info p')).nativeElement as HTMLElement;
      // [innerHTML] sanitizes the string but preserves structural markup like <b>.
      expect(p.querySelector('b')).not.toBeNull();
      expect(p.textContent).toContain('Hello intro');
    });

    it('Scenario: Sample button rendered — shown when a button exists and not in live update', () => {
      setup({});
      component.button = makeButton({ text: 'Self intro' });
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.info button'));
      expect(btn).not.toBeNull();
      expect((btn.nativeElement as HTMLElement).textContent?.trim()).toBe('Self intro');
    });

    it('Scenario: Sample button hidden in live update — liveUpdate=1 hides the button', () => {
      setup({ liveUpdate: '1' });
      component.button = makeButton({ text: 'Self intro' });
      fixture.detectChanges();

      expect(component.isLiveUpdate).toBeTrue();
      expect(fixture.debugElement.query(By.css('.info button'))).toBeNull();
    });

    it('renders the resolved fullName heading from the config service', () => {
      setup();
      fixture.detectChanges();
      const h1 = fixture.debugElement.query(By.css('h1')).nativeElement as HTMLElement;
      expect(h1.textContent?.trim()).toBe('Chara Full Name');
    });
  });

  describe('Requirement: Introduction interactions', () => {
    it('Scenario: Playing the sample button — adds and plays when not paused and not playing', () => {
      setup();
      audioService.isPaused.and.returnValue(false);
      audioService.isPlaying.and.returnValue(false);
      const btn = makeButton({ id: 'sample' });

      component.buttonClick(new MouseEvent('click'), btn);

      expect(audioService.add).toHaveBeenCalledWith(btn);
      expect(audioService.play).toHaveBeenCalled();
    });

    it('Scenario: Playing the sample button — does not play when already playing', () => {
      setup();
      audioService.isPaused.and.returnValue(false);
      audioService.isPlaying.and.returnValue(true);

      component.buttonClick(new MouseEvent('click'), makeButton());

      expect(audioService.add).toHaveBeenCalled();
      expect(audioService.play).not.toHaveBeenCalled();
    });

    it('Scenario: Toggling expansion — expanding smooth-scrolls to the top', () => {
      setup();
      const scrollSpy: jasmine.Spy = spyOn(window, 'scroll');

      component.iconClick();
      expect(component.expanded).toBeTrue();
      expect(scrollSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({ top: 0, left: 0, behavior: 'smooth' })
      );

      // Collapsing again does not scroll.
      component.iconClick();
      expect(component.expanded).toBeFalse();
      expect(scrollSpy).toHaveBeenCalledTimes(1);
    });

    it('reloadConfig delegates to ConfigService and refreshes initTime via callback', () => {
      setup();
      configService.reloadConfig.and.callFake((cb?: (r: never) => void) =>
        cb?.(undefined as never)
      );
      const before = component.initTime;

      component.reloadConfig();

      expect(configService.reloadConfig).toHaveBeenCalled();
      expect(component.initTime).toBeGreaterThanOrEqual(before);
    });
  });
});
