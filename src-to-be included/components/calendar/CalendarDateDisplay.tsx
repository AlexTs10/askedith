import React, { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Appointment } from '../../types/appointment';
import { useCalendarHover } from '../../hooks/useCalendarHover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import AppointmentForm from './AppointmentForm';
import EmailPreviewTooltip from '../email-category/EmailPreviewTooltip';

interface CalendarDateDisplayProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  isDayWithAppointment: (day: Date) => boolean;
  onAddAppointment: () => void;
  appointments: Appointment[];
}

const CalendarDateDisplay = ({ 
  date, 
  onDateSelect, 
  isDayWithAppointment, 
  onAddAppointment,
  appointments 
}: CalendarDateDisplayProps) => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  const {
    hoveredDate,
    hoveredDayRef,
    getAppointmentsForDate,
    handleCalendarMouseMove,
    handleCalendarMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    handleCalendarMonthChange,
    handleAddAppointmentFromTooltip
  } = useCalendarHover();

  const handleCloseTooltip = () => {
    // This will close the tooltip when the close button is clicked
    if (hoveredDate) {
      // Setting hoveredDate to null in the useCalendarHover hook
      handleTooltipMouseLeave();
    }
  };

  const handleAddAppointmentClick = () => {
    setShowAppointmentForm(true);
  };

  const handleSaveAppointment = (appointmentData: any) => {
    console.log('Saving appointment:', appointmentData);
    setShowAppointmentForm(false);
    onAddAppointment();
  };

  const handleCancelAppointment = () => {
    setShowAppointmentForm(false);
  };

  const handleAddAppointmentFromTooltipLocal = (targetDate: Date) => {
    onDateSelect(targetDate);
    handleAddAppointmentClick();
  };

  // Check if tooltip should be shown in top row (where we want auto-fade)
  const isTooltipInTopRow = hoveredDate && hoveredDayRef.current && 
    hoveredDayRef.current.getBoundingClientRect().y < 150; // Approximate threshold for top row

  // Get appointments for the hovered date
  const hoveredDateAppointments = hoveredDate ? getAppointmentsForDate(hoveredDate) : [];

  return (
    <>
      <div className="h-[745px] shadow-sm border border-gray-100 overflow-hidden flex bg-white rounded-lg">
        {/* Left Orange Sidebar */}
        <div className="w-80 bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col">
          <div className="p-6">
            <Button
              onClick={handleAddAppointmentClick}
              className="w-full bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-6 rounded-lg border transition-all duration-200"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Appointment
            </Button>
          </div>
          
          <div className="px-6 pb-8 flex-1 flex flex-col justify-center">
            <p className="text-white text-xl font-light uppercase mb-1">
              {date ? format(date, 'EEEE') : 'FRIDAY'}
            </p>
            <p className="text-white text-5xl font-light uppercase mb-6">
              {date ? format(date, 'MMMM do').replace(/(\d+)(st|nd|rd|th)/, '$1TH') : 'MAY 30TH'}
            </p>
            <p className="text-white/70 text-lg font-light">
              {date ? format(date, 'yyyy') : '2025'}
            </p>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="h-[660px] p-8 flex items-center justify-center bg-white">
            <div 
              className="relative w-full max-w-2xl"
              onMouseMove={handleCalendarMouseMove}
              onMouseLeave={handleCalendarMouseLeave}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateSelect}
                onMonthChange={handleCalendarMonthChange}
                className={cn("p-0 pointer-events-auto w-full")}
                modifiers={{
                  hasAppointment: isDayWithAppointment
                }}
                modifiersStyles={{
                  hasAppointment: {
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    color: '#92400e',
                    fontWeight: '600'
                  }
                }}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full justify-center",
                  month: "space-y-8 w-full",
                  caption: "flex justify-center pt-1 relative items-center mb-8 w-full",
                  caption_label: "text-3xl font-light text-gray-400",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100 border-0 text-gray-400 hover:text-gray-600"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-4",
                  head_row: "flex w-full justify-between mb-6",
                  head_cell: "text-gray-400 rounded-md font-light text-lg h-12 flex items-center justify-center uppercase flex-1 min-w-[60px]",
                  row: "flex w-full justify-between mb-4",
                  cell: "h-16 text-center text-lg p-0 relative flex items-center justify-center flex-1 min-w-[60px] [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "pointer-events-auto h-14 w-14 p-0 font-normal text-lg rounded-full hover:bg-green-50 text-gray-600 mx-auto aria-selected:opacity-100 transition-colors",
                  day_range_end: "day-range-end",
                  day_selected: "bg-green-500 hover:bg-green-600 text-white focus:bg-green-600 focus:text-white rounded-full",
                  day_today: "bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold",
                  day_outside: "text-gray-300 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-gray-300 opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />

              {/* Only show EmailPreviewTooltip when there are appointments for the hovered date */}
              {hoveredDate && hoveredDateAppointments.length > 0 && hoveredDayRef.current && (
                <EmailPreviewTooltip
                  emails={hoveredDateAppointments.map(appointment => ({
                    id: appointment.id.toString(),
                    subject: appointment.title,
                    sender: {
                      name: appointment.to || 'Appointment',
                      email: 'appointment@example.com',
                      organization: appointment.organization
                    },
                    recipient: 'you@example.com',
                    content: appointment.notes || 'No additional notes',
                    date: appointment.date.toISOString(),
                    read: true,
                    replied: true,
                    responseReceived: true,
                    private: false,
                    category: "appointments"
                  }))}
                  status="unread"
                  category="appointments"
                  onClose={handleCloseTooltip}
                  onMouseEnter={handleTooltipMouseEnter}
                  onMouseLeave={handleTooltipMouseLeave}
                  categoryColor="#f59e0b"
                  onAddAppointment={handleAddAppointmentFromTooltipLocal}
                  hoveredDate={hoveredDate}
                  autoFade={isTooltipInTopRow}
                  categoryCardRef={hoveredDayRef}
                />
              )}
            </div>
          </div>

          <div className="h-[85px] bg-amber-50 flex items-center justify-center">
            <div className="text-center text-amber-700 text-sm">
              Select a date to view or add appointments
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form Dialog */}
      <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Add New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            initialDate={date || new Date()}
            onSave={handleSaveAppointment}
            onCancel={handleCancelAppointment}
            existingAppointments={appointments}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarDateDisplay;
