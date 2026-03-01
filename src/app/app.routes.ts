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
import {AdministracionDashboard} from './pages/administracion/dashboard/administracion-dashboard';
import {ListadoPacientes} from './pages/administracion/listado-pacientes/listado-pacientes';
import {ListadoMedicos} from './pages/administracion/listado-medicos/listado-medicos';
import {ListadoAdministracion} from './pages/administracion/listado-administracion/listado-administracion';
import {ListadoCitas} from './pages/administracion/listado-citas/listado-citas';
import {CajaFinanzas} from './pages/administracion/caja-finanzas/caja-finanzas';
import {RegistroPaciente} from './pages/registro-paciente/registro-paciente';
import {MisHorarios} from './pages/medico/mis-horarios/mis-horarios';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro-paciente', component: RegistroPaciente },

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
      { path: 'mis-horarios', component: MisHorarios }
    ]
  },

  // PORTAL PARA ADMINISTRACIÓN
  {
    path: 'organizacion/administracion',
    component: HomeAdministracion,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRATION'] },
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      { path: 'inicio', component: AdministracionDashboard },
      { path: 'pacientes', component: ListadoPacientes },
      { path: 'medicos', component: ListadoMedicos },
      { path: 'personal', component: ListadoAdministracion },
      { path: 'citas', component: ListadoCitas },
      { path: 'finanzas', component: CajaFinanzas }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
