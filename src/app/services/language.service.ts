import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  /**
   * 取得語系前兩碼
   */
  static BrowserLanguage = (navigator.language || navigator.languages[0]).match(/^([^-_]*)/)?.pop() ?? 'zh';

  /**
   * 傳入一個物件，並回傳此物件中的語言字串。若無對應的語言，則傳回第一個語言字串。
   * @param obj \{ zh: "中文字", ja: "日文字" }
   * @returns 取得的語言字串
   */
  static GetTextFromObject(obj: any = {}): string {
    let text;
    Object.keys(obj).forEach(key => {
      if (this.BrowserLanguage.toLowerCase().includes(key)) {
        text = obj[key] as string;
      }
    });
    return text ? text : obj[Object.keys(obj)[0]];
  }
}
