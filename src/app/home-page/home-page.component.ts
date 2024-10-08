import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ColorService } from '../services/color.service';
import { ConfigService, IConfig } from '../services/config.service';
import { DisplayService } from '../services/display.service';
import { SEOService } from './../services/seo.service';
import { EnvironmentToken } from '../app.module';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public configs$!: Observable<IConfig[]>;
  origin = '';

  constructor(
    private configService: ConfigService,
    private colorService: ColorService,
    private SEOService: SEOService,
    private displayService: DisplayService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(EnvironmentToken) private env: any
  ) {
    this.origin = this.env.origin;
  }

  ngOnInit(): void {
    this.configs$ = this.configService.getBriefConfig();
    this.configService.resetConfig();

    this.SEOService.setTitle(
      'Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.'
    );
    this.SEOService.setUrl(this.origin);
    this.SEOService.setImage(`${this.origin}/assets/img/preview/open-graph.png`);

    this.displayService.setFilterText('');
  }

  OnMouseEnter($event: MouseEvent, config?: IConfig): void {
    if (!config) return;

    if (config.color) {
      this.colorService.color = config.color;
    }
  }

  OnMouseLeave(): void {
    this.colorService.color = this.colorService.defaultColor;
  }
}
