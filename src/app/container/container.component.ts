import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private configService: ConfigService
  ) { }

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? 'template';
    const liveUpdate = this.route.snapshot.queryParamMap.has('liveUpdate');
    this.configService.name = name;
    this.configService.isLiveUpdate = liveUpdate;

    this.configService.OnConfigChanged.subscribe(config => this.config = config);
  }

}
