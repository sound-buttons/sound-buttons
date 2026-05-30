import { OverlayRef } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import { IButton } from '../Buttons';

/**
 * Injection token carrying the target {@link IButton} into a context-menu component
 * instance that is created inside a CDK overlay.
 */
export const CONTEXT_MENU_DATA = new InjectionToken<IButton>('CONTEXT_MENU_DATA');

/**
 * Handle given to a context-menu component so it can dispose the CDK overlay that hosts it.
 * Disposal is idempotent, so calling {@link dispose} more than once is safe.
 */
export class ContextMenuRef {
  constructor(private readonly overlayRef: OverlayRef) {}

  dispose(): void {
    this.overlayRef.dispose();
  }
}
