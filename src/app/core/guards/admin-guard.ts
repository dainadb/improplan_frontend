import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthState } from '../state/auth.state';

export const adminGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.hasRole('ROLE_ADMIN')) {
    return true; //es admin, puede entrar
  }

  return router.createUrlTree(['/home']); //deniega el acceso y redirige al inicio
  //se usa createUrlTree en lugar de navigate para evitar problemas de navegación dentro de guards. Navigate se usa en los componentes.
};
