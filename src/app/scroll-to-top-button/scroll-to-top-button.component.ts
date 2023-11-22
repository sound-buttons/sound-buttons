import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top-button',
  standalone: true,
  imports: [CommonModule],
  template: `<button
    type="button"
    class="btn btn-primary"
    [style.bottom]="bottom"
    [style.visibility]="show ? 'visible' : 'hidden'"
    [style.opacity]="show ? '1' : '0'"
    (click)="onClick()"
  >
    <i class="bi bi-chevron-up"></i>
  </button>`,
  styleUrls: ['./scroll-to-top-button.component.scss'],
})
export class ScrollToTopButtonComponent implements AfterViewInit, OnDestroy {
  @Input() bottom: string = '20px';

  show = false;

  private scroll = () => {
    this.show = window.scrollY > 300;
  };

  ngAfterViewInit(): void {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
    window.addEventListener('scroll', this.scroll, { passive: true });
  }

  onClick = (): void => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scroll);
  }
}
