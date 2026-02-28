import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../../../core/auth/auth.service';
import {PersonApiService} from '../../../services/person-api.service';
import {AppointmentApiService} from '../../../services/appointment-api.service';
import {Appointment} from '../../../models/appointment/appointment';
import {forkJoin} from 'rxjs';
import {DatePipe} from '@angular/common';
import {AdministrationData} from '../../../models/person/administration/administration-data';

@Component({
  selector: 'administracion-dashboard',
  templateUrl: './administracion-dashboard.html',
  imports: [
    DatePipe
  ],
  styleUrl: './administracion-dashboard.css'
})
export class AdministracionDashboard implements OnInit {

  private authService = inject(AuthService)
  private personApiService = inject(PersonApiService)
  private appointmentApiService = inject(AppointmentApiService)
  private cdr = inject(ChangeDetectorRef)

  adminProfile: AdministrationData | null = null;

  // KPIs
  totalPatients = 0;
  totalDoctors = 0;
  totalAppointments = 0;

  // Citas Recientes
  recentAppointments: Appointment[] = [];

  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData()
  }

  loadDashboardData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isLoading = true

    forkJoin({
      profile: this.personApiService.getAdministrationProfile(userId),
      patients: this.personApiService.getTotalPatients(),
      doctors: this.personApiService.getTotalDoctors(),
      appointments: this.appointmentApiService.getAllAppointmentsAdministration(0, 5)
    }).subscribe({
      next: (results) => {
        if (results.profile.success && results.profile.data) {
          this.adminProfile = results.profile.data;
        }
        if (results.patients.success) {
          this.totalPatients = results.patients.data.page.totalElements
        }
        if (results.doctors.success) {
          this.totalDoctors = results.doctors.data.page.totalElements
        }
        if (results.appointments.success) {
          this.totalAppointments = results.appointments.data.page.totalElements
          this.recentAppointments = results.appointments.data.content
        }

        this.isLoading = false
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error()
        this.isLoading = false
        this.cdr.detectChanges()
      }
    });
  }

}
