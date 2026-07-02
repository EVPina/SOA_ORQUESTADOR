import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import type { Rol } from './models';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    return router.parseUrl('/login');
  }

  const requiredRoles = route.data['roles'] as Rol[] | undefined;
  if (requiredRoles && !requiredRoles.includes(auth.user()!.rol)) {
    return router.parseUrl(auth.getDashboardRoute());
  }

  return true;
};
