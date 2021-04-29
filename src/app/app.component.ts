import { LanguageService } from './services/language.service';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(translateService:TranslateService) {
    translateService.use(LanguageService.BrowserLanguage);
  }
}
