import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)

  if (authService.getToken()) {
    if (authService.isTokenExpired()) {
      authService.logout()
      return next(req)
    }

    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.getToken()}`
      }
    })

    return next(clonedRequest)
  }

  return next(req)
}
