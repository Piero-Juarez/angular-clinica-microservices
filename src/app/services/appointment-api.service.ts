import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.development';
import {Observable} from 'rxjs';
import {GenericResponse} from '../models/generic-response';
import {DailyScheduleResponse} from '../models/appointment/schedule/dailyschedule-response';
import {CreateAppointmentRequest} from '../models/appointment/schedule/createappointment-request';
import {PaginatedResponse} from '../models/paginated-response';
import {Appointment} from '../models/appointment/appointment';
import {UpdateAppointmentRequest} from '../models/appointment/update-appointment-request';
import {DoctorSchedule} from '../models/appointment/schedule/DoctorSchedule';
import {SavedScheduleRequestDTO} from '../models/appointment/schedule/SavedScheduleRequestDTO';

@Injectable({
  providedIn: 'root'
})
export class AppointmentApiService {

  private httpClient = inject(HttpClient)
  private apiUrl = environment.apiGatewayUrl + environment.pathAppointment

  getAllAppointmentsAdministration(page: number = 0, size: number = 10): Observable<GenericResponse<PaginatedResponse<Appointment>>> {
    return this.httpClient.get<GenericResponse<PaginatedResponse<Appointment>>>(`${this.apiUrl}/search/administration/all?page=${page}&size=${size}`)
  }

  getMyAppointmentsPatient(page: number = 0, size: number = 10): Observable<GenericResponse<PaginatedResponse<Appointment>>> {
    return this.httpClient.get<GenericResponse<PaginatedResponse<Appointment>>>(`${this.apiUrl}/search/patient/me?page=${page}&size=${size}`)
  }

  getDoctorScheduleAvailability(doctorUuid: string, date: string): Observable<GenericResponse<DailyScheduleResponse>> {
    return this.httpClient.get<GenericResponse<DailyScheduleResponse>>(
      `${this.apiUrl}/search/schedules/doctor/${doctorUuid}?date=${date}`
    )
  }

  createAppointmentPatient(request: CreateAppointmentRequest): Observable<GenericResponse> {
    return this.httpClient.post<GenericResponse>(`${this.apiUrl}/create/patient/me`, request)
  }

  updateAppointmentPatient(appointmentId: string, request: UpdateAppointmentRequest): Observable<GenericResponse> {
    return this.httpClient.put<GenericResponse>(`${this.apiUrl}/update/patient/me/${appointmentId}`, request)
  }

  createAppointmentAdmin(patientId: string, request: CreateAppointmentRequest): Observable<GenericResponse> {
    return this.httpClient.post<GenericResponse<any>>(`${this.apiUrl}/create/for-patient/${patientId}`, request);
  }

  updateAppointmentAdministration(appointmentId: string, request: UpdateAppointmentRequest): Observable<GenericResponse> {
    return this.httpClient.put<GenericResponse>(`${this.apiUrl}/update/for-patient/${appointmentId}`, request);
  }

  cancelAppointmentPatient(appointmentId: string): Observable<GenericResponse> {
    return this.httpClient.patch<GenericResponse>(`${this.apiUrl}/cancel/patient/me/${appointmentId}`, {})
  }

  cancelAppointmentAdministration(appointmentId: string): Observable<GenericResponse> {
    return this.httpClient.patch<GenericResponse>(`${this.apiUrl}/cancel/for-patient/${appointmentId}`, {})
  }

  getMySchedules(): Observable<GenericResponse<DoctorSchedule[]>> {
    return this.httpClient.get<GenericResponse<DoctorSchedule[]>>(`${this.apiUrl}/search/schedules/doctor/me`);
  }

  // 2. Crear horarios (Recibe una lista)
  createMySchedules(requests: SavedScheduleRequestDTO[]): Observable<GenericResponse> {
    return this.httpClient.post<GenericResponse<any>>(`${this.apiUrl}/create/schedules/me`, requests);
  }

  // 3. Modificar un horario existente
  updateMySchedule(scheduleUuid: string, request: SavedScheduleRequestDTO): Observable<GenericResponse> {
    return this.httpClient.put<GenericResponse<any>>(`${this.apiUrl}/update/schedules/me/${scheduleUuid}`, request);
  }

}
