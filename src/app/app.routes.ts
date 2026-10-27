import { type Routes } from '@angular/router';

import { DefaultLayoutComponent } from './layout/default-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/page-live/live.component').then(m => m.LiveComponent),
      },
      {
        path: 'about',
        pathMatch: 'full',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
      },
    ],
  },
  {
    path: 'watch',
    pathMatch: 'full',
    loadComponent: () => import('./pages/page-watch/watch.component').then(m => m.WatchComponent),
  },
];
