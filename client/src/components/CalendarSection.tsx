
import React from 'react';
import CalendarDateDisplay from './calendar/CalendarDateDisplay';
import AppointmentList from './calendar/AppointmentList';
import { useCalendarLogic } from '../hooks/useCalendarLogic';
import { APPOINTMENTS } from '../data/appointmentData';

const CalendarSection = () => {
  const {
    date,
    selectedDateAppointments,
    isDayWithAppointment,
    handleSelect,
    getUpcomingAppointments,
    handleAppointmentClick
  } = useCalendarLogic();

  const upcomingAppointments = getUpcomingAppointments();

  const handleAddAppointment = () => {
    // Placeholder for add appointment functionality
    console.log('Add appointment clicked');
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-light text-gray-800 text-center mb-8">Upcoming Appointments</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className="md:col-span-8">
          <CalendarDateDisplay
            date={date}
            onDateSelect={handleSelect}
            isDayWithAppointment={isDayWithAppointment}
            onAddAppointment={handleAddAppointment}
            appointments={APPOINTMENTS}
          />
        </div>
        
        <div className="md:col-span-4">
          <AppointmentList
            date={date}
            selectedAppointments={selectedDateAppointments}
            upcomingAppointments={upcomingAppointments}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
