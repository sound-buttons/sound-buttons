import { iButton, defaultBaseRoute } from './Buttons';

export class ButtonGroup implements iButtonGroup{
  constructor(
    public name: string,
    public baseRoute: string,
    public buttons: iButton[]) {
    if (!this.baseRoute) {
      this.baseRoute = defaultBaseRoute;
    }
    this.buttons.forEach(btn => {
      if (!btn.baseRoute || btn.baseRoute === defaultBaseRoute) {
        btn.baseRoute = this.baseRoute;
      }
    });
  }
}

// tslint:disable-next-line: class-name
export interface iButtonGroup {
  name: string;
  baseRoute: string;
  buttons: iButton[];
}
