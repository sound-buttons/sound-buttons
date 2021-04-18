import { ConfigService } from './../services/config.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  title = 'Sound Buttons';
  name = '';
  fullName = '';
  isCollapsed = true;
  configSubscription: Subscription | undefined;

  constructor(
    private configService: ConfigService,
    public router: Router) { }

  ngOnInit(): void {
    this.configSubscription = this.configService.OnConfigChanged.subscribe(c => {
      this.name = c?.name ?? '';
      this.fullName = c?.fullName ?? '';
    });
  }

  setLiveUpdate(flag: boolean): void {
    this.configService.isLiveUpdate = flag;
    if (flag) {
      this.router.navigate(['/', this.name], { queryParams: { liveUpdate: '1' } });
    } else {
      this.router.navigate(['/', this.name]);
    }
  }

  ngOnDestroy(): void {
    this.configSubscription?.unsubscribe();
  }

}
