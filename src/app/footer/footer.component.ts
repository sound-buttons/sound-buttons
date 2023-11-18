import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @Input() copyText = 'Website AGPLv3 Licensed';
  clicks = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // http get views from https://view-counter.sound-buttons.click

    this.http.get('https://view-counter.sound-buttons.click').subscribe((res) => {
      this.clicks = +res;
    });
  }
}
