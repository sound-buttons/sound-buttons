export const defaultBaseRoute = 'assets/sound/';

export class Button implements iButton {
  constructor(
    public filename: string,
    public text: string = filename,
    public baseRoute = defaultBaseRoute,
    public source?: string
  ) { }

  // tslint:disable-next-line: variable-name
  click($event: MouseEvent): void {
    let url = `${this.baseRoute}${this.filename}`;
    if (url.includes('file.core.windows.net')) {
      url += '&timestamp=' + Date.now();
    }
    new Audio(url)?.play();
  }
}

// tslint:disable-next-line: class-name
export interface iButton {
  filename: string;
  text: string;
  baseRoute: string;
  source?: string;
  click($event: MouseEvent): void;
}
