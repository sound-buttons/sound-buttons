import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { ConfigService, IFullConfig } from '../services/config.service';
import { DisplayService } from '../services/display.service';
import { translateTestingImports } from '../../testing/angular';
import { makeButton, makeFullConfig, makeIButtonGroup } from '../../testing/fixtures';

// Capabilities: sound-button-grid (search input), configuration-loading (config-driven nav).
describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let router: Router;
  let displayService: jasmine.SpyObj<DisplayService>;

  // Hand-rolled ConfigService fake so the isLiveUpdate setter is observable
  // and OnConfigChanged is a real EventEmitter.
  const onConfigChanged = new EventEmitter<IFullConfig | undefined>();
  let liveUpdateValue: boolean;
  let configValue: IFullConfig | undefined;
  let configService: ConfigService;

  function setup(config?: IFullConfig) {
    liveUpdateValue = false;
    configValue = config;
    configService = {
      OnConfigChanged: onConfigChanged,
      get config(): IFullConfig | undefined {
        return configValue;
      },
      get isLiveUpdate(): boolean {
        return liveUpdateValue;
      },
      set isLiveUpdate(v: boolean) {
        liveUpdateValue = v;
      },
    } as unknown as ConfigService;

    displayService = jasmine.createSpyObj<DisplayService>('DisplayService', [
      'setFilterText',
      'getFilterText',
    ]);
    displayService.getFilterText.and.returnValue('');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, ...translateTestingImports()],
      declarations: [HeaderComponent],
      providers: [
        { provide: ConfigService, useValue: configService },
        { provide: DisplayService, useValue: displayService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    return fixture;
  }

  describe('Requirement: Text search/filter on button labels (typeahead source)', () => {
    it('builds the typeahead list from every button text across all groups', () => {
      setup(
        makeFullConfig({
          buttonGroups: [
            makeIButtonGroup({
              buttons: [makeButton({ text: 'Alpha' }), makeButton({ text: 'Beta' })],
            }),
            makeIButtonGroup({ buttons: [makeButton({ text: 'Gamma' })] }),
          ],
        })
      );
      fixture.detectChanges();

      expect(component.getButtonTextList()).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('returns an empty typeahead list when no config is loaded', () => {
      setup(undefined);
      fixture.detectChanges();
      expect(component.getButtonTextList()).toEqual([]);
    });

    it('setFilterText forwards the value, coercing null/undefined to empty string', () => {
      setup();
      fixture.detectChanges();

      component.setFilterText('hello');
      expect(displayService.setFilterText).toHaveBeenCalledWith('hello');

      component.setFilterText(null as unknown as string);
      expect(displayService.setFilterText).toHaveBeenCalledWith('');
    });
  });

  describe('Requirement: config-driven name/fullName via OnConfigChanged', () => {
    it('updates name and fullName when the config changes', () => {
      setup();
      fixture.detectChanges();

      onConfigChanged.emit(makeFullConfig({ name: 'kuro', fullName: 'Kuro Chan' }));
      expect(component.name).toBe('kuro');
      expect(component.fullName).toBe('Kuro Chan');

      onConfigChanged.emit(undefined);
      expect(component.name).toBe('');
      expect(component.fullName).toBe('');
    });
  });

  describe('Requirement: filter visibility and navigation links', () => {
    it('hides the filter input on the upload path and shows it elsewhere', () => {
      setup();
      fixture.detectChanges();
      onConfigChanged.emit(makeFullConfig({ name: 'kuro' }));

      // Non-upload path: filter input present.
      component.window = { location: { pathname: '/kuro' } } as unknown as Window & typeof globalThis;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('#filter-text'))).not.toBeNull();

      // Upload path: filter input hidden.
      component.window = {
        location: { pathname: '/kuro/upload' },
      } as unknown as Window & typeof globalThis;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('#filter-text'))).toBeNull();
    });

    it('shows 投稿 always, 待審核預覧 on upload url, and 回正式版 on liveUpdate url', () => {
      setup();
      const urlSpy = spyOnProperty(router, 'url', 'get').and.returnValue('/kuro');
      fixture.detectChanges();
      onConfigChanged.emit(makeFullConfig({ name: 'kuro' }));
      fixture.detectChanges();

      const linkTexts = () =>
        fixture.debugElement
          .queryAll(By.css('.navbar-nav .nav-link'))
          .map((a) => (a.nativeElement as HTMLElement).textContent?.trim());

      expect(linkTexts()).toContain('投稿');
      expect(linkTexts()).not.toContain('待審核預覧');
      expect(linkTexts()).not.toContain('回正式版');

      urlSpy.and.returnValue('/kuro/upload');
      fixture.detectChanges();
      expect(linkTexts()).toContain('待審核預覧');

      urlSpy.and.returnValue('/kuro?liveUpdate=1');
      fixture.detectChanges();
      expect(linkTexts()).toContain('回正式版');
    });
  });

  describe('Requirement: Live-update navigation (setLiveUpdate)', () => {
    it('enables live update and navigates with liveUpdate=1', () => {
      setup();
      fixture.detectChanges();
      onConfigChanged.emit(makeFullConfig({ name: 'kuro' }));
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

      component.setLiveUpdate(true);

      expect(liveUpdateValue).toBeTrue();
      expect(navSpy).toHaveBeenCalledWith(
        ['/', 'kuro'],
        jasmine.objectContaining({
          queryParams: { liveUpdate: '1' },
          queryParamsHandling: 'merge',
        })
      );
    });

    it('disables live update and clears the liveUpdate query param', () => {
      setup();
      fixture.detectChanges();
      onConfigChanged.emit(makeFullConfig({ name: 'kuro' }));
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

      component.setLiveUpdate(false);

      expect(liveUpdateValue).toBeFalse();
      expect(navSpy).toHaveBeenCalledWith(
        ['/', 'kuro'],
        jasmine.objectContaining({ queryParams: { liveUpdate: null } })
      );
    });
  });
});
