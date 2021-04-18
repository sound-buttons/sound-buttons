import { Injectable, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private toastr: ToastrService,
  ) { }

  showModal = new EventEmitter();
  confirmModal = new EventEmitter();

  toastError(message: string, title?: string ): void {
    this.toastr.error(message, title);
  }
  toastInfo(message: string, title?: string ): void {
    this.toastr.info(message, title);
  }
  toastWarning(message: string, title?: string ): void {
    this.toastr.warning(message, title);
  }
  toastSuccess(message: string, title?: string ): void {
    this.toastr.success(message, title);
  }

}
