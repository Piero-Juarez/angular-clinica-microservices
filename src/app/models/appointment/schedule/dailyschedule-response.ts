import {TimeslotResponse} from './timeslot-response';

export interface DailyScheduleResponse {
  date: string;
  slots: TimeslotResponse[];
}
