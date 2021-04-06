import { ColorService } from './../color.service';
import { Observable } from 'rxjs';
import { ConfigService, IConfig } from './../config.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public configs$!: Observable<IConfig[]>;

  constructor(
    private configService: ConfigService,
    private colorService: ColorService
  ) { }

  ngOnInit(): void {
    this.configs$ = this.configService.getBriefConfig();
  }

  OnMouseEnter($event: MouseEvent, config: IConfig): void {
    if (config.color) {
      this.colorService.color = config.color;
    }
  }

  OnMouseLeave($event: MouseEvent): void {
    this.colorService.color = this.colorService.defaultColor;
  }
}

