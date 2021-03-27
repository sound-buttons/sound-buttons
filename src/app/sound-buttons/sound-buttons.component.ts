import { Component, Input, OnInit } from '@angular/core';
import { iButtonGroup } from './ButtonGroup';

@Component({
  selector: 'app-sound-buttons',
  templateUrl: './sound-buttons.component.html',
  styleUrls: ['./sound-buttons.component.scss']
})
export class SoundButtonsComponent implements OnInit {
  @Input() buttonGroups: iButtonGroup[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
