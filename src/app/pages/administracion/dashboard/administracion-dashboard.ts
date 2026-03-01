import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../../../core/auth/auth.service';
import {PersonApiService} from '../../../services/person-api.service';
import {AppointmentApiService} from '../../../services/appointment-api.service';
import {Appointment} from '../../../models/appointment/appointment';
import {forkJoin} from 'rxjs';
import {DatePipe} from '@angular/common';
import {AdministrationData} from '../../../models/person/administration/administration-data';
import {RegisterDoctorRequestDTO, RegisterPatientRequestDTO} from '../../../models/auth/register-request';
import {AuthApiService} from '../../../services/auth-api.service';
import {FormsModule} from '@angular/forms';
import {PatientData} from '../../../models/person/patient/patient-data';
import {DoctorData} from '../../../models/person/doctor/doctor-data';
import {TimeslotResponse} from '../../../models/appointment/schedule/timeslot-response';
import {CreateAppointmentRequest} from '../../../models/appointment/schedule/createappointment-request';

@Component({
  selector: 'administracion-dashboard',
  templateUrl: './administracion-dashboard.html',
  imports: [
    DatePipe,
    FormsModule
  ],
  styleUrl: './administracion-dashboard.css'
})
export class AdministracionDashboard implements OnInit {

  private authService = inject(AuthService)
  private authApiService = inject(AuthApiService)
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

  // ==========================================
  // VARIABLES DE MODALES (QUICK ACTIONS)
  // ==========================================
  showPatientModal = false;
  showDoctorModal = false;
  showAppointmentModal = false;
  isProcessing = false;

  // Objeto base para resetear
  private defaultPersonData = { name: '', lastName: '', documentType: 'DNI', documentNumber: '', birthDate: '', biologicalSex: 'M', phone: '', address: '', ubigeo: '' };

  patientData: RegisterPatientRequestDTO = {
    email: '', password: '',
    personData: { ...this.defaultPersonData },
    patientData: { bloodType: '', healthInsurance: '', policyNumber: '', occupation: '', maritalStatus: 'SINGLE', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '', consentData: true }
  };

  doctorData: RegisterDoctorRequestDTO = {
    email: '', password: '',
    personData: { ...this.defaultPersonData },
    doctorData: { cmp: '', rne: '', mainSpecialty: '', universityOfOrigin: '', yearsOfExperience: 0, averageConsultationTime: 30, contractType: 'FULL_TIME', baseSalary: 0, publicBiography: '' }
  };

  // ==========================================
  // VARIABLES: AGENDAR CITA ADMIN
  // ==========================================
  searchDocumentNumber = '';
  foundPatient: PatientData | null = null;
  patientSearchError = '';
  isSearchingPatient = false;

  doctorsList: DoctorData[] = [];
  availableTimes: TimeslotResponse[] = [];
  isLoadingTimes = false;
  todayDate = '';

  newAppointment: CreateAppointmentRequest = {
    doctorId: '',
    date: '',
    time: '',
    notes: ''
  };

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
      error: () => {
        console.error()
        this.isLoading = false
        this.cdr.detectChanges()
      }
    });
  }

  // --- MÉTODOS PACIENTE ---
  abrirModalPaciente() { this.showPatientModal = true; }
  cerrarModalPaciente() { this.showPatientModal = false; }

  registrarPaciente() {
    this.isProcessing = true;
    this.authApiService.registerPatient(this.patientData).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          alert('¡Paciente registrado exitosamente!');
          this.cerrarModalPaciente();
          this.loadDashboardData(); // Recarga los KPIs
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.message || 'Error al registrar paciente.');
        this.cdr.detectChanges();
      }
    });
  }

  // --- MÉTODOS MÉDICO ---
  abrirModalMedico() { this.showDoctorModal = true; }
  cerrarModalMedico() { this.showDoctorModal = false; }

  registrarMedico() {
    this.isProcessing = true;
    this.authApiService.registerDoctor(this.doctorData).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          alert('¡Médico registrado exitosamente!');
          this.cerrarModalMedico();
          this.loadDashboardData(); // Recarga los KPIs
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.message || 'Error al registrar médico.');
        this.cdr.detectChanges();
      }
    });
  }

  // --- MÉTODOS CITA ---
  abrirModalCita() {
    this.showAppointmentModal = true;
    this.limpiarFormularioCita();
    this.setTodayDate();
    this.cargarListaMedicos();
  }

  cerrarModalCita() {
    this.showAppointmentModal = false;
  }

  setTodayDate() {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  limpiarFormularioCita() {
    this.searchDocumentNumber = '';
    this.foundPatient = null;
    this.patientSearchError = '';
    this.availableTimes = [];
    this.newAppointment = { doctorId: '', date: '', time: '', notes: '' };
  }

  // 1. CARGAR LISTA DE MÉDICOS (Para el selector)
  cargarListaMedicos() {
    // Pedimos un size grande (ej: 50) para tener a todos los médicos disponibles en el selector
    this.personApiService.getAllDoctors('', 0, 50).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.doctorsList = res.data.content;
        }
      }
    });
  }

  // 2. BUSCAR PACIENTE
  buscarPacientePorDocumento() {
    if (!this.searchDocumentNumber.trim()) return;

    this.isSearchingPatient = true;
    this.patientSearchError = '';
    this.foundPatient = null;

    this.personApiService.getPatientByDocumentNumber(this.searchDocumentNumber.trim()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.foundPatient = res.data;
        }
        this.isSearchingPatient = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.patientSearchError = 'No se encontró ningún paciente con ese documento.';
        this.isSearchingPatient = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 3. CARGAR HORARIOS CUANDO CAMBIA MÉDICO O FECHA
  onDoctorOrDateChange() {
    this.newAppointment.time = ''; // Limpiamos la hora seleccionada
    this.availableTimes = [];

    if (!this.newAppointment.doctorId || !this.newAppointment.date) return;

    if (this.newAppointment.date < this.todayDate) {
      alert('No puedes seleccionar fechas pasadas.');
      return;
    }

    this.isLoadingTimes = true;
    this.appointmentApiService.getDoctorScheduleAvailability(this.newAppointment.doctorId, this.newAppointment.date).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableTimes = res.data.slots || [];
        }
        this.isLoadingTimes = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingTimes = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarHoraCita(time: string) {
    this.newAppointment.time = time;
  }

  // 4. GUARDAR LA CITA
  agendarCitaAdmin() {
    if (!this.foundPatient || !this.newAppointment.time) return;

    this.isProcessing = true;

    // Formatear hora si viene como HH:mm en vez de HH:mm:ss
    if (this.newAppointment.time.length === 5) {
      this.newAppointment.time += ':00';
    }

    this.appointmentApiService.createAppointmentAdmin(this.foundPatient.id, this.newAppointment).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          alert('¡Cita agendada exitosamente!');
          this.cerrarModalCita();
          this.loadDashboardData(); // Recargar KPIs del dashboard
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.message || 'Error al agendar la cita.');
        this.cdr.detectChanges();
      }
    });
  }

}
