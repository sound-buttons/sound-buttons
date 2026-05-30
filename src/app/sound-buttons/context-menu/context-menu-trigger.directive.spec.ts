// Capability: right-click-context-menu.
// Behaviour-preservation harness for the CDK-overlay based context-menu trigger directive.
// Mirrors the "Context menu trigger and context binding" and "Closing behaviour" scenarios
// in openspec/specs/right-click-context-menu/spec.md.

import { ApplicationRef, Component, Inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';

import { ContextMenuTriggerDirective } from './context-menu-trigger.directive';
import { CONTEXT_MENU_DATA } from './context-menu.tokens';

interface TestContext {
  id: string;
}

@Component({
    selector: 'app-test-menu',
    template: `<div class="test-menu">{{ data.id }}</div>`,
    standalone: false
})
class TestMenuComponent {
  constructor(@Inject(CONTEXT_MENU_DATA) public data: TestContext) {}
}

@Component({
    template: `<button type="button" [contextMenuTrigger]="menu" [menuContext]="ctx"></button>`,
    standalone: false
})
class HostComponent {
  menu = TestMenuComponent;
  ctx: TestContext = { id: 'btn-1' };
}

describe('ContextMenuTriggerDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let container: HTMLElement;
  let overlayContainer: OverlayContainer;

  function rightClick(): boolean {
    const host = fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;
    const event = new MouseEvent('contextmenu', {
      clientX: 10,
      clientY: 20,
      cancelable: true,
      bubbles: true,
    });
    // dispatchEvent returns false when a listener called preventDefault().
    return host.dispatchEvent(event);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [HostComponent, TestMenuComponent, ContextMenuTriggerDirective],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    overlayContainer = TestBed.inject(OverlayContainer);
    container = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    // Dispose any overlay left open so it does not leak into later specs.
    rightClick();
    container.querySelectorAll('.test-menu').forEach((el) => el.remove());
    overlayContainer.ngOnDestroy();
  });

  // Scenario: Right-clicking opens the menu at the cursor and suppresses the native menu
  it('opens the menu in an overlay on right-click and calls preventDefault', () => {
    const notPrevented = rightClick();
    expect(notPrevented).toBeFalse();
    expect(container.querySelector('.test-menu')).not.toBeNull();
  });

  // Scenario: The clicked element's bound value is the menu context
  it('passes menuContext to the rendered menu via CONTEXT_MENU_DATA', () => {
    rightClick();
    // The menu renders into a CDK overlay view attached to the ApplicationRef;
    // tick() flushes its initial change detection so the interpolation resolves.
    TestBed.inject(ApplicationRef).tick();
    expect((container.querySelector('.test-menu') as HTMLElement).textContent).toContain('btn-1');
  });

  // Scenario: Only one context menu is open at a time
  it('disposes the previous overlay when a new menu is opened', () => {
    rightClick();
    rightClick();
    expect(container.querySelectorAll('.test-menu').length).toBe(1);
  });
});
