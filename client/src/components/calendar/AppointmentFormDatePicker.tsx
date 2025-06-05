
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { Appointment } from '../../types/appointment';
import { useCalendarHover } from '../../hooks/useCalendarHover';
import { createPortal } from 'react-dom';
import { Plus, Clock, Building, User } from 'lucide-react';

interface AppointmentFormDatePickerProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  existingAppointments: Appointment[];
  datePickerOpen: boolean;
  setDatePickerOpen: (open: boolean) => void;
}

const AppointmentFormDatePicker = ({
  selectedDate,
  onDateSelect,
  existingAppointments,
  datePickerOpen,
  setDatePickerOpen
}: AppointmentFormDatePickerProps) => {
  // Function to check if a date has appointments
  const isDayWithAppointment = (day: Date) => {
    return existingAppointments.some(app => 
      app.date.getDate() === day.getDate() && 
      app.date.getMonth() === day.getMonth() && 
      app.date.getFullYear() === day.getFullYear()
    );
  };

  // Use calendar hover functionality for tooltips
  const {
    hoveredDate,
    hoveredDayRef,
    getAppointmentsForDate,
    handleCalendarMouseMove,
    handleCalendarMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    handleCalendarMonthChange
  } = useCalendarHover();

  // Calculate tooltip position based on the hovered day element
  const getTooltipPosition = () => {
    if (!hoveredDayRef.current) return { x: 0, y: 0 };
    
    const rect = hoveredDayRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium text-gray-700">
          Date
        </Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "MMMM do, yyyy") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start"
            onMouseMove={handleCalendarMouseMove}
            onMouseLeave={handleCalendarMouseLeave}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              onMonthChange={handleCalendarMonthChange}
              initialFocus
              className="pointer-events-auto"
              modifiers={{
                hasAppointment: (date) => isDayWithAppointment(date),
              }}
              modifiersClassNames={{
                hasAppointment: 'bg-orange-200 text-gray-600 rounded-full',
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tooltip Portal - only show when calendar is open and hovering */}
      {datePickerOpen && hoveredDate && hoveredDayRef.current && createPortal(
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-[320px] z-[99999]"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'auto',
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">
                {format(hoveredDate, 'EEEE, MMMM d')}
              </h4>
              {getAppointmentsForDate(hoveredDate).length > 0 && (
                <span className="text-xs text-gray-500">
                  {getAppointmentsForDate(hoveredDate).length} appointment{getAppointmentsForDate(hoveredDate).length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Existing appointments */}
            {getAppointmentsForDate(hoveredDate).length > 0 && (
              <div className="space-y-2">
                {getAppointmentsForDate(hoveredDate).map(appointment => (
                  <div key={appointment.id} className="p-2 bg-gray-50 rounded border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${appointment.color}`}></div>
                      <h5 className="font-medium text-amber-700 text-sm">{appointment.title}</h5>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3 w-3" />
                        <span>{appointment.organization}</span>
                      </div>
                      {appointment.to && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span>{appointment.to}</span>
                        </div>
                      )}
                    </div>
                    {appointment.notes && (
                      <div className="mt-1 p-1 bg-amber-50 rounded text-xs text-gray-700">
                        {appointment.notes.length > 40 
                          ? `${appointment.notes.substring(0, 40)}...` 
                          : appointment.notes
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {getAppointmentsForDate(hoveredDate).length === 0 && (
              <p className="text-xs text-gray-500">No appointments on this date</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AppointmentFormDatePicker;
