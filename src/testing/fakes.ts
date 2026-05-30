// Reusable fakes/spies for browser globals and media, so specs stay hermetic
// and deterministic (no real network, clipboard, navigation, audio, or analytics).

/** A controllable stand-in for HTMLAudioElement. */
export class FakeAudio {
  public volume = 1;
  public preload = '';
  public paused = true;
  public removed = false;
  public playCount = 0;
  public playShouldReject = false;
  private listeners: Record<string, Array<() => void>> = {};

  constructor(public src = '') {}

  play(): Promise<void> {
    this.playCount++;
    this.paused = false;
    if (this.playShouldReject) {
      // Production code (AudioService.play) discards the play() promise, so a real
      // HTMLAudioElement rejection (e.g. NotAllowedError) would surface as an
      // unhandled rejection. Pre-attach a no-op catch here so the discarded
      // rejection stays out of the test runner without depending on zone.js
      // unhandled-rejection plumbing (which differs across Angular versions).
      const rejected = Promise.reject(new DOMException('NotAllowedError'));
      rejected.catch(() => undefined);
      return rejected;
    }
    return Promise.resolve();
  }

  pause(): void {
    this.paused = true;
  }

  remove(): void {
    this.removed = true;
  }

  addEventListener(type: string, cb: () => void): void {
    (this.listeners[type] ||= []).push(cb);
  }

  /** Simulate the audio finishing playback. */
  emitEnded(): void {
    (this.listeners['ended'] || []).forEach((cb) => cb());
  }
}

/** Replace the global `Audio` constructor; returns the list of created fakes. */
export function installFakeAudio(): { created: FakeAudio[]; restore: () => void } {
  const created: FakeAudio[] = [];
  const original = (window as unknown as { Audio: unknown }).Audio;
  (window as unknown as { Audio: unknown }).Audio = function (src?: string) {
    const fake = new FakeAudio(src);
    created.push(fake);
    return fake as unknown as HTMLAudioElement;
  } as unknown;
  return {
    created,
    restore: () => {
      (window as unknown as { Audio: unknown }).Audio = original;
    },
  };
}

/** Install a `gtag` spy and return it. */
export function installGtagSpy(): jasmine.Spy {
  const spy = jasmine.createSpy('gtag');
  (window as unknown as { gtag: unknown }).gtag = spy;
  return spy;
}

/** Spy on `navigator.clipboard.writeText`. */
export function spyClipboard(): jasmine.Spy {
  const spy = jasmine.createSpy('writeText').and.resolveTo();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: spy },
    configurable: true,
  });
  return spy;
}

/** Spy on `window.open`. */
export function spyWindowOpen(): jasmine.Spy {
  return spyOn(window, 'open').and.returnValue(null);
}
