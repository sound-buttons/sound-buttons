import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top-button',
  standalone: true,
  imports: [CommonModule],
  template: `<button
    type="button"
    class="btn btn-primary"
    [style.bottom]="bottom"
    [style.visibility]="window.scrollY > 300 ? 'visible' : 'hidden'"
    [style.opacity]="window.scrollY > 300 ? '1' : '0'"
    (click)="OnClick()"
  >
    <i class="bi bi-chevron-up"></i>
  </button>`,
  styleUrls: ['./scroll-to-top-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ScrollToTopButtonComponent {
  window = window;
  @Input() bottom: string = '20px';

  OnClick = (): void => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };
}
