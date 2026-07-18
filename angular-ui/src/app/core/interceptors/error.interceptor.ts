import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';

/** Si el backend rechaza el token (sesión vencida o inválida), cierra la
 * sesión local y manda al usuario de vuelta a /login en vez de dejar que
 * cada pantalla falle en silencio. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if ((error.status === 401 || error.status === 403) && auth.isAuthenticated) {
        auth.forceLogout();
      }
      return throwError(() => error);
    })
  );
};
