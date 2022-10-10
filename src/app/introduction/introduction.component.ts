import { ConfigService } from './../services/config.service';
import { ActivatedRoute } from '@angular/router';
import { IButton } from './../sound-buttons/Buttons';
import { Component, Input, OnInit } from '@angular/core';
import { ILink } from '../services/config.service';
import { ContextMenuComponent } from '../sound-buttons/context-menu/context-menu.component';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss'],
})
export class IntroductionComponent implements OnInit {
  initTime = Date.now();

  @Input() imgs: string[] | string = [];

  @Input() public intro = '';

  @Input() link: ILink | undefined;

  @Input() button: IButton | undefined;

  isLiveUpdate = false;

  menu = ContextMenuComponent;

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
