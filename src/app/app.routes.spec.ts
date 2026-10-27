import { routes } from './app.routes';
import { DefaultLayoutComponent } from './layout/default-layout.component';

describe('app routes', () => {
  it('loads the watch page as home outside the navbar layout', () => {
    const homeRoute = routes.find(route => route.path === '');

    expect(homeRoute?.component).toBeUndefined();
    expect(homeRoute?.loadComponent).toEqual(jasmine.any(Function));
    expect(homeRoute?.pathMatch).toBe('full');
  });

  it('keeps the About and Help pages inside the navbar layout', () => {
    const aboutRoute = routes.find(route => route.path === 'about');
    const helpRoute = routes.find(route => route.path === 'help');

    expect(aboutRoute?.component).toBe(DefaultLayoutComponent);
    expect(helpRoute?.component).toBe(DefaultLayoutComponent);
    expect(aboutRoute?.children?.map(route => route.path)).toEqual(['']);
    expect(helpRoute?.children?.map(route => route.path)).toEqual(['']);
  });

  it('no longer exposes the old watch URL', () => {
    expect(routes.some(route => route.path === 'watch')).toBe(false);
  });
});
