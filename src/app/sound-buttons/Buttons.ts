import { LanguageService } from '../services/language.service';

export const defaultBaseRoute = 'assets/sound/';

export class Button implements IButton {
  constructor(
    public id: string,
    public filename: string,
    public text: string | never = filename,
    public baseRoute = defaultBaseRoute,
    public volume = 1,
    public source?: ISource,
    public SASToken?: string,
    public index?: number
  ) {
    // 套用text中的多語系
    if (typeof this.text !== 'string') {
      // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
      this.text = LanguageService.GetTextFromObject(this.text);
    }

    if (!this.SASToken) {
      this.SASToken = '';
    }
  }
}

export interface IButton {
  id: string;
  filename: string;
  text: string | never;
  baseRoute: string;
  volume: number;
  source?: ISource;
  SASToken?: string;
  index?: number;
}

export interface ISource {
  videoId: string;
  start: number;
  end: number;
}
