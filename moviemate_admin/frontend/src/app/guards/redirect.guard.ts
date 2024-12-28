import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const redirectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenSvc = inject(TokenService);
  const token = tokenSvc.getToken() // Check if the token exists

  if (token) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
