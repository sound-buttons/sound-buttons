import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ColorService } from '../services/color.service';
import { ConfigService, IConfig } from '../services/config.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public configs$!: Observable<IConfig[]>;

  constructor(private configService: ConfigService, private colorService: ColorService) {}

  ngOnInit(): void {
    this.configs$ = this.configService.getBriefConfig();
    this.configService.resetConfig();
  }

  OnMouseEnter($event: MouseEvent, config?: IConfig): void {
    if (!config) return;

    if (config.color) {
      this.colorService.color = config.color;
    }
  }

  OnMouseLeave($event: MouseEvent): void {
    this.colorService.color = this.colorService.defaultColor;
  }
}
