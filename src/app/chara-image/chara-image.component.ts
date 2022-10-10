import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chara-image',
  templateUrl: './chara-image.component.html',
  styleUrls: ['./chara-image.component.scss'],
})
export class CharaImageComponent {
  private _imgs: string[] = [];
  nowDisplayImg = 0;

  get imgs(): string[] {
    // // No need to update the cache every time.
    // const imgs = this._imgs;
    // imgs.forEach((img) => {
    //   if (img.includes('file.core.windows.net')) {
    //     img += '&timestamp=' + this.initTime;
    //   }
    // });
    // return imgs;
    return this._imgs;
  }
  @Input() set imgs(v: string[] | string) {
    if (typeof v === 'string') {
      this._imgs = [v];
    } else {
      this._imgs = v;
    }
  }

  constructor() {
    setInterval(() => {
      if (this.nowDisplayImg < this.imgs.length - 1) {
        this.nowDisplayImg++;
      } else {
        this.nowDisplayImg = 0;
      }
    }, 5000);
  }
}
