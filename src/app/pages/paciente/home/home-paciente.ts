import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  selector: 'home-paciente',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home-paciente.html',
  styleUrl: './home-paciente.css'
})
export class HomePaciente {

  private authService = inject(AuthService)

  cerrarSesion() {
    this.authService.logout()
  }

}
