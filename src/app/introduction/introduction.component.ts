import { ConfigService } from './../services/config.service';
import { ActivatedRoute } from '@angular/router';
import { IButton } from './../sound-buttons/Buttons';
import { Component, Input, OnInit } from '@angular/core';
import { ILink } from '../services/config.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss'],
})
export class IntroductionComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _imgSrc = '';
  initTime = Date.now();

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

  @Input() link: ILink | undefined;

  @Input() button: IButton | undefined;

  isLiveUpdate = false;

  constructor(private route: ActivatedRoute, private configService: ConfigService) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((m) => {
      this.isLiveUpdate = m.get('liveUpdate') === '1';
    });
  }

  reloadConfig(): void {
    this.configService.reloadConfig(() => (this.initTime = Date.now()));
  }
}
