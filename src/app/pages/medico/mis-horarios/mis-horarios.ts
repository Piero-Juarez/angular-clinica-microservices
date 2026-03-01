import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AppointmentApiService} from '../../../services/appointment-api.service';
import {DoctorSchedule} from '../../../models/appointment/schedule/DoctorSchedule';
import {SavedScheduleRequestDTO} from '../../../models/appointment/schedule/SavedScheduleRequestDTO';
import {NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'mis-horarios',
  templateUrl: './mis-horarios.html',
  imports: [
    NgClass,
    FormsModule
  ],
  styleUrl: './mis-horarios.css'
})
export class MisHorarios implements OnInit {

  private appointmentApi = inject(AppointmentApiService);
  private cdr = inject(ChangeDetectorRef)

  schedules: DoctorSchedule[] = []; // 👈 Actualizado
  isLoading = true;

  // Variables para el Modal
  showModal = false;
  isProcessing = false;
  isEditing = false;
  editingScheduleId: string | null = null;

  // Diccionario para traducir días
  daysDictionary: { [key: string]: string } = {
    'MONDAY': 'Lunes', 'TUESDAY': 'Martes', 'WEDNESDAY': 'Miércoles',
    'THURSDAY': 'Jueves', 'FRIDAY': 'Viernes', 'SATURDAY': 'Sábado', 'SUNDAY': 'Domingo'
  };

  formData: SavedScheduleRequestDTO = {
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '14:00',
    slotDurationMinutes: 30,
    isActive: true
  };

  ngOnInit() {
    this.loadMySchedules();
  }

  loadMySchedules() {
    this.isLoading = true;
    this.appointmentApi.getMySchedules().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.schedules = res.data;
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

  abrirModalCrear() {
    this.isEditing = false;
    this.editingScheduleId = null;
    this.formData = { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '14:00', slotDurationMinutes: 30, isActive: true };
    this.showModal = true;
  }

  // 👈 Usamos la nueva interfaz aquí
  abrirModalEditar(schedule: DoctorSchedule) {
    this.isEditing = true;
    this.editingScheduleId = schedule.id;
    this.formData = {
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime.substring(0, 5),
      endTime: schedule.endTime.substring(0, 5),
      slotDurationMinutes: schedule.slotDurationMinutes,
      isActive: schedule.isActive
    };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarHorario() {
    if (!this.formData.startTime || !this.formData.endTime || !this.formData.slotDurationMinutes) {
      alert('Por favor completa todos los campos.');
      return;
    }

    this.isProcessing = true;

    const requestData: SavedScheduleRequestDTO = {
      ...this.formData,
      startTime: this.formData.startTime.length === 5 ? `${this.formData.startTime}:00` : this.formData.startTime,
      endTime: this.formData.endTime.length === 5 ? `${this.formData.endTime}:00` : this.formData.endTime,
    };

    if (this.isEditing && this.editingScheduleId) {
      this.appointmentApi.updateMySchedule(this.editingScheduleId, requestData).subscribe({
        next: (res) => this.procesarRespuestaExitosa(res),
        error: (err) => this.procesarError(err)
      });
    } else {
      this.appointmentApi.createMySchedules([requestData]).subscribe({
        next: (res) => this.procesarRespuestaExitosa(res),
        error: (err) => this.procesarError(err)
      });
    }
  }

  private procesarRespuestaExitosa(res: any) {
    this.isProcessing = false;
    if (res.success) {
      this.cerrarModal();
      this.loadMySchedules();
    }
    this.cdr.detectChanges();
  }

  private procesarError(err: any) {
    this.isProcessing = false;
    alert(err.error?.message || 'Error al guardar el horario.');
    this.cdr.detectChanges();
  }

}
