
import React from 'react';
import { format } from 'date-fns';
import { Appointment } from '../../types/appointment';

interface AppointmentFormSidebarProps {
  selectedDate: Date | undefined;
  appointments: Appointment[];
}

const AppointmentFormSidebar = ({ selectedDate, appointments }: AppointmentFormSidebarProps) => {
  // Filter existing appointments for the selected date
  const appointmentsForSelectedDate = selectedDate ? appointments.filter(app => 
    app.date.getDate() === selectedDate.getDate() && 
    app.date.getMonth() === selectedDate.getMonth() && 
    app.date.getFullYear() === selectedDate.getFullYear()
  ) : [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          {selectedDate ? `Appointments on ${format(selectedDate, 'MMM d')}` : 'Select a date'}
        </h3>
        
        {selectedDate && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {appointmentsForSelectedDate.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                </div>
                <p className="text-gray-500 text-sm">No appointments scheduled</p>
              </div>
            ) : (
              appointmentsForSelectedDate.map(appointment => (
                <div 
                  key={appointment.id} 
                  className="p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${appointment.color}`}></div>
                    <h4 className="font-medium text-amber-700 text-sm">
                      {appointment.title}
                    </h4>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{appointment.organization}</span>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 p-2 bg-white rounded text-xs">
                        <p className="text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentFormSidebar;
