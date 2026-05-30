import { AudioService } from './audio.service';
import { ClickService } from './click.service';
import { FakeAudio, installFakeAudio, installGtagSpy } from '../../testing/fakes';
import { makeButton } from '../../testing/fixtures';

// Capabilities: audio-playback, click-counter, privacy-and-analytics.
describe('AudioService', () => {
  let service: AudioService;
  let clickSpy: jasmine.SpyObj<ClickService>;
  let gtag: jasmine.Spy;
  let audioCtl: { created: FakeAudio[]; restore: () => void };

  beforeEach(() => {
    audioCtl = installFakeAudio();
    gtag = installGtagSpy();
    clickSpy = jasmine.createSpyObj<ClickService>('ClickService', ['StepClicks', 'GetClicks']);
    service = new AudioService(clickSpy);
  });

  afterEach(() => audioCtl.restore());

  it('builds an Audio from baseRoute+filename+SASToken and does not auto-start', () => {
    service.add(makeButton({ baseRoute: 'r/', filename: 'a.webm', SASToken: '?s' }));

    expect(audioCtl.created.length).toBe(1);
    expect(audioCtl.created[0].src).toBe('r/a.webm?s');
    expect(audioCtl.created[0].playCount).toBe(0);
    expect(service.isEmpty()).toBeFalse();
  });

  it('clones the button and assigns a monotonically increasing index', () => {
    const original = makeButton({ id: 'x' });
    service.add(original);
    service.add(makeButton({ id: 'y' }));

    const queued = service.getQueuedButtons();
    expect(queued[0].index).toBe(0);
    expect(queued[1].index).toBe(1);
    expect(queued[0]).not.toBe(original); // cloned, not the same reference
    expect(original.index).toBeUndefined();
  });

  it('sets effective volume to min(1, volume * nowVolume)', () => {
    service.volume(0.5);
    service.add(makeButton({ volume: 1 }));
    expect(audioCtl.created[0].volume).toBeCloseTo(0.5);

    service.add(makeButton({ volume: 4 }));
    expect(audioCtl.created[1].volume).toBe(1); // clamped
  });

  it('on ended: removes the sound, steps clicks, and emits analytics events', () => {
    service.add(makeButton({ id: 'btn', text: 'Name' }));
    audioCtl.created[0].emitEnded();

    expect(service.isEmpty()).toBeTrue();
    expect(clickSpy.StepClicks).toHaveBeenCalled();
    expect(gtag).toHaveBeenCalledWith('event', 'sound_play', jasmine.objectContaining({ button: 'btn' }));
    expect(gtag).toHaveBeenCalledWith('event', 'sound_play_count', jasmine.objectContaining({ count: 1 }));
  });

  it('on ended with a queued next item: plays the next one', () => {
    service.add(makeButton({ id: 'first' }));
    service.add(makeButton({ id: 'second' }));

    audioCtl.created[0].emitEnded();

    expect(service.getQueuedButtons().length).toBe(1);
    expect(service.getQueuedButtons()[0].id).toBe('second');
    expect(audioCtl.created[1].playCount).toBeGreaterThan(0);
  });

  it('play() starts the head of the queue and sets playing state', () => {
    service.add(makeButton());
    service.play();

    expect(service.isPlaying()).toBeTrue();
    expect(audioCtl.created[0].playCount).toBe(1);
  });

  it('stop() clears the queue and resets state', () => {
    service.add(makeButton());
    service.add(makeButton());
    service.stop();

    expect(service.isEmpty()).toBeTrue();
    expect(service.isPlaying()).toBeFalse();
    expect(service.isPaused()).toBeFalse();
    expect(audioCtl.created.every((a) => a.removed)).toBeTrue();
  });

  it('predicate getters reflect queue and pause state', () => {
    expect(service.isEmpty()).toBeTrue();
    expect(service.canPlay()).toBeFalse();
    expect(service.canPause()).toBeFalse();

    service.add(makeButton());
    expect(service.canPause()).toBeTrue();
    service.pause();
    expect(service.canPlay()).toBeTrue();
    expect(service.isPaused()).toBeTrue();
  });

  // Preservation test: documents current behavior when play() rejects.
  // The service ignores the play() promise, so a rejection does NOT auto-recover
  // the queue. Captured so a migration that changes media timing is caught.
  it('preserves current behavior when play() rejects (no auto-recovery)', async () => {
    service.add(makeButton());
    audioCtl.created[0].playShouldReject = true;

    service.play();

    // The service ignores the play() promise, so a rejection neither pauses nor
    // dequeues the current clip — there is no recovery path. Assert the state is
    // unchanged both synchronously and after the (handled) rejection settles.
    expect(service.isPlaying()).toBeTrue();
    expect(service.isEmpty()).toBeFalse();
    await Promise.resolve();
    expect(service.isPlaying()).toBeTrue();
    expect(service.isEmpty()).toBeFalse();
  });
});
