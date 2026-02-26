import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return true; // tiene sesión → puede entrar
  }

  return router.createUrlTree(['/login']); //deniega el acceso y redirige al login
};
