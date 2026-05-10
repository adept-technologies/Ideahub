import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../Services/auth/auth.service';
import { inject } from '@angular/core';
import { map, Observable } from 'rxjs';

export const LandingGuard: CanActivateFn = (): Observable<
  boolean | UrlTree
> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return router.createUrlTree(['/home']); // Already logged in? Go home.
      } else {
        // Force automatic login check (The Office 365 Dream)
        return true;
      }
    }),
  );
};
