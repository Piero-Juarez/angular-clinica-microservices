import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.development';
import {Observable} from 'rxjs';
import {GenericResponse} from '../models/generic-response';
import {
  CashRegisterResponseDTO, CloseCashRegisterRequestDTO, CompletePaymentRequestDTO,
  OpenCashRegisterRequestDTO,
  PaginatedFinances, Payment
} from '../models/finances/finances.models';

@Injectable({
  providedIn: 'root'
})
export class FinancesApiService {

  private httpClient = inject(HttpClient)
  private apiUrl = environment.apiGatewayUrl + environment.pathFinances

  // --- CAJA (CASH REGISTER) ---
  getMyCurrentRegister(): Observable<GenericResponse<CashRegisterResponseDTO>> {
    return this.httpClient.get<GenericResponse<CashRegisterResponseDTO>>(`${this.apiUrl}/search/cash-register/me/current`);
  }

  getMyRegisterHistory(page: number = 0, size: number = 10): Observable<GenericResponse<PaginatedFinances<CashRegisterResponseDTO>>> {
    return this.httpClient.get<GenericResponse<PaginatedFinances<CashRegisterResponseDTO>>>(`${this.apiUrl}/search/cash-register/me/history?page=${page}&size=${size}`);
  }

  openRegister(request: OpenCashRegisterRequestDTO): Observable<GenericResponse<CashRegisterResponseDTO>> {
    return this.httpClient.post<GenericResponse<CashRegisterResponseDTO>>(`${this.apiUrl}/cash-register/open`, request);
  }

  closeRegister(request: CloseCashRegisterRequestDTO): Observable<GenericResponse<CashRegisterResponseDTO>> {
    return this.httpClient.put<GenericResponse<CashRegisterResponseDTO>>(`${this.apiUrl}/cash-register/close`, request);
  }

  // --- PAGOS (PAYMENTS) ---
  getPendingPayments(page: number = 0, size: number = 10): Observable<GenericResponse<PaginatedFinances<Payment>>> {
    return this.httpClient.get<GenericResponse<PaginatedFinances<Payment>>>(`${this.apiUrl}/payments/pendings?page=${page}&size=${size}`);
  }

  completePayment(paymentId: string, request: CompletePaymentRequestDTO): Observable<GenericResponse<Payment>> {
    return this.httpClient.put<GenericResponse<Payment>>(`${this.apiUrl}/payment/pay/${paymentId}`, request);
  }

}
