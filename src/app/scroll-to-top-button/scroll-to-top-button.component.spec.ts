import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ScrollToTopButtonComponent } from './scroll-to-top-button.component';

// Capability: character-board (scroll-to-top button).
describe('ScrollToTopButtonComponent', () => {
  let fixture: ComponentFixture<ScrollToTopButtonComponent>;
  let component: ScrollToTopButtonComponent;
  let scrollSpy: jasmine.Spy;
  const originalScrollY = window.scrollY;

  function setScrollY(value: number): void {
    Object.defineProperty(window, 'scrollY', { value, configurable: true });
  }

  beforeEach(() => {
    // window.scroll is invoked in ngAfterViewInit and onClick; stub it out.
    scrollSpy = spyOn(window, 'scroll');

    TestBed.configureTestingModule({
      imports: [ScrollToTopButtonComponent],
    });

    fixture = TestBed.createComponent(ScrollToTopButtonComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: originalScrollY, configurable: true });
  });

  describe('Requirement: Scroll-to-top button', () => {
    it('Scenario: Visibility threshold — hidden at <=300px, visible once scrollY exceeds 300px', () => {
      fixture.detectChanges(); // ngAfterViewInit registers the scroll listener

      const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;

      // At the top of the page the button is hidden.
      setScrollY(0);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(component.show).toBeFalse();
      expect(button.style.visibility).toBe('hidden');
      expect(button.style.opacity).toBe('0');

      // Exactly 300px is still hidden (strict greater-than).
      setScrollY(300);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(component.show).toBeFalse();

      // Past the threshold it becomes visible.
      setScrollY(301);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(component.show).toBeTrue();
      expect(button.style.visibility).toBe('visible');
      expect(button.style.opacity).toBe('1');
    });

    it('Scenario: Scrolling to top — clicking the button smooth-scrolls to the top', () => {
      fixture.detectChanges();
      scrollSpy.calls.reset(); // ignore the ngAfterViewInit scroll-to-top

      const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;
      button.click();

      expect(scrollSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({ top: 0, left: 0, behavior: 'smooth' })
      );
    });

    it('exposes the bottom offset as an input bound to the button style', () => {
      component.bottom = '50px';
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;
      expect(button.style.bottom).toBe('50px');
    });

    it('removes the scroll listener on destroy so it no longer reacts', () => {
      fixture.detectChanges();
      fixture.destroy();

      setScrollY(500);
      window.dispatchEvent(new Event('scroll'));
      expect(component.show).toBeFalse();
    });
  });
});
