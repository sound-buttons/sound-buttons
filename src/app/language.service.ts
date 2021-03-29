import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  static BrowserLanguage = () => navigator.language || (navigator.languages || ['en'])[0];
  static GetTextFromObject(obj: any = {}): string {
    // tslint:disable-next-line: variable-name
    const _text = obj[this.BrowserLanguage().toLowerCase()] as string;
    return _text ? _text : '';
  }

  constructor() { }
}
