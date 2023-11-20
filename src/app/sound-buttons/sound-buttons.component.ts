import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as tocbot from 'tocbot';
import { IButtonGroup } from './ButtonGroup';
import { IButton } from './Buttons';
import { EnvironmentToken } from '../app.module';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ButtonFilterPipe } from './../pipe/button-filter.pipe';
import { DisplayService } from './../services/display.service';
import { ConfigService } from './../services/config.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-sound-buttons',
  templateUrl: './sound-buttons.component.html',
  styleUrls: ['./sound-buttons.component.scss'],
})
export class SoundButtonsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() buttonGroups: IButtonGroup[] = [];
  filterText = '';
  origin = '';
  menu = ContextMenuComponent;

  constructor(
    private displayService: DisplayService,
    private buttonFilterPipe: ButtonFilterPipe,
    private audioService: AudioService,
    private configService: ConfigService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(EnvironmentToken) private env: any
  ) {
    this.origin = this.env.origin;
  }

  ngOnInit(): void {
    this.filterText = this.displayService.getFilterText();

    this.displayService.OnConfigChanged.pipe(takeUntil(this.destroy$)).subscribe((filterText) => {
      this.filterText = filterText;
      this.tocRefresh();
    });

    this.configService.OnConfigChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.tocRefresh();
    });
  }

  private tocSetting = () => {
    return {
      tocSelector: '#toc',
      contentSelector: 'app-sound-buttons',
      headingSelector: 'h2',
      scrollSmooth: false,
      basePath: window.location.pathname + window.location.search,
      hasInnerContainers: true,
      disableTocScrollSync: true,
      activeLinkClass: 'active',
    };
  };

  private tocRefresh() {
    setTimeout(() => {
      tocbot.refresh(this.tocSetting());
    }, 0);
  }

  buttonClick($event: MouseEvent, btn: IButton): void {
    this.audioService.add(btn);
    if (!this.audioService.isPaused() && !this.audioService.isPlaying()) this.audioService.play();
  }

  gridColumnLen(str: string): number {
    // eslint-disable-next-line no-control-regex
    let len: number = str.replace(/[^\x00-\xff]/g, 'xx').length;
    len = Math.ceil(len / 2) + 5;
    len = len > 50 ? 50 : len;
    len = len < 10 ? 10 : len;
    return len;
  }

  isFilteredEmpty(): boolean {
    return (
      this.buttonFilterPipe
        .transform(this.buttonGroups, this.filterText)
        .map((group) => group.buttons)
        .reduce((a, b) => a + b.length, 0) === 0
    );
  }

  trackById(_index: number, item: IButton): string {
    return item.id;
  }

  ngAfterViewInit(): void {
    tocbot.init(this.tocSetting());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
