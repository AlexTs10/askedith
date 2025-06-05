
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useCalendarLogic } from '../../hooks/useCalendarLogic';
import { Calendar, ChevronLeft, Plus } from 'lucide-react';
import SidebarCalendar from './SidebarCalendar';
import AppointmentFormSidebarContent from './AppointmentFormSidebarContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import AppointmentForm from './AppointmentForm';
import { APPOINTMENTS } from '../../data/appointmentData';

interface SlideOutCalendarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlideOutCalendarSidebar = ({ isOpen, onClose }: SlideOutCalendarSidebarProps) => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  // Use calendar logic for sidebar
  const {
    date,
    selectedDateAppointments,
    handleSelect
  } = useCalendarLogic();

  const handleAddAppointment = () => {
    setShowAppointmentForm(true);
  };

  const handleSaveAppointment = (appointmentData: any) => {
    console.log('Saving appointment:', appointmentData);
    setShowAppointmentForm(false);
    // In a real app, this would save to the backend
  };

  const handleCancelAppointment = () => {
    setShowAppointmentForm(false);
  };

  return (
    <>
      {/* Backdrop - only show when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Slide-out Calendar Sidebar - always rendered but transformed */}
      <div 
        className={`fixed right-0 top-0 h-full w-[352px] bg-white border-l border-gray-200 shadow-lg flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Calendar Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-700" />
              <h3 className="text-lg font-medium text-amber-800">Calendar</h3>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm text-amber-700 font-medium cursor-pointer hover:text-amber-800 transition-colors"
                onClick={onClose}
              >
                Click to close
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-amber-700 hover:text-amber-800 hover:bg-amber-200/50 flex-shrink-0 relative z-20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 30-Day Calendar */}
        <div className="border-b border-gray-200 bg-white">
          <SidebarCalendar
            selectedDate={date}
            onDateSelect={handleSelect}
            onAddAppointment={handleAddAppointment}
          />
        </div>

        {/* Add Appointment Button */}
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={handleAddAppointment}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        </div>

        {/* Calendar Sidebar Content */}
        <div className="flex-1 p-4 flex flex-col overflow-y-auto">
          <AppointmentFormSidebarContent
            selectedDate={date}
            selectedDateAppointments={selectedDateAppointments}
          />
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
            existingAppointments={APPOINTMENTS}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlideOutCalendarSidebar;
