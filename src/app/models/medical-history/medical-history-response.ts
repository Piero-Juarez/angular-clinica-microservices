import {PatientClinicalProfile} from './patient-clinical-profile';
import {MedicalConsultation} from './medical-consultation';
import {PaginatedResponse} from '../paginated-response';

export interface MedicalHistoryResponse {
  clinicalProfile: PatientClinicalProfile;
  consultations: PaginatedResponse<MedicalConsultation>;
}
