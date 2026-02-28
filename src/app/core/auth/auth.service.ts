import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private router = inject(Router)
  private readonly TOKEN_KEY = 'jwt_token'

  // Guarda token cuando el usuario inicia sesión
  setToken(token: string): void {
    return localStorage.setItem(this.TOKEN_KEY, token)
  }

  // Obtiene el token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  // Cierra la sesión eliminando el token y mandando al login
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    this.router.navigate(['/login']).then()
  }

  // Decodifica el payload del JWT
  getDecodedToken(): any | null {
    const token = this.getToken()
    if (!token) return null

    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload))
    } catch (e) {
      console.error()
      return null;
    }
  }

  // Verifica si el token ya expiró
  isTokenExpired(): boolean {
    const decoded = this.getDecodedToken()
    if (!decoded || !decoded.exp) return false

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  }

  // Saber si hay una sesión válida activa
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  // Métodos útiles
  getUserRole(): string | null {
    return this.getDecodedToken()?.role || null;
  }

  getUserId(): string | null {
    return this.getDecodedToken()?.sub || null;
  }

}
