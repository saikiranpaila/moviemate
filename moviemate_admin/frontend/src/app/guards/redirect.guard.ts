import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const redirectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // Check if the token exists

  if (token) {
    router.navigate(['/']); // Redirect to home if logged in
    return false;
  }

  return true;
};
