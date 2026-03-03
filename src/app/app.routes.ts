import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {   
    path: '',
    loadComponent: () =>
    import('./shared/pages/home-page/home-page').then(m => m.HomePage),
  },
  {   
    path: 'home',
    loadComponent: () =>
    import('./shared/pages/home-page/home-page').then(m => m.HomePage),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
  },
  {
    path: 'favorites',
    loadChildren: () =>
      import('./features/favorites/favorites.routes').then(m => m.FAVORITES_ROUTES),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];

