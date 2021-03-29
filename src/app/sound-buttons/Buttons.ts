export const defaultBaseRoute = 'assets/sound/';

export class Button implements iButton {
  constructor(
    public filename: string,
    public text: string = filename,
    public baseRoute = defaultBaseRoute,
    public source?: string
  ) { }

  // tslint:disable-next-line: variable-name
  click = ($event: MouseEvent) =>
    new Audio(`${this.baseRoute}${this.filename}`)?.play();
}

// tslint:disable-next-line: class-name
export interface iButton {
  filename: string;
  text: string;
  baseRoute: string;
  source?: string;
  click($event: MouseEvent): void;
}
