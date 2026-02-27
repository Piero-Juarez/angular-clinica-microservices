import {PersonData} from '../person-data';

export interface PatientData {
  id: string;
  bloodType: string;
  healthInsurance: string;
  policyNumber: string;
  occupation: string;
  maritalStatus: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  personData: PersonData;
}
