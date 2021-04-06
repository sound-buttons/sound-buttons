import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  public defaultColor: IColor = {
    primary: '#000000',
    secondary: '#777777'
  };

  // tslint:disable-next-line: variable-name
  private _color: IColor = this.defaultColor;

  constructor() { }

  public set color(v: IColor) {
    this._color = v;
    // 套用config中的顏色設定
    for (const colorKey in this.color) {
      if (Object.prototype.hasOwnProperty.call(this.color, colorKey)) {
        const color = this.color as any;
        const colorValue = color[colorKey] as string;
        document.documentElement.style.setProperty('--bs-' + colorKey, colorValue);
      }
    }
  }

  public get color(): IColor {
    return this._color;
  }

}

export interface IColor {
  primary: string;
  secondary: string;
}
