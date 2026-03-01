// ================= CAJA (CASH REGISTER) =================
import {PageMetadata} from '../page-metadata';

export interface CashRegisterResponseDTO {
  id: string;
  openingTime: string;
  closingTime: string | null;
  initialBalance: number;
  expectedBalance: number;
  actualBalance: number | null;
  status: string; // Ej: 'OPEN', 'CLOSED'
  openedByAdminId: string;
  notes: string;
}

export interface OpenCashRegisterRequestDTO {
  initialBalance: number;
  notes: string;
}

export interface CloseCashRegisterRequestDTO {
  actualBalance: number;
  notes: string;
}

// ================= PAGOS (PAYMENTS) =================
export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  cashRegisterId: string | null;
  amount: number;
  paymentMethod: string | null; // Ej: 'CASH', 'CREDIT_CARD', 'YAPE', 'PLIN'
  status: string; // 'PENDING', 'COMPLETED', 'CANCELLED'
  paymentDate: string;
}

export interface CompletePaymentRequestDTO {
  amount: number;
  paymentMethod: string;
}

// Genérico Paginal (Reutilizable)
export interface PaginatedFinances<T> {
  content: T[];
  page: PageMetadata;
}
