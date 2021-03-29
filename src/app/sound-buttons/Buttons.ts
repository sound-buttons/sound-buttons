import { LanguageService } from './../language.service';

export const defaultBaseRoute = 'assets/sound/';

export class Button implements iButton {
  constructor(
    public filename: string,
    public text: string | any = filename,
    public baseRoute = defaultBaseRoute,
    public source?: string,
  ) {
    // 套用text中的多語系
    if (typeof (this.text) !== 'string') {
      // tslint:disable-next-line: variable-name
      this.text = LanguageService.GetTextFromObject(this.text);
    }
  }

  // tslint:disable-next-line: variable-name
  click = ($event: MouseEvent) => {
    new Audio(`${this.baseRoute}${this.filename}`)?.play();
  };
}

// tslint:disable-next-line: class-name
export interface iButton {
  filename: string;
  text: string | any;
  baseRoute: string;
  source?: string;
  click($event: MouseEvent): void;
}
