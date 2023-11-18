import { TranslateService } from '@ngx-translate/core';
import { DialogService } from './../services/dialog.service';
import { ClickService } from './../services/click.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @Input() version = 'DEVELOP';
  clicks = '?????';

  constructor(
    private clickService: ClickService,
    private dialogService: DialogService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.clickService.UpdateClicks.subscribe((clicks) => {
      this.clicks = '' + clicks;
    });
  }

  badgeOnClick = () =>
    this.translate.get('按按鈕，不是按我！').subscribe((res: string) => {
      this.dialogService.toastWarning(res, undefined, 3000);
    });

  agplOnClick = () =>
    this.translate.get('AGPLv3 content').subscribe((res: string) => {
      this.dialogService.showModal.emit({
        title: 'Why AGPLv3 License?',
        message: `<div class="w-100 text-center m-3"><img src="assets/img/AGPLv3_Logo.svg" alt="agpl" width="250"></div> ${res}`,
      });
    });
}
