import { LanguageService } from './services/language.service';
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private languageService: LanguageService,
    private cd: ChangeDetectorRef
  ) {
    // 在語系檔更新時強制重新渲染頁面
    this.languageService.localeChanged.subscribe(x => {
      this.cd.detectChanges();
    });
  }
}
