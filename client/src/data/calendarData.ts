
import { Appointment } from '../types/appointment';

// Sample appointment data - in a real app this would come from an API or state management
export const APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    title: 'Review Senior Living Options',
    date: new Date(2025, 4, 25), // May 25, 2025
    category: 'senior-living',
    color: 'bg-amber-500',
    organization: 'Golden Years Living',
    textColor: 'text-amber-700',
    time: '10:30 AM',
    notes: 'Bring previous medical records and insurance information. Tour the memory care wing and ask about meal plans.'
  },
  {
    id: 2,
    title: 'Home Care Assessment',
    date: new Date(2025, 4, 28), // May 28, 2025
    category: 'home-care',
    color: 'bg-amber-500',
    organization: 'Comfort Home Services',
    textColor: 'text-amber-700',
    time: '2:15 PM',
    notes: 'Assessment will include mobility evaluation and discussion of daily care needs. Prepare list of current medications.'
  },
  {
    id: 3,
    title: 'Medicare Benefits Review',
    date: new Date(2025, 5, 2), // June 2, 2025
    category: 'federal-benefits',
    color: 'bg-amber-500',
    organization: 'Medicare Services Office',
    textColor: 'text-amber-700',
    time: '9:00 AM',
    notes: 'Annual review of coverage options. Bring Medicare card and summary of current prescriptions.'
  },
  {
    id: 4,
    title: 'Legal Consultation',
    date: new Date(2025, 5, 10), // June 10, 2025
    category: 'attorneys',
    color: 'bg-amber-500',
    organization: 'Elder Law Associates',
    textColor: 'text-amber-700',
    time: '3:30 PM',
    notes: 'Discussion about power of attorney and estate planning. Bring current will and financial documents.'
  },
  {
    id: 5,
    title: 'Physical Therapy Session',
    date: new Date(2025, 5, 15), // June 15, 2025
    category: 'health-services',
    color: 'bg-amber-500',
    organization: 'Wellness Rehabilitation Center',
    textColor: 'text-amber-700',
    time: '11:00 AM',
    notes: 'Focus on balance and strength exercises. Wear comfortable clothing and supportive shoes.'
  },
  {
    id: 6,
    title: 'Medication Review',
    date: new Date(2025, 5, 18), // June 18, 2025
    category: 'health-services',
    color: 'bg-amber-500',
    organization: 'Community Pharmacy',
    textColor: 'text-amber-700',
    time: '2:00 PM',
    notes: 'Comprehensive medication review with pharmacist. Bring all current medications and supplements.'
  },
  {
    id: 7,
    title: 'Estate Planning Follow-up',
    date: new Date(2025, 5, 22), // June 22, 2025
    category: 'attorneys',
    color: 'bg-amber-500',
    organization: 'Elder Law Associates',
    textColor: 'text-amber-700',
    time: '10:00 AM',
    notes: 'Review drafted documents and finalize healthcare directives. Bring ID and witness information.'
  }
];

// Array of encouraging messages to display on days with no appointments
export const ENCOURAGING_MESSAGES = [
  "You can breathe a little.",
  "Remember you too deserve a little rest.",
  "Every day you care is appreciated."
];
