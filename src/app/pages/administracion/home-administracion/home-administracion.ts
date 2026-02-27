import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  selector: 'home-administracion',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home-administracion.html',
  styleUrl: './home-administracion.css'
})
export class HomeAdministracion {

  private authService = inject(AuthService);

  cerrarSesion() {
    this.authService.logout();
  }

}
