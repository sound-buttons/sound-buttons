import { AudioService } from './../services/audio.service';
import { LanguageService } from '../services/language.service';

export const defaultBaseRoute = 'assets/sound/';

export class Button implements IButton {
  constructor(
    private audioService: AudioService,
    public filename: string,
    public text: string | never = filename,
    public baseRoute = defaultBaseRoute,
    public volume = 1,
    public source?: ISource,
    public SASToken?: string
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

  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  click = (): void => {
    if (this.baseRoute.slice(-1) !== '/') {
      this.baseRoute += '/';
    }
    this.audioService.add(
      `${this.baseRoute}${this.filename}${this.SASToken}`,
      this.source,
      this.volume
    );
  };
}

export interface IButton {
  filename: string;
  text: string | never;
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
