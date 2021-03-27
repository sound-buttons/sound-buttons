import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { iButtonGroup } from './ButtonGroup';
import { Button } from './Buttons';

@Component({
  selector: 'app-sound-buttons',
  templateUrl: './sound-buttons.component.html',
  styleUrls: ['./sound-buttons.component.scss']
})
export class SoundButtonsComponent implements OnInit {
  @Input() buttonGroups: iButtonGroup[] = [];
  youtubeEmbedLink: SafeResourceUrl = '';
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  buttonClick($event: MouseEvent, btn: Button): void {
    btn.click($event);
    console.log(btn);

    const url = btn.source ?? '';
    if (url && url.startsWith('https://www.youtube.com/embed/')) {
      this.youtubeEmbedLink = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.youtubeEmbedLink = '';
    }

  }

}
