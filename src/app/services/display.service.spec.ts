import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DisplayService } from './display.service';

// Capability: sound-button-grid — filter text shared via the URL query string.
describe('DisplayService', () => {
  let service: DisplayService;
  let router: jasmine.SpyObj<Router>;
  let queryParams: Subject<Record<string, string>>;

  beforeEach(() => {
    queryParams = new Subject();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const route = { queryParams } as unknown as ActivatedRoute;

    TestBed.configureTestingModule({
      providers: [
        DisplayService,
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
      ],
    });
    service = TestBed.inject(DisplayService);
  });

  it('setFilterText navigates merging the filter query param and emits the change', () => {
    const emitted: string[] = [];
    service.OnConfigChanged.subscribe((s) => emitted.push(s));

    service.setFilterText('abc');

    expect(service.getFilterText()).toBe('abc');
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: { filter: 'abc' },
        queryParamsHandling: 'merge',
      })
    );
    expect(emitted).toEqual(['abc']);
  });

  it('uses null for the filter param when cleared (removes it from the URL)', () => {
    service.setFilterText('abc');
    router.navigate.calls.reset();

    service.setFilterText('');

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({ queryParams: { filter: null } })
    );
  });

  it('is a no-op when the text is unchanged', () => {
    service.setFilterText('abc');
    router.navigate.calls.reset();

    service.setFilterText('abc');

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('initializes the filter from the route query params', () => {
    queryParams.next({ filter: 'fromUrl' });

    expect(service.getFilterText()).toBe('fromUrl');
  });
});
