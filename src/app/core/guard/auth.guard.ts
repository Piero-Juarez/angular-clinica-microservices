import {CanActivateFn} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService)

  if (authService.isAuthenticated()) {
    return true
  }

  authService.logout()
  return false
}
