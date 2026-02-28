import {PersonData} from '../person-data';

export interface AdministrationData {
  id: string;
  employeeCode: string;
  position: string;
  personData: PersonData;
}
