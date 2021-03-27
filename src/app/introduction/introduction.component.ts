import { Component, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements OnInit {
  @Input() public imgSrc = '';
  @Input() public intro = '';

  constructor() {
  }

  ngOnInit(): void {
  }

}
