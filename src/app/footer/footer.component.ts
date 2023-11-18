import { ClickService } from './../services/click.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @Input() copyText = 'Website AGPLv3 Licensed';
  clicks = 0;

  constructor(private clickService: ClickService) {}

  ngOnInit(): void {
    this.clickService.UpdateClicks.subscribe((clicks) => {
      this.clicks = clicks;
    });
  }
}
