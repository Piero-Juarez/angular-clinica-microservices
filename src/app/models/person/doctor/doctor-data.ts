import {PersonData} from '../person-data';

export interface DoctorData {
  id: string;
  cmp: string;
  rne: string;
  mainSpecialty: string;
  yearsOfExperience: number;
  publicBiography: string;
  personData: PersonData;
}
