import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';
import { ClickService } from '../services/click.service';
import { DialogService } from '../services/dialog.service';
import {
  makeDialogServiceSpy,
  DialogServiceSpy,
  translateTestingImports,
} from '../../testing/angular';

// Capability: click-counter (footer display + AGPL modal + version link).
describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;
  let clickService: jasmine.SpyObj<ClickService>;
  let dialogService: DialogServiceSpy;
  let updateClicks: EventEmitter<number>;

  function setup(version = 'DEVELOP') {
    updateClicks = new EventEmitter<number>();
    clickService = jasmine.createSpyObj<ClickService>('ClickService', ['GetClicks', 'StepClicks'], {
      UpdateClicks: updateClicks,
    });
    dialogService = makeDialogServiceSpy();

    TestBed.configureTestingModule({
      imports: [...translateTestingImports()],
      declarations: [FooterComponent],
      providers: [
        { provide: ClickService, useValue: clickService },
        { provide: DialogService, useValue: dialogService },
      ],
    });

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    component.version = version;
    return fixture;
  }

  describe('Requirement: Displaying the count', () => {
    it('Scenario: Footer display — starts at placeholder ????? then updates live on UpdateClicks', () => {
      setup();
      fixture.detectChanges();

      const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text()).toContain('Total ????? Clicks');

      updateClicks.emit(42);
      fixture.detectChanges();
      expect(component.clicks).toBe('42');
      expect(text()).toContain('Total 42 Clicks');

      // The badge ribbon mirrors the same value.
      const ribbon = fixture.debugElement.query(By.css('.ribbon')).nativeElement as HTMLElement;
      expect(ribbon.textContent?.trim()).toBe('42');
    });
  });

  describe('Requirement: badge warning toast', () => {
    it('shows a warning toast prompting to press a button, not the badge', () => {
      setup();
      fixture.detectChanges();

      component.badgeOnClick();

      // With the no-op translate loader, the key echoes back.
      expect(dialogService.toastWarning).toHaveBeenCalledWith(
        '按按鈕，不是按我！',
        undefined,
        3000
      );
    });
  });

  describe('Requirement: AGPL modal emit', () => {
    it('emits showModal with the AGPLv3 title, logo image, and translated content', () => {
      setup();
      fixture.detectChanges();
      const emitSpy = spyOn(dialogService.showModal, 'emit');

      component.agplOnClick();

      expect(emitSpy).toHaveBeenCalledTimes(1);
      const arg = emitSpy.calls.mostRecent().args[0] as { title: string; message: string };
      expect(arg.title).toBe('Why AGPLv3 License?');
      expect(arg.message).toContain('AGPLv3_Logo.svg');
      expect(arg.message).toContain('AGPLv3 content');
    });
  });

  describe('Requirement: version link slice/upper', () => {
    it('renders the version anchor with a sliced, uppercased 7-char label and full-sha href', () => {
      setup('abcdef1234567');
      fixture.detectChanges();

      const anchor = fixture.debugElement.query(
        By.css('a[href^="https://github.com/sound-buttons/sound-buttons/tree/"]')
      ).nativeElement as HTMLAnchorElement;

      expect(anchor.getAttribute('href')).toBe(
        'https://github.com/sound-buttons/sound-buttons/tree/abcdef1234567'
      );
      expect(anchor.textContent?.trim()).toBe('v.ABCDEF1');
    });
  });
});
