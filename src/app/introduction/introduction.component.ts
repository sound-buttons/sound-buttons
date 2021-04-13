import { IButton } from './../sound-buttons/Buttons';
import { Component, Input, OnInit } from '@angular/core';
import { ILink } from '../services/config.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements OnInit {
  // tslint:disable-next-line: variable-name
  private _imgSrc = '';
  private initTime = Date.now();

  get imgSrc(): string {
    let url = this._imgSrc;
    if (url.includes('file.core.windows.net')) {
      url += '&timestamp=' + this.initTime;
    }
    return url;
  }
  @Input() set imgSrc(v: string) {
    this._imgSrc = v;
  }

  @Input() public intro = '';

  @Input() link: ILink|undefined;

  @Input() button: IButton | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }

}
