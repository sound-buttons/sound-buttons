import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  static BrowserLanguage = () => navigator.language || (navigator.languages || ['en'])[0];
  static GetTextFromObject(obj: any = {}): string {
    // tslint:disable-next-line: variable-name
    let _text;
    Object.keys(obj).forEach(key => {
      if (this.BrowserLanguage().toLowerCase().includes(key)) {
        _text = obj[key] as string;
      }
    });
    return _text ? _text : obj[Object.keys(obj)[0]];
  }

  constructor() { }
}
