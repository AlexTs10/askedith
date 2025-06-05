
import React, { useState } from 'react';
import { Appointment } from '../../types/appointment';
import AppointmentFormHeader from './AppointmentFormHeader';
import AppointmentFormFooter from './AppointmentFormFooter';
import AppointmentFormDatePicker from './AppointmentFormDatePicker';
import AppointmentFormInputFields from './AppointmentFormInputFields';
import AppointmentFormSidebarContent from './AppointmentFormSidebarContent';

interface AppointmentFormProps {
  initialDate?: Date;
  onSave: (appointmentData: {
    date: Date;
    title: string;
    organization: string;
    notes: string;
    to: string;
    sendInvitation: boolean;
  }) => void;
  onCancel: () => void;
  onDateChange?: (selectedDate: Date | undefined) => void;
  existingAppointments: Appointment[];
}

const AppointmentForm = ({ 
  initialDate, 
  onSave, 
  onCancel, 
  onDateChange, 
  existingAppointments 
}: AppointmentFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [to, setTo] = useState('');
  const [notes, setNotes] = useState('');
  const [sendInvitation, setSendInvitation] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Get appointments for the selected date
  const selectedDateAppointments = selectedDate 
    ? existingAppointments.filter(app => 
        app.date.getDate() === selectedDate.getDate() && 
        app.date.getMonth() === selectedDate.getMonth() && 
        app.date.getFullYear() === selectedDate.getFullYear()
      )
    : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const isFormValid = selectedDate && title.trim() && organization.trim();

  const handleSave = () => {
    if (isFormValid) {
      onSave({
        date: selectedDate,
        title: title.trim(),
        organization: organization.trim(),
        notes: notes.trim(),
        to: to.trim(),
        sendInvitation
      });
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col p-5 overflow-y-auto">
        <div className="flex-1 space-y-6">
          <AppointmentFormDatePicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            existingAppointments={existingAppointments}
            datePickerOpen={datePickerOpen}
            setDatePickerOpen={setDatePickerOpen}
          />

          <AppointmentFormInputFields
            title={title}
            setTitle={setTitle}
            organization={organization}
            setOrganization={setOrganization}
            to={to}
            setTo={setTo}
            notes={notes}
            setNotes={setNotes}
            sendInvitation={sendInvitation}
            setSendInvitation={setSendInvitation}
          />
        </div>

        <AppointmentFormFooter
          isFormValid={!!isFormValid}
          onSave={handleSave}
          onCancel={onCancel}
        />
      </div>

      {/* Right side - Appointments for selected date */}
      <AppointmentFormSidebarContent
        selectedDate={selectedDate}
        selectedDateAppointments={selectedDateAppointments}
      />
    </div>
  );
};

export default AppointmentForm;
