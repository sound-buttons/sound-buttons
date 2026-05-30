import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { HomePageComponent } from './home-page.component';
import { ColorService, IColor } from '../services/color.service';
import { ConfigService } from '../services/config.service';
import { DisplayService } from '../services/display.service';
import { SEOService } from '../services/seo.service';
import { EnvironmentToken } from '../environment.token';
import { makeBriefConfig, makeColor } from '../../testing/fixtures';

// Capability: homepage-overview.
describe('HomePageComponent', () => {
  let fixture: ComponentFixture<HomePageComponent>;
  let component: HomePageComponent;

  let configService: jasmine.SpyObj<ConfigService>;
  let displayService: jasmine.SpyObj<DisplayService>;
  let seoService: jasmine.SpyObj<SEOService>;

  // A hand-rolled ColorService fake so the property setter is observable.
  let appliedColor: IColor;
  const defaultColor = makeColor({ primary: '#000000', secondary: '#a1a1a1' });
  let colorService: ColorService;

  const origin = 'https://x';

  function setup(configs = [makeBriefConfig()]) {
    appliedColor = defaultColor;
    colorService = {
      defaultColor,
      get color(): IColor {
        return appliedColor;
      },
      set color(v: IColor) {
        appliedColor = v;
      },
    } as unknown as ColorService;

    configService = jasmine.createSpyObj<ConfigService>('ConfigService', [
      'getBriefConfig',
      'resetConfig',
    ]);
    configService.getBriefConfig.and.returnValue(of(configs));

    displayService = jasmine.createSpyObj<DisplayService>('DisplayService', ['setFilterText']);
    seoService = jasmine.createSpyObj<SEOService>('SEOService', [
      'setTitle',
      'setUrl',
      'setImage',
    ]);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomePageComponent],
      providers: [
        { provide: ConfigService, useValue: configService },
        { provide: ColorService, useValue: colorService },
        { provide: DisplayService, useValue: displayService },
        { provide: SEOService, useValue: seoService },
        { provide: EnvironmentToken, useValue: { origin } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    return fixture;
  }

  describe('Requirement: Character card grid', () => {
    it('Scenario: Rendering character cards — one card per config with routerLink, image, fullName', () => {
      const configs = [
        makeBriefConfig({ name: 'alpha', fullName: 'Alpha Chara', imgSrc: 'assets/a.png' }),
        makeBriefConfig({ name: 'beta', fullName: 'Beta Chara', imgSrc: 'assets/b.png' }),
      ];
      setup(configs);
      fixture.detectChanges();

      // The contribute card has no routerLink, so router-linked cards == config count.
      const linkedCards = fixture.debugElement.queryAll(
        By.css('.chara-card[ng-reflect-router-link]')
      );
      expect(linkedCards.length).toBe(2);
      expect(linkedCards[0].attributes['ng-reflect-router-link']).toContain('alpha');
      expect(linkedCards[1].attributes['ng-reflect-router-link']).toContain('beta');

      const headings = fixture.debugElement
        .queryAll(By.css('.chara-card[ng-reflect-router-link] h2'))
        .map((h) => (h.nativeElement as HTMLElement).textContent?.trim());
      expect(headings).toEqual(['Alpha Chara', 'Beta Chara']);

      // The character image component receives the config's imgSrc.
      const images = fixture.debugElement.queryAll(By.css('app-chara-image'));
      expect(images.length).toBe(2);
      // app-chara-image is stubbed via CUSTOM_ELEMENTS_SCHEMA, so read the bound
      // input through debugElement.properties rather than a reflected attribute.
      expect(images[0].properties['imgs']).toContain('assets/a.png');
    });

    it('Scenario: Color background block — colored by config.color secondary when color present', () => {
      const withColor = makeBriefConfig({ name: 'c', color: makeColor({ secondary: '#445566' }) });
      const noColor = makeBriefConfig({ name: 'd', color: undefined });
      setup([withColor, noColor]);
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('.chara-card[ng-reflect-router-link]'));
      const firstBg = cards[0].query(By.css('.background'));
      const secondBg = cards[1].query(By.css('.background'));

      expect(firstBg).not.toBeNull();
      expect((firstBg.nativeElement as HTMLElement).style.backgroundColor).toBe(
        'rgb(68, 85, 102)'
      );
      expect(secondBg).toBeNull();
    });
  });

  describe('Requirement: Hover theming', () => {
    it('Scenario: Hovering a card — applies config.color as active theme', () => {
      setup();
      const config = makeBriefConfig({ color: makeColor({ primary: '#111', secondary: '#222' }) });
      component.OnMouseEnter(new MouseEvent('mouseenter'), config);
      expect(appliedColor).toEqual(config.color!);
    });

    it('Scenario: Hovering a card with no color — leaves theme unchanged', () => {
      setup();
      component.OnMouseEnter(new MouseEvent('mouseenter'), makeBriefConfig({ color: undefined }));
      expect(appliedColor).toBe(defaultColor);
    });

    it('Scenario: Hovering the contribute card (no config) — does nothing', () => {
      setup();
      component.OnMouseEnter(new MouseEvent('mouseenter'), undefined);
      expect(appliedColor).toBe(defaultColor);
    });

    it('Scenario: Leaving a card — reverts theme to colorService.defaultColor', () => {
      setup();
      appliedColor = makeColor({ primary: '#999', secondary: '#888' });
      component.OnMouseLeave();
      expect(appliedColor).toBe(defaultColor);
    });
  });

  describe('Requirement: Contribute card', () => {
    it('Scenario: Contribute card link — gray ？？？ card links to configs discussions', () => {
      setup();
      fixture.detectChanges();

      const anchor = fixture.debugElement.query(
        By.css('a[href="https://github.com/sound-buttons/sound-buttons_configs/discussions/2"]')
      );
      expect(anchor).not.toBeNull();
      expect((anchor.nativeElement as HTMLAnchorElement).target).toBe('_blank');
      expect((anchor.nativeElement as HTMLAnchorElement).rel).toBe('noopener');

      const card = anchor.query(By.css('.chara-card'));
      expect((card.query(By.css('h2')).nativeElement as HTMLElement).textContent?.trim()).toBe(
        '？？？'
      );
      expect((card.query(By.css('.background')).nativeElement as HTMLElement).style.backgroundColor).toBe(
        'rgb(119, 119, 119)'
      );
    });
  });

  describe('Requirement: Homepage initialization', () => {
    it('Scenario: Initializing the homepage — loads configs, resets config, sets SEO, clears filter', () => {
      setup();
      fixture.detectChanges();

      expect(configService.getBriefConfig).toHaveBeenCalled();
      expect(configService.resetConfig).toHaveBeenCalled();

      expect(seoService.setTitle).toHaveBeenCalledWith(
        'Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.'
      );
      expect(seoService.setUrl).toHaveBeenCalledWith(origin);
      expect(seoService.setImage).toHaveBeenCalledWith(`${origin}/assets/img/preview/open-graph.png`);

      expect(displayService.setFilterText).toHaveBeenCalledWith('');
    });
  });
});
