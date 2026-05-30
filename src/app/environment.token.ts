import { InjectionToken } from '@angular/core';

/**
 * DI token for the build-time environment object.
 * Lives in its own module to avoid an import cycle with `app.module`,
 * which lets services/components (and their specs) import it in isolation.
 */
export const EnvironmentToken = new InjectionToken('ENVIRONMENT');
