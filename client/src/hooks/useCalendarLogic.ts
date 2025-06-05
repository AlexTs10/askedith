
import { useState } from 'react';
import { APPOINTMENTS } from '../data/appointmentData';
import { Appointment } from '../types/appointment';

export const useCalendarLogic = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDateAppointments, setSelectedDateAppointments] = useState(
    APPOINTMENTS.filter(app => 
      app.date.getDate() === new Date().getDate() && 
      app.date.getMonth() === new Date().getMonth() && 
      app.date.getFullYear() === new Date().getFullYear()
    )
  );

  // Function to highlight dates with appointments
  const isDayWithAppointment = (day: Date) => {
    return APPOINTMENTS.some(app => 
      app.date.getDate() === day.getDate() && 
      app.date.getMonth() === day.getMonth() && 
      app.date.getFullYear() === day.getFullYear()
    );
  };

  // Handle date selection
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    if (selectedDate) {
      const appointmentsOnDate = APPOINTMENTS.filter(app => 
        app.date.getDate() === selectedDate.getDate() && 
        app.date.getMonth() === selectedDate.getMonth() && 
        app.date.getFullYear() === selectedDate.getFullYear()
      );
      setSelectedDateAppointments(appointmentsOnDate);
    } else {
      setSelectedDateAppointments([]);
    }
  };

  // Handle appointment click from upcoming list
  const handleAppointmentClick = (appointment: Appointment) => {
    setDate(appointment.date);
    setSelectedDateAppointments([appointment]);
  };

  // Get upcoming appointments from TODAY, limited to four weeks
  const getUpcomingAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const fourWeeksFromNow = new Date();
    fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28);
    fourWeeksFromNow.setHours(23, 59, 59, 999);
    
    return APPOINTMENTS
      .filter(app => {
        const appDate = new Date(app.date);
        appDate.setHours(0, 0, 0, 0);
        return appDate > today && appDate <= fourWeeksFromNow;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return {
    date,
    selectedDateAppointments,
    isDayWithAppointment,
    handleSelect,
    getUpcomingAppointments,
    handleAppointmentClick
  };
};
