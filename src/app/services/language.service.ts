import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // 取得語系前兩碼
  static BrowserLanguage = (navigator.language || navigator.languages[0]).match(/^([^-_]*)/)?.pop() ?? 'zh';

  private localeStringsObject: object = {};
  public localeChanged = new EventEmitter();

  constructor(
    private http: HttpClient
  ) {
    console.log('Locale:', LanguageService.BrowserLanguage);

    // 排除預設語系(中文)
    if (LanguageService.BrowserLanguage === 'zh') {
      return;
    }

    this.http.get<object>(`locale/${LanguageService.BrowserLanguage}.json`).subscribe(x => {
      this.localeStringsObject = x;
      this.localeChanged.emit(x);
    });
  }

  // 傳入一個物件，並回傳此物件中的語言字串
  // Object:
  // {
  //   zh: "中文字",
  //   ja: "日文字"
  // }
  static GetTextFromObject(obj: any = {}): string {
    // tslint:disable-next-line: variable-name
    let _text;
    Object.keys(obj).forEach(key => {
      if (LanguageService.BrowserLanguage.toLowerCase().includes(key)) {
        _text = obj[key] as string;
      }
    });
    return _text ? _text : obj[Object.keys(obj)[0]];
  }

  // 由json語系檔取得對應的字串
  // File ja.json:
  // {
  //   "key": "日文value",
  //   "key2": "日文value2",
  //   ...
  // }
  GetTextFromJson(text: string): string {
    for (const [key, value] of Object.entries(this.localeStringsObject)) {
      if (key === text) {
        return value;
      }
    }
    return text;
  }
}
