import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ButtonGroup, iButtonGroup } from './sound-buttons/ButtonGroup';
import { Button } from './sound-buttons/Buttons';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private http: HttpClient
  ) { }

  getConfig(name: string): Observable<iConfig> {
    // TODO 由configs中取得config url
    let url = '';
    if (name) {
      url = `assets/configs/${name}.json`;
    } else {
      // 暫時把預設設為tama
      url = 'assets/configs/tama.json';
    }

    return this.http.get<iConfig>(url).pipe(
      map(source => {
        // tslint:disable-next-line: prefer-const
        let target: any | iConfig = {};
        Object.assign(target, source);
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
        return target;
      })
    );
  }
}

// tslint:disable-next-line: class-name
export interface iConfig {
  name: string | any;
  imgSrc: string;
  intro: string;
  buttonGroups: iButtonGroup[];
  color?: {
    primary: string;
    secondary: string;
  };
  youtube?: string;
}
