import { LanguageService } from './services/language.service';
import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router, Event, RouterEvent, NavigationStart } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';
import { EnvironmentToken } from './app.module';
import { Subscription } from 'rxjs';
import { ConfigService } from './services/config.service';

declare let gtag: (...arg: unknown[]) => void;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  configSubscription: Subscription | undefined;
  version = '';
  fullName = 'Artists';

  constructor(
    translateService: TranslateService,
    private configService: ConfigService,
    private router: Router,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    @Inject(EnvironmentToken) env: any
  ) {
    translateService.setDefaultLang('zh');
    translateService.use(LanguageService.BrowserLanguage);
    // translateService.use('ja');

    this.version = env.version ? `v.${env.version}` : '';
  }

  ngOnInit(): void {
    // For GA
    this.router.events
      .pipe(
        distinctUntilChanged((previous: Event, current: Event) => {
          if (previous instanceof RouterEvent && current instanceof RouterEvent) {
            return previous.url === current.url;
          }
          return true;
        })
      )
      .subscribe((x: Event) => {
        const url = (x as RouterEvent).url;
        gtag('event', 'page_view', { page_path: url });
        if (url === '/') {
          this.fullName = 'Artists';
        }
      });
    this.configSubscription = this.configService.OnConfigChanged.subscribe((config) => {
      if (config) {
        this.fullName = config.fullName;
      }
    });
  }

  ngOnDestroy(): void {
    this.configSubscription?.unsubscribe();
  }
}
