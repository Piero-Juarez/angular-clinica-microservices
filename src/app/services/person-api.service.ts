import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.development';
import {Observable} from 'rxjs';
import {GenericResponse} from '../models/generic-response';
import {PaginatedResponse} from '../models/paginated-response';
import {DoctorData} from '../models/person/doctor/doctor-data';
import {UpdatePatientRequest} from '../models/person/patient/update-patient-request';
import {AdministrationData} from '../models/person/administration/administration-data';
import {PatientData} from '../models/person/patient/patient-data';

@Injectable({
  providedIn: 'root'
})
export class PersonApiService {

  private httpClient = inject(HttpClient)
  private apiUrl = environment.apiGatewayUrl + environment.pathPerson

  // Truco para saber el total de registros
  getTotalPatients(): Observable<GenericResponse<PaginatedResponse<any>>> {
    return this.httpClient.get<GenericResponse<PaginatedResponse<any>>>(`${this.apiUrl}/search/patients?page=0&size=1`)
  }

  // Truco para saber el total de registros
  getTotalDoctors(): Observable<GenericResponse<PaginatedResponse<any>>> {
    return this.httpClient.get<GenericResponse<PaginatedResponse<any>>>(`${this.apiUrl}/search/doctors?page=0&size=1`)
  }

  getAllPatients(page: number = 0, size: number = 10): Observable<GenericResponse<PaginatedResponse<PatientData>>> {
    return this.httpClient.get<GenericResponse<PaginatedResponse<PatientData>>>(`${this.apiUrl}/search/patients?page=${page}&size=${size}`)
  }

  getPatientById(uuid: string): Observable<GenericResponse> {
    return this.httpClient.get<GenericResponse>(`${this.apiUrl}/search/patient/${uuid}`)
  }

  getPatientByDocumentNumber(documentNumber: string): Observable<GenericResponse<PatientData>> {
    return this.httpClient.get<GenericResponse<PatientData>>(`${this.apiUrl}/search/patient/document/${documentNumber}`)
  }

  updateMyPatientProfile(request: UpdatePatientRequest): Observable<GenericResponse> {
    return this.httpClient.put<GenericResponse>(`${this.apiUrl}/update/patient/me`, request)
  }

  deletePatient(uuid: string): Observable<GenericResponse> {
    return this.httpClient.delete<GenericResponse>(`${this.apiUrl}/delete/patient/${uuid}`)
  }

  getAllDoctors(specialty: string = '', page: number = 0, size: number = 6): Observable<GenericResponse<PaginatedResponse<DoctorData>>> {
    let url = `${this.apiUrl}/search/doctors?page=${page}&size=${size}`
    if (specialty) { url += `&specialty=${specialty}` }
    return this.httpClient.get<GenericResponse<PaginatedResponse<DoctorData>>>(url)
  }

  getDoctorById(uuid: string): Observable<GenericResponse<DoctorData>> {
    return this.httpClient.get<GenericResponse<DoctorData>>(`${this.apiUrl}/search/doctor/${uuid}`)
  }

  getDoctorByCredentials(cmp: string, rne: string): Observable<GenericResponse<DoctorData>> {
    let url = `${this.apiUrl}/search/doctor/credentials?`;
    if (cmp) url += `cmp=${cmp}&`;
    if (rne) url += `rne=${rne}`;

    return this.httpClient.get<GenericResponse<DoctorData>>(url);
  }

  deleteDoctor(uuid: string): Observable<GenericResponse> {
    return this.httpClient.delete<GenericResponse>(`${this.apiUrl}/delete/doctor/${uuid}`)
  }

  getAdministrationProfile(uuid: string): Observable<GenericResponse<AdministrationData>> {
    return this.httpClient.get<GenericResponse<AdministrationData>>(`${this.apiUrl}/search/administration/${uuid}`)
  }

  getAllAdministrations(page: number = 0, size: number = 10): Observable<GenericResponse<PaginatedResponse<AdministrationData>>> {
    return this.httpClient.get<GenericResponse<PaginatedResponse<AdministrationData>>>(`${this.apiUrl}/search/administrations?page=${page}&size=${size}`)
  }

  deleteAdministration(uuid: string): Observable<GenericResponse> {
    return this.httpClient.delete<GenericResponse>(`${this.apiUrl}/delete/administration/${uuid}`)
  }

}
