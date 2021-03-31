import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ButtonGroup, iButtonGroup } from './sound-buttons/ButtonGroup';
import { Button, iButton } from './sound-buttons/Buttons';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private http: HttpClient
  ) { }

  getConfig(name: string): Observable<IFullConfig> {
    // TODO 由configs中取得config url
    let url = '';
    if (name) {
      url = `assets/configs/${name}.json`;
    } else {
      // 暫時把預設設為tama
      url = 'assets/configs/tama.json';
    }

    return this.http.get<IFullConfig>(url).pipe(
      map(source => {
        // tslint:disable-next-line: prefer-const
        let target = Object.assign({}, source);

        if (source.introButton) {
          const b = source.introButton;
          target.introButton = new Button(b.filename, b.text, b.baseRoute, b.source);
        }

        if (source.buttonGroups) {
          // 重新new出來賦值，否則由json接進來的button object不會有自訂方法
          const buttonGroups: ButtonGroup[] = [];
          for (const bg of source.buttonGroups) {
            const buttons: Button[] = [];
            for (const b of bg.buttons) {
              // 重點在此處重建Button，這樣才會有click方法屬性
              buttons.push(new Button(b.filename, b.text, b.baseRoute, b.source));
            }
            buttonGroups.push(
              new ButtonGroup(bg.name, bg.baseRoute, buttons)
            );
          }
          target.buttonGroups = buttonGroups;
        }
        return target;
      })
    );
  }

  getBriefConfig(url: string): Observable<IConfig[]> {
    return this.http.get<IConfig[]>(url).pipe(
      map(source => {
        const result = [];
        for (const c of source) {
          const config = Object.assign({}, c);
          if (c.introButton) {
            const b = c.introButton;
            config.introButton = new Button(b.filename, b.text, b.baseRoute, b.source);
          }
          result.push(config);
        }
        return result;
      })
    );
  }
}

export interface IFullConfig extends IConfig {
  buttonGroups?: iButtonGroup[];
  color?: {
    primary: string;
    secondary: string;
  };
  youtube?: string;
}

export interface IConfig {
  name: string | any;
  imgSrc: string;
  intro: string;
  introButton: iButton;
}
