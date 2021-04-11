import { LanguageService } from '../services/language.service';

export const defaultBaseRoute = 'assets/sound/';

export class Button implements IButton {
  constructor(
    public filename: string,
    public text: string | any = filename,
    public baseRoute = defaultBaseRoute,
    public source?: ISource,
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

export interface IButton {
  filename: string;
  text: string | any;
  baseRoute: string;
  source?: ISource;
  SASToken?: string;
  click($event: MouseEvent): void;
}

export interface ISource {
  videoId: string;
  start: number;
}
