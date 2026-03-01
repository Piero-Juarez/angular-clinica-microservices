import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginRequest} from '../models/login/login-request';
import {Observable} from 'rxjs';
import {GenericResponse} from '../models/generic-response';
import {environment} from '../../environments/environment.development';
import {RegisterDoctorRequestDTO, RegisterPatientRequestDTO} from '../models/auth/register-request';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  private httpClient = inject(HttpClient)
  private apiUrl = environment.apiGatewayUrl + environment.pathAuth

  login(credentials: LoginRequest): Observable<GenericResponse> {
    return this.httpClient.post<GenericResponse>(`${this.apiUrl}/login`, credentials)
  }

  registerPatient(request: RegisterPatientRequestDTO): Observable<GenericResponse> {
    return this.httpClient.post<GenericResponse<any>>(`${this.apiUrl}/register/patient`, request);
  }

  registerDoctor(request: RegisterDoctorRequestDTO): Observable<GenericResponse> {
    return this.httpClient.post<GenericResponse<any>>(`${this.apiUrl}/register/doctor`, request);
  }

}
