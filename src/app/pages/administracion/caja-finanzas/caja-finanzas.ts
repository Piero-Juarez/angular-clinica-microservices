import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {FinancesApiService} from '../../../services/finances-api.service';
import {
  CashRegisterResponseDTO,
  CloseCashRegisterRequestDTO, CompletePaymentRequestDTO,
  OpenCashRegisterRequestDTO, Payment
} from '../../../models/finances/finances.models';
import {FormsModule} from '@angular/forms';
import {DatePipe, DecimalPipe} from '@angular/common';
import {forkJoin} from 'rxjs';
import {PersonApiService} from '../../../services/person-api.service';

@Component({
  selector: 'caja-finanzas',
  templateUrl: './caja-finanzas.html',
  imports: [
    FormsModule,
    DecimalPipe,
    DatePipe
  ],
  styleUrl: './caja-finanzas.css'
})
export class CajaFinanzas implements OnInit {

  private financesApiService = inject(FinancesApiService)
  private personApiService = inject(PersonApiService)
  private cdr = inject(ChangeDetectorRef);

  currentRegister: CashRegisterResponseDTO | null = null;
  isLoadingRegister = true;
  showOpenModal = false;
  showCloseModal = false;
  isProcessing = false;
  openData: OpenCashRegisterRequestDTO = { initialBalance: 0, notes: '' };
  closeData: CloseCashRegisterRequestDTO = { actualBalance: 0, notes: '' };

  pendingPayments: Payment[] = [];
  patientDictionary: { [id: string]: string } = {}; // Para guardar nombres reales
  paymentsPage = 0;
  paymentsTotalPages = 0;
  isLoadingPayments = false;

  // Variables Modal de Cobro
  showPaymentModal = false;
  selectedPayment: Payment | null = null;
  paymentData: CompletePaymentRequestDTO = { amount: 0, paymentMethod: 'CASH' };

  ngOnInit() {
    this.checkCurrentRegister();
  }

  // Verifica si el admin tiene una caja abierta
  checkCurrentRegister() {
    this.isLoadingRegister = true;
    this.financesApiService.getMyCurrentRegister().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentRegister = res.data;
          this.loadPendingPayments(0);
        } else {
          this.currentRegister = null; // No hay caja abierta
        }
        this.isLoadingRegister = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.currentRegister = null;
        this.isLoadingRegister = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- APERTURA DE CAJA ---
  abrirModalApertura() {
    this.openData = { initialBalance: 0, notes: '' };
    this.showOpenModal = true;
  }

  confirmarApertura() {
    this.isProcessing = true;
    this.financesApiService.openRegister(this.openData).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentRegister = res.data;
          this.showOpenModal = false;
          this.loadPendingPayments(0);
        }
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al abrir la caja.');
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- CIERRE DE CAJA ---
  abrirModalCierre() {
    if (!this.currentRegister) return;
    // Sugerimos el balance esperado, pero él debe ingresar el real
    this.closeData = { actualBalance: this.currentRegister.expectedBalance, notes: '' };
    this.showCloseModal = true;
  }

  confirmarCierre() {
    this.isProcessing = true;
    this.financesApiService.closeRegister(this.closeData).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentRegister = null; // Caja cerrada exitosamente
          this.showCloseModal = false;
          this.pendingPayments = []; // Limpiamos la lista al cerrar
        }
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al cerrar la caja.');
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // LÓGICA DE PAGOS Y COBROS (NUEVO)
  // ==========================================
  loadPendingPayments(page: number) {
    this.isLoadingPayments = true;
    this.paymentsPage = page;

    this.financesApiService.getPendingPayments(this.paymentsPage, 10).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pendingPayments = res.data.content;
          this.paymentsTotalPages = res.data.page.totalPages;
          this.loadPatientNames();
        }
        this.isLoadingPayments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingPayments = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPatientNames() {
    if (this.pendingPayments.length === 0) return;
    const uniquePatIds = [...new Set(this.pendingPayments.map(p => p.patientId))];
    const requests = uniquePatIds.map(id => this.personApiService.getPatientById(id));

    forkJoin(requests).subscribe({
      next: (responses) => {
        responses.forEach((res, index) => {
          if (res.success && res.data) {
            const p = res.data.personData;
            this.patientDictionary[uniquePatIds[index]] = `${p.name} ${p.lastName}`;
          }
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCobro(payment: Payment) {
    this.selectedPayment = payment;
    this.paymentData = {
      amount: payment.amount,
      paymentMethod: 'CASH' // Por defecto efectivo
    };
    this.showPaymentModal = true;
  }

  confirmarPago() {
    if (!this.selectedPayment) return;
    this.isProcessing = true;

    this.financesApiService.completePayment(this.selectedPayment.id, this.paymentData).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          this.showPaymentModal = false;
          this.checkCurrentRegister(); // Actualizamos la caja (para ver el nuevo balance)
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.message || 'Error al procesar el pago.');
        this.cdr.detectChanges();
      }
    });
  }

}
