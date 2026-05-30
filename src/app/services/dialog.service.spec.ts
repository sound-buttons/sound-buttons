import { DialogService } from './dialog.service';
import { ToastrService } from 'ngx-toastr';

// Capability: notifications-and-dialogs — toast + modal coordination.
describe('DialogService', () => {
  let service: DialogService;
  let toastr: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    toastr = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'info',
      'error',
      'warning',
      'success',
      'clear',
    ]);
    toastr.info.and.returnValue({ toastId: 7 } as never);
    service = new DialogService(toastr);
  });

  it('toastPending returns the toast id from an info toast', () => {
    expect(service.toastPending('please wait')).toBe(7);
    expect(toastr.info).toHaveBeenCalled();
  });

  it('disablePending clears the toast only when id > 0', () => {
    service.disablePending(5);
    expect(toastr.clear).toHaveBeenCalledWith(5);

    toastr.clear.calls.reset();
    service.disablePending(0);
    expect(toastr.clear).not.toHaveBeenCalled();
  });

  it('toastSuccess passes a timeout option when provided', () => {
    service.toastSuccess('ok', 't', 2000);
    expect(toastr.success).toHaveBeenCalledWith('ok', 't', {
      timeOut: 2000,
      disableTimeOut: false,
    });

    service.toastSuccess('ok2');
    expect(toastr.success).toHaveBeenCalledWith('ok2', undefined);
  });

  it('toastWarning honors an optional timeout', () => {
    service.toastWarning('w', 't', 1500);
    expect(toastr.warning).toHaveBeenCalledWith('w', 't', {
      timeOut: 1500,
      disableTimeOut: false,
    });
  });

  it('toastError forwards message and title', () => {
    service.toastError('boom', 'title');
    expect(toastr.error).toHaveBeenCalledWith('boom', 'title');
  });

  it('exposes showModal / onHideModal emitters', () => {
    const seen: Array<{ title: string; message: string }> = [];
    service.showModal.subscribe((v) => seen.push(v));
    service.showModal.emit({ title: 'T', message: 'M' });

    expect(seen).toEqual([{ title: 'T', message: 'M' }]);
  });
});
