
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Appointment } from '../../types/appointment';
import { ENCOURAGING_MESSAGES } from '../../data/calendarData';

interface AppointmentListProps {
  date: Date | undefined;
  selectedAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const AppointmentList = ({ date, selectedAppointments, upcomingAppointments, onAppointmentClick }: AppointmentListProps) => {
  const getEncouragingMessage = (date: Date) => {
    const dayOfWeek = date.getDay();
    return ENCOURAGING_MESSAGES[dayOfWeek % ENCOURAGING_MESSAGES.length];
  };

  // Filter upcoming appointments to four weeks maximum
  const fourWeeksFromNow = new Date();
  fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28);
  
  const limitedUpcomingAppointments = upcomingAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate <= fourWeeksFromNow;
  });

  return (
    <Card className="h-[745px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 border-b border-gray-100 p-4 flex-shrink-0">
        <div className="text-white">
          <h3 className="text-lg font-light uppercase mb-1">
            {date ? format(date, 'EEEE') : 'No date selected'}
          </h3>
          <p className="font-light text-sm">
            {date ? format(date, 'MMMM d, yyyy') : ''}
            {selectedAppointments.length > 0 && ` • ${selectedAppointments.length} appointment${selectedAppointments.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
      
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {/* Top section for selected date appointments - reduced from 330px to 231px to match sidebar */}
        <div className="h-[231px] p-4 flex flex-col overflow-y-auto scrollbar-visible">
          <div className="space-y-3 pr-2">
            {selectedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <p className="text-gray-500 text-sm">No Care Appointments Today.</p>
                  <p className="text-gray-500 mt-1 text-sm">{date ? getEncouragingMessage(date) : "You can breathe a little."}</p>
                </div>
              </div>
            ) : (
              <div>
                {selectedAppointments.map(appointment => (
                  <div 
                    key={appointment.id} 
                    className="mb-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${appointment.color}`}></div>
                      <h4 className="font-medium text-amber-700 text-sm">
                        {appointment.title}
                      </h4>
                    </div>
                    <div className="pl-5 space-y-1 text-gray-600">
                      <div className="flex items-center text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{appointment.organization}</span>
                      </div>
                      {appointment.notes && (
                        <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                          <p className="text-xs text-gray-700 leading-relaxed">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Separator line */}
        <Separator className="bg-gray-300 flex-shrink-0" />

        {/* Bottom section for upcoming appointments - increased from 330px to 429px to match sidebar */}
        <div className="h-[429px] p-4 flex flex-col overflow-y-auto scrollbar-visible">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex-shrink-0">
            Upcoming Appointments<br />
            (Next 4 Weeks)
          </h4>
          <div className="space-y-2 pr-2">
            {limitedUpcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-xs">No upcoming appointments in the next 4 weeks</p>
            ) : (
              limitedUpcomingAppointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate mb-1">
                        {appointment.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate mb-1">
                        {appointment.organization}
                      </p>
                      <p className="text-xs text-orange-500 font-medium">
                        {format(new Date(appointment.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0 ml-2">{appointment.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentList;
