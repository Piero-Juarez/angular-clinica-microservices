import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AppointmentApiService} from '../../../services/appointment-api.service';
import {PersonApiService} from '../../../services/person-api.service';
import {AuthService} from '../../../core/auth/auth.service';
import {PatientData} from '../../../models/person/patient/patient-data';
import {Appointment} from '../../../models/appointment/appointment';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'paciente-dashboard',
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './paciente-dashboard.html',
  styleUrl: './paciente-dashboard.css'
})
export class PacienteDashboard implements OnInit {

  private authService = inject(AuthService)
  private appointmentApiService = inject(AppointmentApiService)
  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef);

  // Variables fuertemente tipadas
  patientProfile: PatientData | null = null;
  appointments: Appointment[] = [];

  isLoadingProfile = true;
  isLoadingAppointments = true;

  ngOnInit(): void {
    this.loadDashboardData()
  }

  loadDashboardData() {
    const userUuid = this.authService.getUserId()
    if (!userUuid) {
      this.isLoadingProfile = false
      this.isLoadingAppointments = false
      this.cdr.detectChanges()
      return
    }

    // Cargar Perfil
    this.personApiService.getPatientProfile(userUuid).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.patientProfile = response.data
        }
        this.isLoadingProfile = false
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error('Error al cargar el perfil del paciente:', err)
        this.isLoadingProfile = false
        this.cdr.detectChanges()
      }
    })

    // Cargar Citas
    this.appointmentApiService.getMyAppointmentsPatient().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.appointments = response.data.content
        }
        this.isLoadingAppointments = false
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error('Error al cargar las citas del paciente:', err)
        this.isLoadingAppointments = false
        this.cdr.detectChanges()
      }
    })
  }

}
