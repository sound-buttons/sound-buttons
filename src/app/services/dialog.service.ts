import { Injectable, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private toastr: ToastrService) {}

  showModal = new EventEmitter();
  // confirmModal = new EventEmitter();

  disablePending(toastId: number): void {
    if (toastId > 0) {
      this.toastr.clear(toastId);
    }
  }

  toastPending(message: string, title?: string): number {
    return this.toastr.info(message, title, {
      // tapToDismiss: false
    }).toastId;
  }

  toastError(message: string, title?: string): void {
    this.toastr.error(message, title);
  }
  toastWarning(message: string, title?: string): void {
    this.toastr.warning(message, title);
  }
  toastSuccess(message: string, title?: string): void {
    this.toastr.success(message, title);
  }

  clearPending(): void {
    this.toastr.clear();
  }
}
