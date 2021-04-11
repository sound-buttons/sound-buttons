import { ConfigService } from './../services/config.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  title = 'Sound Buttons';
  name = '';
  constructor(
    private configService: ConfigService,
    public router: Router) { }

  ngOnInit(): void {
    this.configService.OnConfigChanged.subscribe(c => {
      this.name = c.name;
    });
  }

}
