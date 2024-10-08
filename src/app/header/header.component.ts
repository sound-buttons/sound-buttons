import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DisplayService } from './../services/display.service';
import { ConfigService } from './../services/config.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  title = 'Sound Buttons';
  name = '';
  fullName = '';
  isCollapsed = true;
  configSubscription: Subscription | undefined;
  filterText = '';
  window = window;

  constructor(
    private configService: ConfigService,
    public displayService: DisplayService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.configSubscription = this.configService.OnConfigChanged.subscribe((c) => {
      this.name = c?.name ?? '';
      this.fullName = c?.fullName ?? '';
    });
  }

  setLiveUpdate(flag: boolean): void {
    this.configService.isLiveUpdate = flag;
    this.router.navigate(['/', this.name], {
      queryParams: { liveUpdate: flag ? '1' : null },
      queryParamsHandling: 'merge',
    });
  }

  setFilterText(value: string): void {
    this.displayService.setFilterText(value ?? '');
  }

  getButtonTextList = (): string[] =>
    this.configService.config?.buttonGroups?.map((g) => g.buttons.map((b) => b.text)).flat() ?? [];

  ngOnDestroy(): void {
    this.configSubscription?.unsubscribe();
  }
}
