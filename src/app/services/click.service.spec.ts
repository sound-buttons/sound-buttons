import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClickService } from './click.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const ENDPOINT = 'https://view-counter.sound-buttons.click';

// Capability: click-counter — total play count read/increment.
describe('ClickService', () => {
  let service: ClickService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [ClickService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ClickService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('reads the current count on construction via GET and emits it', () => {
    const emitted: number[] = [];
    service.UpdateClicks.subscribe((n) => emitted.push(n));

    const req = httpMock.expectOne(ENDPOINT);
    expect(req.request.method).toBe('GET');
    req.flush('42');

    expect(emitted).toContain(42);
  });

  it('StepClicks POSTs and emits the updated count', () => {
    httpMock.expectOne(ENDPOINT).flush('0'); // drain constructor GET

    const emitted: number[] = [];
    service.UpdateClicks.subscribe((n) => emitted.push(n));

    service.StepClicks();
    const req = httpMock.expectOne(ENDPOINT);
    expect(req.request.method).toBe('POST');
    req.flush('43');

    expect(emitted).toContain(43);
  });

  afterEach(() => httpMock.verify());
});
