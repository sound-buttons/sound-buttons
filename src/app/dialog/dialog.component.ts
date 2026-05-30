import { Subscription } from 'rxjs';
import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DialogService } from '../services/dialog.service';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    standalone: false
})
export class DialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tModel', { static: true }) modal!: TemplateRef<unknown>;
  modalRef!: BsModalRef;
  modalData: { title: string; message: string | SafeHtml; result: boolean } = {
    title: '',
    message: '',
    result: false,
  };
  subscription!: Subscription;

  constructor(
    private modalService: BsModalService,
    private dialogService: DialogService,
    private sanitizer: DomSanitizer
  ) {}

  ngAfterViewInit(): void {
    this.dialogService.showModal.subscribe((m) => {
      console.debug('Modal', m);
      this.modalData.title = m.title;
      this.modalData.message = this.sanitizer.bypassSecurityTrustHtml(m.message);
      this.modalRef = this.modalService.show(this.modal);
    });

    this.modalService.onHidden.subscribe(() => {
      this.dialogService.onHideModal.emit();
    });
  }

  // modalYes(): void{
  //   this.modalRef.hide();
  //   this.dialogService.confirmModal.emit(true);
  // }

  // modalNo(): void{
  //   this.modalRef.hide();
  //   this.dialogService.confirmModal.emit(false);
  // }

  ngOnDestroy(): void {
    // `subscription` is never assigned (the showModal/onHidden subscriptions above
    // are not stored), so this guard avoids an NPE on teardown. In production the
    // dialog lives for the whole app lifetime and is never destroyed, so this is
    // behaviour-neutral there; the guard only matters under test teardown.
    this.subscription?.unsubscribe();
  }
}
