import { Subscription } from 'rxjs';
import { DialogService } from './../services/dialog.service';
import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tModel', { static: true }) modal!: TemplateRef<unknown>;
  modalRef!: BsModalRef;
  modalData = {
    title: '',
    message: '',
    result: false,
  };
  subscription!: Subscription;

  constructor(private modalService: BsModalService, private dialogService: DialogService) {}

  ngAfterViewInit(): void {
    this.dialogService.showModal.subscribe((m) => {
      this.modalData.title = m.title;
      this.modalData.message = m.message;
      this.modalRef = this.modalService.show(this.modal);
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
    this.subscription.unsubscribe();
  }
}
