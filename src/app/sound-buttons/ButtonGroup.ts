import { IButton, defaultBaseRoute } from './Buttons';
import { LanguageService } from '../services/language.service';

export class ButtonGroup implements IButtonGroup {
  constructor(public name: string, public baseRoute: string, public buttons: IButton[]) {
    if (!this.baseRoute) {
      this.baseRoute = defaultBaseRoute;
    }
    this.buttons.forEach((btn) => {
      if (!btn.baseRoute || btn.baseRoute === defaultBaseRoute) {
        if (this.baseRoute.slice(-1) !== '/') {
          this.baseRoute += '/';
        }
        btn.baseRoute = this.baseRoute;
      }
    });

    // 套用name的多語系
    if (typeof this.name !== 'string') {
      this.name = LanguageService.GetTextFromObject(this.name);
    }
  }
}

export interface IButtonGroup {
  name: string;
  baseRoute: string;
  buttons: IButton[];
}
