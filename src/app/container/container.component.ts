import { ConfigService } from './../config.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {
  config$!: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService
  ) { }

  ngOnInit(): void {
    const name = this.route.snapshot.url[0]?.path;
    this.config$ = this.configService.getConfig(name).pipe(
      tap((data) => {
        // 套用config中的顏色設定
        for (const colorKey in data.color) {
          if (Object.prototype.hasOwnProperty.call(data.color, colorKey)) {
            const color = data.color as any;
            const colorValue = color[colorKey] as string;
            document.documentElement.style.setProperty('--bs-' + colorKey, colorValue);
          }
        }
      })
    );
  }

}
