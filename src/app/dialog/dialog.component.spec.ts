import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { DialogComponent } from './dialog.component';
import { DialogService } from '../services/dialog.service';
import { makeDialogServiceSpy, DialogServiceSpy } from '../../testing/angular';

// Capability: notifications-and-dialogs (dialog host component).
describe('DialogComponent', () => {
  let fixture: ComponentFixture<DialogComponent>;
  let component: DialogComponent;
  let dialogService: DialogServiceSpy;
  let modalService: jasmine.SpyObj<BsModalService>;
  let onHidden: EventEmitter<unknown>;
  let modalRef: BsModalRef;

  function setup() {
    onHidden = new EventEmitter();
    modalRef = { hide: jasmine.createSpy('hide') } as unknown as BsModalRef;
    modalService = jasmine.createSpyObj<BsModalService>('BsModalService', ['show'], {
      onHidden,
    });
    modalService.show.and.returnValue(modalRef);
    dialogService = makeDialogServiceSpy();

    TestBed.configureTestingModule({
      declarations: [DialogComponent],
      providers: [
        { provide: BsModalService, useValue: modalService },
        { provide: DialogService, useValue: dialogService },
      ],
    });

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // runs ngAfterViewInit and wires the subscriptions
    return fixture;
  }

  describe('Requirement: Modal dialog channel', () => {
    it('Scenario: Requesting a modal — showModal opens the modal with title and message', () => {
      setup();

      dialogService.showModal.emit({ title: 'A Title', message: '<b>hello</b>' });

      expect(modalService.show).toHaveBeenCalledOnceWith(component.modal);
      expect(component.modalData.title).toBe('A Title');
    });
  });

  describe('Requirement: Modal rendering with HTML content', () => {
    it('Scenario: Rendering HTML message — renders the bypassed HTML into the modal body [innerHTML]', () => {
      setup();

      dialogService.showModal.emit({
        title: 'License',
        message: '<b id="raw-html">unsanitized markup</b>',
      });

      // The modal body lives inside the #tModel template; render it to inspect output.
      const view = component.modal.createEmbeddedView({});
      view.detectChanges();
      const body = view.rootNodes
        .map((n: Node) => {
          const el = n as HTMLElement;
          if (el.matches?.('.modal-body')) return el;
          return el.querySelector?.('.modal-body') ?? null;
        })
        .find((el): el is HTMLElement => !!el);

      expect(body).toBeTruthy();
      // bypassSecurityTrustHtml preserves the raw markup verbatim.
      expect(body!.querySelector('#raw-html')).not.toBeNull();
      expect(body!.innerHTML).toContain('<b id="raw-html">unsanitized markup</b>');
      view.destroy();
    });

    it('Scenario: Hiding the modal — emits onHideModal when the modal hides', () => {
      setup();
      const emitSpy = spyOn(dialogService.onHideModal, 'emit');

      onHidden.next();

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
