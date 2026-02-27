import {Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  selector: 'home-medico',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home-medico.html',
  styleUrl: './home-medico.css'
})
export class HomeMedico {

  private authService = inject(AuthService);

  cerrarSesion() {
    this.authService.logout();
  }

}
