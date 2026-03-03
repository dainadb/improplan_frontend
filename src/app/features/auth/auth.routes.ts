import { Routes } from "@angular/router";


export const AUTH_ROUTES: Routes = [
  { //Lazy loading de los componentes de login y registro. Solo se cargarán cuando el usuario acceda a esas rutas (mejora el rendimiento inicial)
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register-page/register-page').then(m => m.RegisterPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];