import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AppointmentApiService} from '../../../services/appointment-api.service';
import {PersonApiService} from '../../../services/person-api.service';
import {Appointment} from '../../../models/appointment/appointment';
import {UpdateAppointmentRequest} from '../../../models/appointment/update-appointment-request';
import {TimeslotResponse} from '../../../models/appointment/schedule/timeslot-response';
import {forkJoin} from 'rxjs';
import {DatePipe, NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'listado-citas',
  templateUrl: './listado-citas.html',
  imports: [
    NgClass,
    DatePipe,
    FormsModule
  ],
  styleUrl: './listado-citas.css'
})
export class ListadoCitas implements OnInit {

  private personApiService = inject(PersonApiService)
  private appointmentApiService = inject(AppointmentApiService)
  private cdr = inject(ChangeDetectorRef)

  appointments: Appointment[] = []
  doctorDictionary: { [id: string]: string } = {}
  patientDictionary: { [id: string]: string } = {}

  currentPage = 0
  totalPages = 0
  totalElements = 0
  isLoading = true

  // Modales
  showCancelModal = false
  showUpdateModal = false
  selectedAppointment: Appointment | null = null
  isProcessing = false

  // Datos para actualizar
  updateData: UpdateAppointmentRequest = { appointmentDate: '', appointmentTime: '', notes: '' }
  availableUpdateTimes: TimeslotResponse[] = []
  isLoadingTimes = false
  todayDate = ''

  ngOnInit(): void {
    this.setTodayDate()
    this.loadAppointments(0)
  }

  setTodayDate() {
    const today = new Date()
    this.todayDate = today.toISOString().split('T')[0]
  }

  loadAppointments(page: number) {
    this.isLoading = true;
    this.currentPage = page;

    this.appointmentApiService.getAllAppointmentsAdministration(this.currentPage, 10).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.appointments = res.data.content;
          this.totalPages = res.data.page.totalPages;
          this.totalElements = res.data.page.totalElements;
          this.cargarNombresDiccionarios();
        } else {
          this.isLoading = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarNombresDiccionarios() {
    if (this.appointments.length === 0) {
      this.isLoading = false;
      return;
    }

    const uniqueDocIds = [...new Set(this.appointments.map(a => a.doctorId))];
    const uniquePatIds = [...new Set(this.appointments.map(a => a.patientId))];

    const docRequests = uniqueDocIds.map(id => this.personApiService.getDoctorById(id));
    const patRequests = uniquePatIds.map(id => this.personApiService.getPatientById(id));

    forkJoin([...docRequests, ...patRequests]).subscribe({
      next: (responses) => {
        for (let i = 0; i < uniqueDocIds.length; i++) {
          const res = responses[i];
          if (res && res.success) this.doctorDictionary[uniqueDocIds[i]] = `Dr(a). ${res.data.personData.lastName}`;
        }
        for (let i = 0; i < uniquePatIds.length; i++) {
          const res = responses[uniqueDocIds.length + i];
          if (res && res.success) this.patientDictionary[uniquePatIds[i]] = `${res.data.personData.name} ${res.data.personData.lastName}`;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // CANCELAR CITA
  // ==========================================
  abrirModalCancelar(cita: Appointment) {
    this.selectedAppointment = cita;
    this.showCancelModal = true;
  }

  confirmarCancelacion() {
    if (!this.selectedAppointment) return;
    this.isProcessing = true;

    this.appointmentApiService.cancelAppointmentAdministration(this.selectedAppointment.id).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          this.showCancelModal = false;
          this.loadAppointments(this.currentPage);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.message || 'Error al cancelar la cita.');
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // MODIFICAR CITA
  // ==========================================
  abrirModalModificar(cita: Appointment) {
    this.selectedAppointment = cita;
    this.updateData = {
      appointmentDate: cita.appointmentDate,
      appointmentTime: cita.appointmentTime,
      notes: cita.notes || ''
    };
    this.showUpdateModal = true;
    this.cargarHorariosDisponibles();
  }

  cargarHorariosDisponibles() {
    if (!this.updateData.appointmentDate || !this.selectedAppointment) return;

    if (this.updateData.appointmentDate < this.todayDate) {
      this.availableUpdateTimes = [];
      return;
    }

    this.isLoadingTimes = true;
    this.appointmentApiService.getDoctorScheduleAvailability(this.selectedAppointment.doctorId, this.updateData.appointmentDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableUpdateTimes = res.data.slots || [];
        }
        this.isLoadingTimes = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.availableUpdateTimes = [];
        this.isLoadingTimes = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarNuevaHora(time: string) {
    this.updateData.appointmentTime = time;
  }

  confirmarModificacion() {
    if (!this.selectedAppointment || !this.updateData.appointmentTime) return;

    this.isProcessing = true;
    if (this.updateData.appointmentTime.length === 5) this.updateData.appointmentTime += ':00';

    this.appointmentApiService.updateAppointmentAdministration(this.selectedAppointment.id, this.updateData).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          this.showUpdateModal = false;
          this.loadAppointments(this.currentPage);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.message || 'Error al modificar la cita.');
        this.cdr.detectChanges();
      }
    });
  }

}
