import { type Routes } from '@angular/router';

import { DefaultLayoutComponent } from './layout/default-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/page-watch/watch.component').then(m => m.WatchComponent),
  },
  {
    path: 'about',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
      },
    ],
  },
  {
    path: 'help',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/page-help/help-page.component').then(m => m.HelpPageComponent),
      },
    ],
  },
];
