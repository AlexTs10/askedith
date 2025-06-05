
export interface Appointment {
  id: number;
  title: string;
  date: Date;
  category: string;
  color: string;
  organization: string;
  textColor: string;
  time: string;
  to?: string;
  notes?: string;
}
