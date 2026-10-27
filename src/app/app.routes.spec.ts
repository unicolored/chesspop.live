import { routes } from './app.routes';
import { DefaultLayoutComponent } from './layout/default-layout.component';

describe('app routes', () => {
  it('keeps the home and About pages inside the navbar layout', () => {
    const layoutRoute = routes.find(route => route.path === '');

    expect(layoutRoute?.component).toBe(DefaultLayoutComponent);
    expect(layoutRoute?.children?.map(route => route.path)).toEqual(['', 'about']);
  });

  it('keeps the watch page outside the navbar layout', () => {
    const watchRoute = routes.find(route => route.path === 'watch');

    expect(watchRoute?.component).toBeUndefined();
    expect(watchRoute?.loadComponent).toEqual(jasmine.any(Function));
  });
});
