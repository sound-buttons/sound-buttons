import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonGroup, iButtonGroup } from '../sound-buttons/ButtonGroup';
import { Button } from '../sound-buttons/Buttons';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {
  config: iConfig = {
    name: '',
    imgSrc: '',
    intro: '',
    color: '',
    buttonGroups: [],
    youtube: ''
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    let url = '';
    const name = this.route.snapshot.url[0]?.path;
    if (name) {
      url = `assets/configs/${name}.json`;
    } else {
      url = 'assets/configs/template.json';
    }

    this.http.get<iConfig>(url).subscribe((data) => {
      this.deepCopyConfigs(data, this.config);
    });
  }

  ngOnInit(): void {
  }

  private deepCopyConfigs(source: iConfig, target: iConfig): void {
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
  }
}

// tslint:disable-next-line: class-name
interface iConfig {
  name: string;
  imgSrc: string;
  intro: string;
  color: string;
  buttonGroups: iButtonGroup[];
  youtube: string;
}
