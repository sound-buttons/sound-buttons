import { routes } from './app-routing.module';
import { ContainerComponent } from './container/container.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UploadComponent } from './upload/upload.component';

// Capability: content-routing-and-seo — the application's route map.
describe('App route map', () => {
  it('maps the root path to the home page (full match)', () => {
    expect(routes[0]).toEqual({ path: '', component: HomePageComponent, pathMatch: 'full' });
  });

  it('maps :name to a container, :name/upload to upload, and :name/:id to a container', () => {
    const nameRoute = routes[1];
    expect(nameRoute.path).toBe(':name');

    const children = nameRoute.children ?? [];
    expect(children).toContain(
      jasmine.objectContaining({ path: '', component: ContainerComponent, pathMatch: 'full' })
    );
    expect(children).toContain(
      jasmine.objectContaining({ path: 'upload', component: UploadComponent })
    );
    expect(children).toContain(
      jasmine.objectContaining({ path: ':id', component: ContainerComponent })
    );
  });

  it('defines no wildcard (**) or redirect route', () => {
    const allPaths = [
      ...routes.map((r) => r.path),
      ...routes.flatMap((r) => (r.children ?? []).map((c) => c.path)),
    ];
    expect(allPaths).not.toContain('**');
    const hasRedirect = routes.some(
      (r) => 'redirectTo' in r || (r.children ?? []).some((c) => 'redirectTo' in c)
    );
    expect(hasRedirect).toBeFalse();
  });
});
