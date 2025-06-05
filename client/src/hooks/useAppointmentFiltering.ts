
import { useMemo } from 'react';
import { APPOINTMENTS } from '../data/appointmentData';
import { Appointment } from '../types/appointment';

interface UseAppointmentFilteringProps {
  searchQuery: string;
}

export const useAppointmentFiltering = ({ searchQuery }: UseAppointmentFilteringProps) => {
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return APPOINTMENTS.filter(appointment => 
      appointment.title.toLowerCase().includes(query) ||
      appointment.organization.toLowerCase().includes(query) ||
      appointment.notes?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return { filteredAppointments };
};
