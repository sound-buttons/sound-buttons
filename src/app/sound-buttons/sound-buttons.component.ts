import { Component, OnInit } from '@angular/core';
import { Button, ButtonGroups } from './Buttons';

@Component({
  selector: 'app-sound-buttons',
  templateUrl: './sound-buttons.component.html',
  styleUrls: ['./sound-buttons.component.scss']
})
export class SoundButtonsComponent implements OnInit {
  buttonGroups = [new ButtonGroups(
    'main',
    [
      new Button('Windows Background.wav'),
      new Button('Windows Foreground.wav'),
      new Button('Windows Logon.wav'),
      new Button('Windows Message Nudge.wav'),
      new Button('Windows Notify Calendar.wav'),
      new Button('Windows Notify Email.wav')
    ]
  )];
  constructor() { }

  ngOnInit(): void {
  }

}
