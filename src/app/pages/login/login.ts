import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AuthApiService} from '../../services/auth-api.service';
import {AuthService} from '../../core/auth/auth.service';
import {Router, RouterLink} from '@angular/router';
import {LoginRequest} from '../../models/login/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  private authApi = inject(AuthApiService)
  private authService = inject(AuthService)
  private router = inject(Router)
  private cdr = inject(ChangeDetectorRef)

  activeTab: 'PATIENT' | 'ORGANIZATION' = 'PATIENT'
  credentials: LoginRequest = { email: '', password: '' }
  showPassword = false
  errorMessage = ''
  isLoading = false

  togglePassword() {
    this.showPassword = !this.showPassword
  }

  setTab(tab: 'PATIENT' | 'ORGANIZATION') {
    this.activeTab = tab
    this.errorMessage = ''
  }

  onSubmit() {
    this.errorMessage = ''
    this.isLoading = true

    this.authApi.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false

        if (response.success && response.data) {
          const tempToken = response.data
          const payload = JSON.parse(atob(tempToken.split('.')[1]))
          const role = payload.role

          if (this.activeTab === 'PATIENT') {
            if (role !== 'PATIENT') {
              this.errorMessage = 'Esta cuenta pertenece a la organización. Por favor, usa la pestaña "Organización".'
              this.cdr.detectChanges()
              return
            }
            this.authService.setToken(tempToken)
            this.router.navigate(['/paciente']).then()
          } else if (this.activeTab === 'ORGANIZATION') {
            if (role === 'DOCTOR') {
              this.authService.setToken(tempToken)
              this.router.navigate(['/organizacion/doctor']).then()
            } else if (role === 'ADMINISTRATION') {
              this.authService.setToken(tempToken)
              this.router.navigate(['/organizacion/administracion']).then()
            } else {
              this.errorMessage = 'Esta cuenta es de un paciente. Usa la pestaña "Paciente".'
              this.cdr.detectChanges()
            }
          }
        }
      },
      error: (err) => {
        this.isLoading = false
        this.errorMessage = err.error?.message || 'Credenciales incorrectas o error de conexión.'
        this.cdr.detectChanges()
      }
    });
  }

}
