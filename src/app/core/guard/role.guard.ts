import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;

  const userRole = authService.getUserRole();

  if (!userRole || !authService.isAuthenticated()) {
    authService.logout();
    return false;
  }

  if (expectedRoles && expectedRoles.includes(userRole)) {
    return true;
  }

  if (userRole === 'PATIENT') {
    router.navigate(['/paciente']).then()
  } else if (userRole === 'DOCTOR') {
    router.navigate(['/organizacion/doctor']).then()
  } else if (userRole === 'ADMINISTRATION') {
    router.navigate(['/organizacion/administracion']).then()
  } else {
    authService.logout();
  }

  return false;
};
