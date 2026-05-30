import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Directive, HostListener, Injector, Input } from '@angular/core';
import { CONTEXT_MENU_DATA, ContextMenuRef } from './context-menu.tokens';

/**
 * Opens a context-menu component in a CDK overlay positioned at the cursor when the host
 * element is right-clicked. Preserves the previous `[contextMenuTrigger]`/`[menuContext]`
 * template API so consumers do not change: `contextMenuTrigger` is the component type to
 * render and `menuContext` is the value provided to it via {@link CONTEXT_MENU_DATA}.
 *
 * Only one context menu is open at a time; opening a new one disposes the previous overlay.
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[contextMenuTrigger]',
    standalone: false
})
export class ContextMenuTriggerDirective {
  @Input() contextMenuTrigger!: ComponentType<unknown>;
  @Input() menuContext: unknown;

  private static currentOverlay?: OverlayRef;

  constructor(
    private readonly overlay: Overlay,
    private readonly injector: Injector
  ) {}

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    // Enforce a single open menu at a time.
    ContextMenuTriggerDirective.currentOverlay?.dispose();

    const positionStrategy = this.overlay
      .position()
      .global()
      .left(`${event.clientX}px`)
      .top(`${event.clientY}px`);

    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
    });
    ContextMenuTriggerDirective.currentOverlay = overlayRef;

    const menuInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: CONTEXT_MENU_DATA, useValue: this.menuContext },
        { provide: ContextMenuRef, useValue: new ContextMenuRef(overlayRef) },
      ],
    });

    overlayRef.attach(new ComponentPortal(this.contextMenuTrigger, null, menuInjector));
  }
}
