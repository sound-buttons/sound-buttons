import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFullConfig, ConfigService } from '../services/config.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {
  config!: IFullConfig;

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.configService.OnConfigChanged.subscribe(config => {
      if (config) {
        this.config = config;
      }
    } );
    this.route.paramMap.subscribe(p => {
      this.configService.name = p.get('name') ?? 'template';
    });
    this.route.queryParamMap.subscribe(q => {
      this.configService.isLiveUpdate = q.has('liveUpdate');
    });
  }
}
