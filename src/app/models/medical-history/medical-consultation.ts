import {VitalSigns} from './vital-signs';
import {Diagnosis} from './diagnosis';
import {Prescription} from './prescription';

export interface MedicalConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  reasonForVisit: string;
  currentIllness: string;
  vitalSigns: VitalSigns;
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  additionalNotes: string;
  consultationDate: string;
}
