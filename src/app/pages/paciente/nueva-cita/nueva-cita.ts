import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AppointmentApiService} from '../../../services/appointment-api.service';
import {PersonApiService} from '../../../services/person-api.service';
import {Router} from '@angular/router';
import {DoctorData} from '../../../models/person/doctor/doctor-data';
import {TimeslotResponse} from '../../../models/appointment/schedule/timeslot-response';
import {CreateAppointmentRequest} from '../../../models/appointment/schedule/createappointment-request';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'nueva-cita-paciente',
  imports: [
    FormsModule

  ],
  templateUrl: './nueva-cita.html',
  styleUrl: './nueva-cita.css'
})
export class NuevaCitaPaciente implements OnInit {

  private appointmentApiService = inject(AppointmentApiService)
  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router)

  // Control del Wizard
  step = 1;

  // Paso 1: Médicos
  doctors: DoctorData[] = [];
  specialtySearch = '';
  currentPage = 0;
  totalPages = 0;
  isLoadingDoctors = false;

  // Paso 2: Reserva
  selectedDoctor: DoctorData | null = null;
  selectedDate = '';
  availableTimes: TimeslotResponse[] = [];
  isLoadingSchedule = false;

  // Datos del formulario final
  appointmentData: CreateAppointmentRequest = {
    doctorId: '',
    date: '',
    time: '',
    notes: ''
  };
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Manejo de fechas de citas
  todayDate: string = '';
  dateErrorMessage: string = '';

  ngOnInit(): void {
    this.loadDoctors();
    this.setTodayDate();
  }

  // Obtenemos la fecha actual en formato YYYY-MM-DD
  setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.todayDate = `${year}-${month}-${day}`;
  }

  // === PASO 1: LÓGICA DE MÉDICOS ===
  loadDoctors(page: number = 0) {
    this.isLoadingDoctors = true;
    this.currentPage = page;
    this.personApiService.getAllDoctors(this.specialtySearch, this.currentPage, 6).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.doctors = res.data.content;
          this.totalPages = res.data.page.totalPages;
        }
        this.isLoadingDoctors = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingDoctors = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.loadDoctors(0); // Reinicia a la página 0 al buscar
  }

  selectDoctor(doctor: DoctorData) {
    this.selectedDoctor = doctor;
    this.appointmentData.doctorId = doctor.id;
    this.step = 2; // Avanzamos al paso 2
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  // === PASO 2: LÓGICA DE HORARIOS Y RESERVA ===
  goBack() {
    this.step = 1;
    this.selectedDoctor = null;
    this.selectedDate = '';
    this.appointmentData.time = '';
    this.cdr.detectChanges();
  }

  onDateChange() {
    if (!this.selectedDate) return;

    // Validación de fecha menor a la actual
    if (this.selectedDate < this.todayDate) {
      this.dateErrorMessage = 'No se aceptan citas con fechas pasadas. Por favor, elija otra.';
      this.availableTimes = [];
      this.appointmentData.time = '';
      this.cdr.detectChanges();
      return;
    }

    this.dateErrorMessage = '';
    this.isLoadingSchedule = true;
    this.appointmentData.date = this.selectedDate;
    this.appointmentData.time = ''; // Limpiamos la hora elegida anteriormente

    this.appointmentApiService.getDoctorScheduleAvailability(this.selectedDoctor!.id, this.selectedDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableTimes = res.data.slots || [];
        }
        this.isLoadingSchedule = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.availableTimes = [];
        this.isLoadingSchedule = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectTime(time: string) {
    this.appointmentData.time = time;
  }

  submitAppointment() {
    this.isSubmitting = true;
    this.errorMessage = '';

    // Si tu backend espera LocalTime, asegurate de mandar formato HH:mm:ss
    if (this.appointmentData.time.length === 5) {
      this.appointmentData.time += ':00';
    }

    this.appointmentApiService.createAppointmentPatient(this.appointmentData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.successMessage = '¡Cita reservada con éxito!';
          this.step = 3; // Paso final de éxito
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Error al reservar la cita.';
        this.cdr.detectChanges();
      }
    });
  }

  finish() {
    this.router.navigate(['/paciente/inicio']).then();
  }

}
