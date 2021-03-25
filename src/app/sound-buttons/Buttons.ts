export class Button {
  constructor(
    public text: string,
    public filename: string = text,
    private baseRoute = 'assets/sound/') { }

  onclick(event: MouseEvent): void {
    const audio = new Audio(`${this.baseRoute}${this.filename}`);
    audio?.play();
  }
}

export class ButtonGroups {
  constructor(
    public name: string,
    public buttons: Button[]) { }
}
