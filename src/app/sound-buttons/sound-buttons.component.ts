import { ButtonFilterPipe } from './../pipe/button-filter.pipe';
import { DisplayService } from './../services/display.service';
import { AudioService } from './../services/audio.service';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IButtonGroup } from './ButtonGroup';
import { IButton, ISource } from './Buttons';
import { EnvironmentToken } from '../app.module';
import { ContextMenuComponent } from './context-menu/context-menu.component';

@Component({
  selector: 'app-sound-buttons',
  templateUrl: './sound-buttons.component.html',
  styleUrls: ['./sound-buttons.component.scss'],
})
export class SoundButtonsComponent implements OnInit {
  @Input() buttonGroups: IButtonGroup[] = [];
  displaySet = 0;
  filterText = '';
  origin = '';
  menu = ContextMenuComponent;

  constructor(
    private sanitizer: DomSanitizer,
    private audioService: AudioService,
    private displayService: DisplayService,
    private buttonFilterPipe: ButtonFilterPipe,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(EnvironmentToken) private env: any
  ) {
    this.origin = this.env.origin;
  }

  ngOnInit(): void {
    this.filterText = this.displayService.getFilterText();
    this.displaySet = this.displayService.getDisplay();

    this.displayService.OnConfigChanged.subscribe((p) => {
      this.displaySet = p[0];
      this.filterText = p[1];
    });
  }

  buttonClick($event: MouseEvent, btn: IButton): void {
    btn.click($event);
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
}
