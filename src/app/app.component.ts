import { Component } from '@angular/core';
import { Buttons } from './Buttons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sound-buttons';
  buttons = [
    new Buttons('a', 'Windows Background.wav'),
    new Buttons('b', 'Windows Foreground.wav'),
    new Buttons('b', 'Windows Logon.wav'),
    new Buttons('b', 'Windows Message Nudge.wav'),
    new Buttons('b', 'Windows Notify Calendar.wav'),
    new Buttons('b', 'Windows Notify Email.wav')
  ];
}
