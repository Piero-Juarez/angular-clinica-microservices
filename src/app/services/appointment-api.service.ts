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

@Injectable({
  providedIn: 'root'
})
export class AppointmentApiService {

  private httpClient = inject(HttpClient)
  private apiUrl = environment.apiGatewayUrl + environment.pathAppointment

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

  cancelAppointmentPatient(appointmentId: string): Observable<GenericResponse> {
    return this.httpClient.patch<GenericResponse>(`${this.apiUrl}/cancel/patient/me/${appointmentId}`, {})
  }

}
