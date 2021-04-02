import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ButtonGroup, iButtonGroup } from './sound-buttons/ButtonGroup';
import { Button, iButton } from './sound-buttons/Buttons';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private url = 'assets/configs/main.json';

  public OnConfigChanged: EventEmitter<IFullConfig> = new EventEmitter();

  // tslint:disable-next-line: variable-name
  private _name = 'template';
  public get name(): string {
    return this._name;
  }
  public set name(value) {
    this._name = value;
    this.getBriefConfig().subscribe(cs => {
      this.getConfig(value, cs).subscribe(c => {
        this.OnConfigChanged.emit(c);
      });
    });
  }

  constructor(
    private http: HttpClient
  ) { }

  getBriefConfig(url: string = this.url): Observable<IConfig[]> {
    return this.http.get<IConfig[]>(url).pipe(
      map(source => {
        const result = [];
        for (const c of source) {
          // 重新建立introButton
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

  getConfig(name: string = this.name, configs?: IConfig[]): Observable<IFullConfig> {
    // 由this.configs取得FullConfigUrl
    let fullConfigURL = '';
    if (configs) {
      for (const c of configs) {
        if (name === c.name) {
          fullConfigURL = c.fullConfigURL;
        }
      }
    }
    if (!fullConfigURL) {
      fullConfigURL = 'assets/configs/template.json';
    }

    return this.http.get<IFullConfig>(fullConfigURL).pipe(
      map(source => {
        // tslint:disable-next-line: prefer-const
        let target = Object.assign({}, source);

        // 重新建立introButton
        if (source.introButton) {
          const b = source.introButton;
          target.introButton = new Button(b.filename, b.text, b.baseRoute, b.source);
        }

        // 重新建立buttonGroups
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

        // 套用config中的顏色設定
        for (const colorKey in source.color) {
          if (Object.prototype.hasOwnProperty.call(source.color, colorKey)) {
            const color = source.color as any;
            const colorValue = color[colorKey] as string;
            document.documentElement.style.setProperty('--bs-' + colorKey, colorValue);
          }
        }
        return target;
      })
    );
  }
}

export interface IFullConfig extends IConfig {
  buttonGroups?: iButtonGroup[];
  youtube?: string;
}

export interface IConfig {
  name: string | any;
  fullName: string;
  imgSrc: string;
  intro: string;
  introButton?: iButton;
  fullConfigURL: string;
  color?: {
    primary: string;
    secondary: string;
  };
}
