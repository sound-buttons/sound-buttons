import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Button } from './sound-buttons/Buttons';
import { ButtonGroup, iButtonGroup } from './sound-buttons/ButtonGroup';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  config: iConfig = {
    name: '',
    imgSrc: '',
    intro: '',
    color: '',
    buttonGroups: []
  };
  name = 'template';

  constructor(private http: HttpClient) {
    this.http.get<iConfig[]>('assets/config.json').subscribe((data) => {
      for (const c of data) {
        if (c.name === this.name) {
          this.deepCopyConfigs(c, this.config);
          break;
        }
      }
    });
  }

  private deepCopyConfigs(source: iConfig, target: iConfig): void {
    Object.assign(target, source);
    // 重新new出來賦值，否則由json接進來的button object不會有自訂方法
    const buttonGroups: ButtonGroup[] = [];
    for (const bg of source.buttonGroups) {
      const buttons: Button[] = [];
      for (const b of bg.buttons) {
        // 重點在此處重建Button，這樣才會有click方法屬性
        buttons.push(new Button(b.filename, b.text, b.baseRoute));
      }
      buttonGroups.push(
        new ButtonGroup(bg.name, bg.baseRoute, buttons)
      );
    }
    target.buttonGroups = buttonGroups;
  }
}

// tslint:disable-next-line: class-name
interface iConfig {
  name: string;
  imgSrc: string;
  intro: string;
  color: string;
  buttonGroups: iButtonGroup[];
}
