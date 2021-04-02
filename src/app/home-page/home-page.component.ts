import { Observable } from 'rxjs';
import { IFullConfig, ConfigService } from './../config.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public configs$!: Observable<IFullConfig[]>;

  constructor(
    private configService: ConfigService
  ) { }

  ngOnInit(): void {
    this.configs$ = this.configService.getBriefConfig();
  }
}

