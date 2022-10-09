import { Component, Inject, Input } from '@angular/core';
import { EnvironmentToken } from '../app.module';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() copyText = 'MIT License';
}
