import { AudioService } from './../services/audio.service';
import { LanguageService } from '../services/language.service';

export const defaultBaseRoute = 'assets/sound/';

export class Button implements IButton {
  constructor(
    private audioService: AudioService,
    public filename: string,
    public text: string | any = filename,
    public baseRoute = defaultBaseRoute,
    public volume = 1,
    public source?: ISource,
    public SASToken?: string,
  ) {
    // 套用text中的多語系
    if (typeof (this.text) !== 'string') {
      // tslint:disable-next-line: variable-name
      this.text = LanguageService.GetTextFromObject(this.text);
    }

    if (!this.SASToken) {
      this.SASToken = '';
    }
  }

  // tslint:disable-next-line: variable-name
  click = ($event: MouseEvent) => {
    if (this.baseRoute.slice(-1) !== '/') {
      this.baseRoute += '/';
    }
    this.audioService.add(`${this.baseRoute}${this.filename}${this.SASToken}`, this.source, this.volume);
  };
}

export interface IButton {
  filename: string;
  text: string | any;
  baseRoute: string;
  volume: number;
  source?: ISource;
  SASToken?: string;
  click($event: MouseEvent): void;
}

export interface ISource {
  videoId: string;
  start: number;
  end: number;
}
