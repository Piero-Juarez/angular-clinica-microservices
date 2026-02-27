import { Routes } from '@angular/router';
import {HomePaciente} from './pages/paciente/home/home-paciente';
import {authGuard} from './core/guard/auth.guard';
import {LoginComponent} from './pages/login/login';
import {HomeMedico} from './pages/medico/home-medico/home-medico';
import {roleGuard} from './core/guard/role.guard';
import {HomeAdministracion} from './pages/administracion/home-administracion/home-administracion';
import {PacienteDashboard} from './pages/paciente/dashboard/paciente-dashboard';
import {NuevaCitaPaciente} from './pages/paciente/nueva-cita/nueva-cita';
import {MisCitasPaciente} from './pages/paciente/mis-citas/mis-citas';
import {HistorialMedicoPaciente} from './pages/paciente/historial-medico/historial-medico';
import {MiCuentaPaciente} from './pages/paciente/mi-cuenta/mi-cuenta';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // PORTAL PARA PACIENTE
  {
    path: 'paciente',
    component: HomePaciente,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      { path: 'inicio', component: PacienteDashboard },
      { path: 'nueva-cita', component: NuevaCitaPaciente },
      { path: 'mis-citas', component: MisCitasPaciente },
      { path: 'historial', component: HistorialMedicoPaciente },
      { path: 'cuenta', component: MiCuentaPaciente }
    ]
  },

  // PORTAL PARA MÉDICO
  {
    path: 'organizacion/doctor',
    component: HomeMedico,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DOCTOR'] },
    children: [

    ]
  },

  // PORTAL PARA ADMINISTRACIÓN
  {
    path: 'organizacion/administracion',
    component: HomeAdministracion,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRATION'] },
    children: [

    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
