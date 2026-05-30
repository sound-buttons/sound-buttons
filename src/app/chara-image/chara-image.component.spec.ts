import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CharaImageComponent } from './chara-image.component';

// Capability: homepage-overview.
describe('CharaImageComponent', () => {
  let fixture: ComponentFixture<CharaImageComponent>;
  let component: CharaImageComponent;

  beforeEach(() => {
    // Control the 4000ms cycling interval started in the constructor.
    jasmine.clock().install();

    TestBed.configureTestingModule({
      declarations: [CharaImageComponent],
    });

    fixture = TestBed.createComponent(CharaImageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => jasmine.clock().uninstall());

  describe('Requirement: Cycling character image', () => {
    it('Scenario: Single image — string input strips the .png extension before building sources', () => {
      component.imgs = 'assets/img/chara.png';
      fixture.detectChanges();

      expect(component.imgs).toEqual(['assets/img/chara']);

      const sources = fixture.debugElement.queryAll(By.css('picture source'));
      expect(sources.length).toBe(2);
      expect((sources[0].nativeElement as HTMLSourceElement).getAttribute('srcset')).toBe(
        'assets/img/chara.avif'
      );
      expect((sources[0].nativeElement as HTMLSourceElement).getAttribute('type')).toBe('image/avif');
      expect((sources[1].nativeElement as HTMLSourceElement).getAttribute('srcset')).toBe(
        'assets/img/chara.webp'
      );
      expect((sources[1].nativeElement as HTMLSourceElement).getAttribute('type')).toBe('image/webp');

      const img = fixture.debugElement.query(By.css('picture img')).nativeElement as HTMLImageElement;
      expect(img.getAttribute('src')).toBe('assets/img/chara.png');
    });

    it('Scenario: Array input — strips .png from every path', () => {
      component.imgs = ['a/one.png', 'a/two.png'];
      fixture.detectChanges();

      expect(component.imgs).toEqual(['a/one', 'a/two']);

      const imgs = fixture.debugElement.queryAll(By.css('picture img'));
      expect(imgs.map((d) => (d.nativeElement as HTMLImageElement).getAttribute('src'))).toEqual([
        'a/one.png',
        'a/two.png',
      ]);
    });

    it('Scenario: Multiple images cycling — active image advances every 4000ms, others get .back', () => {
      component.imgs = ['a/one.png', 'a/two.png', 'a/three.png'];
      fixture.detectChanges();

      const backClasses = () =>
        fixture.debugElement
          .queryAll(By.css('picture img'))
          .map((d) => (d.nativeElement as HTMLImageElement).classList.contains('back'));

      // Initially index 0 is active; the rest carry .back.
      expect(component.nowDisplayImg).toBe(0);
      expect(backClasses()).toEqual([false, true, true]);

      jasmine.clock().tick(4000);
      fixture.detectChanges();
      expect(component.nowDisplayImg).toBe(1);
      expect(backClasses()).toEqual([true, false, true]);

      jasmine.clock().tick(4000);
      fixture.detectChanges();
      expect(component.nowDisplayImg).toBe(2);
      expect(backClasses()).toEqual([true, true, false]);

      // Wraps back to the first image.
      jasmine.clock().tick(4000);
      fixture.detectChanges();
      expect(component.nowDisplayImg).toBe(0);
      expect(backClasses()).toEqual([false, true, true]);
    });
  });
});
