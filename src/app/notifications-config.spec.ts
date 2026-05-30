import { TOASTR_CONFIG } from './app.module';

// Capability: notifications-and-dialogs — default toast configuration.
describe('Default Toastr configuration', () => {
  it('positions toasts bottom-center with no auto-timeout', () => {
    expect(TOASTR_CONFIG.positionClass).toBe('toast-bottom-center');
    expect(TOASTR_CONFIG.disableTimeOut).toBeTrue();
  });
});
