import { ConfigService, IFullConfig } from './../config.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
    const name = this.route.snapshot.url[0]?.path;
    this.configService.name = name;
    this.configService.OnConfigChanged.subscribe(config => this.config = config);
  }

}
