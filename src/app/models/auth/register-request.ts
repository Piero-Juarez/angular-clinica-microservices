export interface PersonDataDTO {
  name: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string; // Formato YYYY-MM-DD
  biologicalSex: string;
  phone: string;
  address: string;
  ubigeo: string;
}

export interface PatientDataDTO {
  bloodType: string;
  healthInsurance: string;
  policyNumber: string;
  occupation: string;
  maritalStatus: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  consentData: boolean;
}

export interface DoctorDataDTO {
  cmp: string;
  rne: string;
  mainSpecialty: string;
  universityOfOrigin: string;
  yearsOfExperience: number;
  averageConsultationTime: number;
  contractType: string;
  baseSalary: number;
  publicBiography: string;
}

export interface RegisterPatientRequestDTO {
  email: string;
  password?: string;
  personData: PersonDataDTO;
  patientData: PatientDataDTO;
}

export interface RegisterDoctorRequestDTO {
  email: string;
  password?: string;
  personData: PersonDataDTO;
  doctorData: DoctorDataDTO;
}
