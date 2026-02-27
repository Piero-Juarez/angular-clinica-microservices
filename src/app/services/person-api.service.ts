import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.development';
import {Observable} from 'rxjs';
import {GenericResponse} from '../models/generic-response';
import {PaginatedResponse} from '../models/paginated-response';
import {DoctorData} from '../models/person/doctor/doctor-data';
import {UpdatePatientRequest} from '../models/person/patient/update-patient-request';

@Injectable({
  providedIn: 'root'
})
export class PersonApiService {

  private httpClient = inject(HttpClient)
  private apiUrl = environment.apiGatewayUrl + environment.pathPerson

  getPatientProfile(uuid: string): Observable<GenericResponse> {
    return this.httpClient.get<GenericResponse>(`${this.apiUrl}/search/patient/${uuid}`)
  }

  updateMyPatientProfile(request: UpdatePatientRequest): Observable<GenericResponse> {
    return this.httpClient.put<GenericResponse>(`${this.apiUrl}/update/patient/me`, request)
  }

  getAllDoctors(specialty: string = '', page: number = 0, size: number = 6): Observable<GenericResponse<PaginatedResponse<DoctorData>>> {
    let url = `${this.apiUrl}/search/doctors?page=${page}&size=${size}`
    if (specialty) { url += `&specialty=${specialty}` }
    return this.httpClient.get<GenericResponse<PaginatedResponse<DoctorData>>>(url)
  }

  getDoctorById(uuid: string): Observable<GenericResponse<DoctorData>> {
    return this.httpClient.get<GenericResponse<DoctorData>>(`${this.apiUrl}/search/doctor/${uuid}`)
  }

}
