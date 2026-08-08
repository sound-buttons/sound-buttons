import { EventEmitter } from '@angular/core';
import { TranslatePipe, provideTranslateService } from '@ngx-translate/core';
import { DialogService } from '../app/services/dialog.service';

/**
 * TranslatePipe for tests. With no loader, `instant`/`get` echo the key,
 * which keeps assertions on translated text deterministic.
 */
export function translateTestingImports() {
  return [TranslatePipe];
}

/** Providers for a root TranslateService that echoes keys (no loader). */
export function translateTestingProviders() {
  return provideTranslateService();
}

export type DialogServiceSpy = jasmine.SpyObj<DialogService>;

/** A spy double for DialogService with real EventEmitters for modal channels. */
export function makeDialogServiceSpy(): DialogServiceSpy {
  const spy = jasmine.createSpyObj<DialogService>(
    'DialogService',
    [
      'disablePending',
      'toastPending',
      'toastError',
      'toastWarning',
      'toastSuccess',
      'clearPending',
    ],
    {
      showModal: new EventEmitter<{ title: string; message: string }>(),
      onHideModal: new EventEmitter(),
    }
  );
  spy.toastPending.and.returnValue(1);
  return spy;
}
