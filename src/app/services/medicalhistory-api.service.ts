import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.development';
import {Observable} from 'rxjs';
import {MedicalHistoryResponse} from '../models/medical-history/medical-history-response';

@Injectable({
  providedIn: 'root'
})
export class MedicalhistoryApiService {

  private httpClient = inject(HttpClient)
  private apiUrl = environment.apiGatewayUrl + environment.pathMedicalHistory

  getMyMedicalHistoryPatient(page: number = 0, size: number = 10): Observable<MedicalHistoryResponse> {
    return this.httpClient.get<MedicalHistoryResponse>(`${this.apiUrl}/search/patient/me?page=${page}&size=${size}`)
  }

}
