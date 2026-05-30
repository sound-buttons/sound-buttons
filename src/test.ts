// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed, ComponentFixture } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
});

// Angular 21 changed ComponentFixture.detectChanges() to only refresh views that
// are already flagged dirty; state mutated outside a change-detection cycle (a
// common pattern in these behaviour specs, e.g. a synchronous test emit) is no
// longer picked up by the regular pass, surfacing as NG0100 or stale DOM. Restore
// the pre-v21 force-refresh semantics by marking the fixture's view for check
// before every detection pass.
const originalDetectChanges = ComponentFixture.prototype.detectChanges;
ComponentFixture.prototype.detectChanges = function (this: ComponentFixture<unknown>, checkNoChanges?: boolean) {
  this.componentRef.changeDetectorRef.markForCheck();
  return originalDetectChanges.call(this, checkNoChanges);
};
