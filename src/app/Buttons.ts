export class Buttons {
  constructor(
    public text: string,
    public filename: string = text) { }

  onclick(event: MouseEvent): void {
    const audio = new Audio(`../assets/sound/${this.filename}`);
    audio?.play();
  }
}
