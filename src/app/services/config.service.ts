import { LanguageService } from './language.service';
import { AudioService } from './audio.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ButtonGroup, IButtonGroup } from '../sound-buttons/ButtonGroup';
import { Button, IButton } from '../sound-buttons/Buttons';
import { IColor, ColorService } from './color.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private url = 'assets/configs/main.json';
  private config: IFullConfig | undefined;
  public groupNames: string[] = [];

  public OnConfigChanged: EventEmitter<IFullConfig | undefined> = new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private _isLiveUpdate = false;
  public get isLiveUpdate(): boolean {
    return this._isLiveUpdate;
  }
  public set isLiveUpdate(value: boolean) {
    this._isLiveUpdate = value;
    this.reloadConfig();
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private _name = '';
  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
    this.reloadConfig();
  }

  constructor(
    private http: HttpClient,
    private colorService: ColorService,
    private audioService: AudioService
  ) {}

  private setGroupNames(buttonGroups: ButtonGroup[]): void {
    this.groupNames.length = 0;
    buttonGroups.forEach((group) => {
      this.groupNames.push(group.name);
    });
  }

  private getFullConfigUrl(name: string, configs: IConfig[] | undefined): string {
    let fullConfigURL = '';
    if (configs) {
      for (const c of configs) {
        if (name === c.name) {
          fullConfigURL = this.isLiveUpdate ? c.liveUpdateURL : c.fullConfigURL;
        }
      }
    }
    return fullConfigURL;
  }

  getBriefConfig(url: string = this.url): Observable<IConfig[]> {
    // IConfig下都是基本型別，直接用
    return this.http.get<IConfig[]>(url, {
      headers: new HttpHeaders({ 'Cache-Control': 'max-age=0' }),
    });
  }

  getConfig(name: string = this.name, configs?: IConfig[]): Observable<IFullConfig> | undefined {
    const fullConfigURL = this.getFullConfigUrl(name, configs);
    if (!fullConfigURL) {
      // fullConfigURL = 'assets/configs/template.json';
      return undefined;
    }

    return this.http
      .get<IFullConfig>(fullConfigURL, {
        headers: new HttpHeaders({ 'Cache-Control': 'max-age=0' }),
      })
      .pipe(
        map((source) => {
          // eslint-disable-next-line prefer-const
          let target = Object.assign({}, source);

          // 重新建立introButton
          if (source.introButton) {
            const b = source.introButton;
            target.introButton = new Button(
              this.audioService,
              b.filename,
              b.text,
              b.baseRoute,
              b.volume,
              b.source,
              b.SASToken
            );
          }

          // 重新建立buttonGroups
          if (source.buttonGroups) {
            // 重新new出來賦值，否則由json接進來的button object不會有自訂方法
            const buttonGroups: ButtonGroup[] = [];
            for (const bg of source.buttonGroups) {
              const buttons: Button[] = [];
              for (const b of bg.buttons) {
                // 重點在此處重建Button，這樣才會有click方法屬性
                buttons.push(
                  new Button(
                    this.audioService,
                    b.filename,
                    b.text,
                    b.baseRoute,
                    b.volume,
                    b.source,
                    b.SASToken
                  )
                );
              }
              buttonGroups.push(new ButtonGroup(bg.name, bg.baseRoute, buttons));
            }
            target.buttonGroups = buttonGroups;
            this.setGroupNames(buttonGroups);
          }

          if (source.color) {
            this.colorService.color = source.color;
          }

          // 套用text中的多語系
          if (typeof source.intro !== 'string') {
            // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
            source.intro = LanguageService.GetTextFromObject(source.intro);
          }

          return target;
        })
      );
  }

  resetConfig(): void {
    this.config = undefined;
    this._name = '';
    this._isLiveUpdate = false;
    this.colorService.resetColor();
    this.OnConfigChanged.emit(this.config);
  }

  reloadConfig(callback?: (result: IFullConfig) => void): void {
    this.getBriefConfig()
      .pipe(
        switchMap((cs) => {
          const config$ = this.getConfig(this._name, cs);
          if (config$) {
            return config$;
          } else {
            throw new Error('No config received.');
          }
        })
      )
      .subscribe((config) => {
        if (config) {
          this.config = config;
          this.OnConfigChanged.emit(this.config);
        } else {
          this.resetConfig();
        }
        if (callback) {
          callback(config);
        }
      });
  }
}

export interface IFullConfig extends IConfig {
  buttonGroups?: IButtonGroup[];
  link?: ILink;
  intro: string | never;
  introButton?: IButton;
}

export interface IConfig {
  name: string | never;
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
  instagram?: string;
  discord?: string;
  other?: string;
}
