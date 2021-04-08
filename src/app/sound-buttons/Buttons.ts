import { LanguageService } from '../services/language.service';

export const defaultBaseRoute = 'assets/sound/';

export class Button implements iButton {
  constructor(
    public filename: string,
    public text: string | any = filename,
    public baseRoute = defaultBaseRoute,
    public source?: string,
    public SASToken?: string,
  ) {
    // 套用text中的多語系
    if (typeof (this.text) !== 'string') {
      // tslint:disable-next-line: variable-name
      this.text = LanguageService.GetTextFromObject(this.text);
    }
  }

  // tslint:disable-next-line: variable-name
  click = ($event: MouseEvent) => {
    if (this.baseRoute.slice(-1) !== '/') {
      this.baseRoute += '/';
    }
    new Audio(`${this.baseRoute}${this.filename}${this.SASToken}`)?.play();
  };
}

// tslint:disable-next-line: class-name
export interface iButton {
  filename: string;
  text: string | any;
  baseRoute: string;
  source?: string;
  SASToken?: string;
  click($event: MouseEvent): void;
}
