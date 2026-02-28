import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AppointmentApiService} from '../../../services/appointment-api.service';
import {Appointment} from '../../../models/appointment/appointment';
import {DatePipe, NgClass} from '@angular/common';
import {forkJoin} from 'rxjs';
import {PersonApiService} from '../../../services/person-api.service';
import {UpdateAppointmentRequest} from '../../../models/appointment/update-appointment-request';
import {TimeslotResponse} from '../../../models/appointment/schedule/timeslot-response';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'mis-citas-paciente',
  imports: [
    NgClass,
    DatePipe,
    FormsModule
  ],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css'
})
export class MisCitasPaciente implements OnInit {

  private appointmentApiService = inject(AppointmentApiService)
  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef)

  appointments: Appointment[] = []
  doctorDictionary: { [id: string]: string } = {};

  currentPage = 0
  totalPages = 0
  totalElements = 0
  isLoading = true

  // Variables para cancelar cita
  showCancelModal = false;
  appointmentToCancel: string | null = null;
  isCancelling = false;

  // Variables para modificar cita
  showUpdateModal = false;
  appointmentToUpdate: Appointment | null = null;
  updateData: UpdateAppointmentRequest = { appointmentDate: '', appointmentTime: '', notes: '' };
  availableUpdateTimes: TimeslotResponse[] = [];
  isLoadingTimes = false;
  isUpdating = false;
  todayDate = '';

  ngOnInit(): void {
    this.loadAppointments()
    this.setTodayDate()
  }

  setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.todayDate = `${year}-${month}-${day}`;
  }

  loadAppointments(page: number = 0) {
    this.isLoading = true
    this.currentPage = page

    // Le pasamos la página actual y el tamaño 20 que solicitaste
    this.appointmentApiService.getMyAppointmentsPatient(this.currentPage, 20).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.appointments = res.data.content
          this.totalPages = res.data.page.totalPages
          this.totalElements = res.data.page.totalElements

          this.loadDoctorsForAppointments()
        } else {
          this.isLoading = false
        }
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error()
        this.isLoading = false
        this.cdr.detectChanges()
      }
    });
  }

  loadDoctorsForAppointments() {
    if (this.appointments.length === 0) {
      this.isLoading = false
      return
    }

    const allDoctorIds = this.appointments.map(cita => cita.doctorId)
    const uniqueDoctorIds = [...new Set(allDoctorIds)]

    const requests = uniqueDoctorIds.map(id => this.personApiService.getDoctorById(id))

    forkJoin(requests).subscribe({
      next: (responses) => {
        responses.forEach((res, index) => {
          if (res.success && res.data) {
            const doc = res.data
            const doctorId = uniqueDoctorIds[index]
            this.doctorDictionary[doctorId] = `Dr(a). ${doc.personData.name} ${doc.personData.lastName} (${doc.mainSpecialty})`
          }
        });
        this.isLoading = false
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error()
        this.isLoading = false
        this.cdr.detectChanges()
      }
    })
  }

  // ==========================================
  // LÓGICA: MODIFICAR CITA
  // ==========================================
  abrirModalModificar(cita: Appointment) {
    this.appointmentToUpdate = cita;
    this.updateData = {
      appointmentDate: cita.appointmentDate,
      appointmentTime: cita.appointmentTime,
      notes: cita.notes || ''
    };
    this.showUpdateModal = true;

    // Al abrir, cargamos los horarios del día que ya tenía seleccionado
    this.cargarHorariosParaModificacion();
  }

  cerrarModalModificar() {
    this.showUpdateModal = false;
    this.appointmentToUpdate = null;
    this.availableUpdateTimes = [];
  }

  cargarHorariosParaModificacion() {
    if (!this.updateData.appointmentDate || !this.appointmentToUpdate) return;

    // Bloqueo de fecha pasada
    if (this.updateData.appointmentDate < this.todayDate) {
      this.availableUpdateTimes = [];
      this.updateData.appointmentTime = '';
      return;
    }

    this.isLoadingTimes = true;
    this.appointmentApiService.getDoctorScheduleAvailability(this.appointmentToUpdate.doctorId, this.updateData.appointmentDate).subscribe({
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
    if (!this.appointmentToUpdate || !this.updateData.appointmentTime) return;

    this.isUpdating = true;

    // Formateamos la hora si es necesario
    if (this.updateData.appointmentTime.length === 5) {
      this.updateData.appointmentTime += ':00';
    }

    this.appointmentApiService.updateAppointmentPatient(this.appointmentToUpdate.id, this.updateData).subscribe({
      next: (res) => {
        this.isUpdating = false;
        if (res.success) {
          this.cerrarModalModificar();
          this.loadAppointments(this.currentPage); // Recargamos la tabla para ver los cambios
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUpdating = false;
        alert(err.error?.message || 'Error al modificar la cita.');
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // LÓGICA: CANCELAR CITA
  // ==========================================
  abrirModalCancelar(id: string) {
    this.appointmentToCancel = id;
    this.showCancelModal = true;
  }

  cerrarModalCancelar() {
    this.showCancelModal = false;
    this.appointmentToCancel = null;
  }

  confirmarCancelacion() {
    if (!this.appointmentToCancel) return;
    this.isCancelling = true;

    this.appointmentApiService.cancelAppointmentPatient(this.appointmentToCancel).subscribe({
      next: (res) => {
        this.isCancelling = false;
        if (res.success) {
          this.cerrarModalCancelar();
          this.loadAppointments(this.currentPage);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error();
        this.isCancelling = false;
        alert('Ocurrió un error al intentar cancelar la cita.');
        this.cdr.detectChanges();
      }
    });
  }

}
