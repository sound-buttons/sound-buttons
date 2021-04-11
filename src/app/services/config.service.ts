import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonGroup, IButtonGroup } from '../sound-buttons/ButtonGroup';
import { Button, IButton } from '../sound-buttons/Buttons';
import { IColor, ColorService } from './color.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private url = 'assets/configs/main.json';
  public isLiveUpdate = false;

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
    private http: HttpClient,
    private colorService: ColorService
  ) { }

  getBriefConfig(url: string = this.url): Observable<IConfig[]> {
    // IConfig下都是基本型別，直接用
    return this.http.get<IConfig[]>(url);
  }

  getConfig(name: string = this.name, configs?: IConfig[]): Observable<IFullConfig> {
    // 由this.configs取得FullConfigUrl
    let fullConfigURL = '';
    if (configs) {
      for (const c of configs) {
        if (name === c.name) {
          fullConfigURL = this.isLiveUpdate
            ? c.liveUpdateURL
            : c.fullConfigURL;
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
          target.introButton = new Button(b.filename, b.text, b.baseRoute, b.source, b.SASToken);
        }

        // 重新建立buttonGroups
        if (source.buttonGroups) {
          // 重新new出來賦值，否則由json接進來的button object不會有自訂方法
          const buttonGroups: ButtonGroup[] = [];
          for (const bg of source.buttonGroups) {
            const buttons: Button[] = [];
            for (const b of bg.buttons) {
              // 重點在此處重建Button，這樣才會有click方法屬性
              buttons.push(new Button(b.filename, b.text, b.baseRoute, b.source, b.SASToken));
            }
            buttonGroups.push(
              new ButtonGroup(bg.name, bg.baseRoute, buttons)
            );
          }
          target.buttonGroups = buttonGroups;
        }

        if (source.color) {
          this.colorService.color = source.color;
        }
        return target;
      })
    );
  }
}

export interface IFullConfig extends IConfig {
  buttonGroups?: IButtonGroup[];
  link?: ILink;
  intro: string;
  introButton?: IButton;
}

export interface IConfig {
  name: string | any;
  fullName: string;
  imgSrc: string;
  fullConfigURL: string;
  liveUpdateURL: string;
  color?: IColor;
}

export interface ILink {
  youtube?: string;
  twitter?: string;
  facebook?: string;
  other?: string;
}
