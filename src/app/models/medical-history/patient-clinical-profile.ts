export interface PatientClinicalProfile {
  id: string;
  patientId: string;
  allergies: string | null;
  chronicConditions: string | null;
  pastSurgeries: string | null;
  familyHistory: string | null;
  createdAt: string;
  updatedAt: string;
}
