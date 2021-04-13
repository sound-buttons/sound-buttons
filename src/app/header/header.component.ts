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
  fullName = '';
  isCollapsed = true;

  constructor(
    private configService: ConfigService,
    public router: Router) { }

  ngOnInit(): void {
    this.configService.OnConfigChanged.subscribe(c => {
      this.name = c?.name ?? '';
      this.fullName = c?.fullName ?? '';
    });
  }

  setLiveUpdate(flag: boolean): void {
    this.configService.isLiveUpdate = flag;
    if (flag) {
      this.router.navigate([this.name], { queryParams: { liveUpdate: '' } });
    } else {
      this.router.navigate([this.name]).then(() => location.reload());
    }
  }

}
