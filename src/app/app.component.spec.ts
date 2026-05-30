import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { EnvironmentToken } from './environment.token';
import { translateTestingImports } from '../testing/angular';
import { installGtagSpy } from '../testing/fakes';

// Capabilities: internationalization (default lang + browser lang), privacy-and-analytics (page_view).
describe('AppComponent', () => {
  let routerEvents: Subject<unknown>;
  let gtag: jasmine.Spy;

  function setup(env: unknown = { version: 'abc1234' }) {
    routerEvents = new Subject();
    gtag = installGtagSpy();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ...translateTestingImports()],
      declarations: [AppComponent],
      providers: [{ provide: EnvironmentToken, useValue: env }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    // Patch the router's events stream so we can drive navigation.
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'events', { get: () => routerEvents });
    return TestBed.createComponent(AppComponent);
  }

  it('creates and sets the default language to zh', () => {
    const fixture = setup();
    const translate = TestBed.inject(TranslateService);
    expect(fixture.componentInstance).toBeTruthy();
    expect(translate.getDefaultLang()).toBe('zh');
  });

  it('exposes the version from the environment', () => {
    const fixture = setup({ version: 'deadbee' });
    expect(fixture.componentInstance.version).toBe('deadbee');
  });

  it('uses an empty version string when env.version is absent', () => {
    const fixture = setup({});
    expect(fixture.componentInstance.version).toBe('');
  });

  it('emits a gtag page_view on navigation, de-duplicated by url', () => {
    const fixture = setup();
    fixture.componentInstance.ngOnInit();

    routerEvents.next(new NavigationEnd(1, '/a', '/a'));
    routerEvents.next(new NavigationEnd(2, '/a', '/a')); // same url -> de-duped
    routerEvents.next(new NavigationEnd(3, '/b', '/b'));

    const pageViews = gtag.calls
      .allArgs()
      .filter((args) => args[0] === 'event' && args[1] === 'page_view');
    expect(pageViews.length).toBe(2);
    expect(pageViews[0][2]).toEqual({ page_path: '/a' });
    expect(pageViews[1][2]).toEqual({ page_path: '/b' });
  });
});
