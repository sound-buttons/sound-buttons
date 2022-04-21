import { LanguageService } from './services/language.service';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(
    translateService: TranslateService,
    private router: Router
  ) {
    translateService.setDefaultLang('zh');
    translateService.use(LanguageService.BrowserLanguage);
    // translateService.use('ja');
  }

  ngOnInit(): void {
    // For GA
    this.router.events
      .pipe(distinctUntilChanged((previous: any, current: any) => {
        if (current instanceof NavigationEnd) {
          return previous.url === current.url;
        }
        return true;
      }))
      .subscribe(
        (x: any) => { gtag('event', 'page_view', { page_path: x.url }); });
  }
}
