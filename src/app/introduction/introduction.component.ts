import { Component, Input, OnInit, Output } from '@angular/core';

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

  @Input() youtubeLink: string | undefined = '';

  constructor() {
  }

  ngOnInit(): void {
  }

}
