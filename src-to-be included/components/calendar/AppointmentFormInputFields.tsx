
import React from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import OrganizationFieldAutocomplete from './OrganizationFieldAutocomplete';
import ToFieldAutocomplete from './ToFieldAutocomplete';

interface AppointmentFormInputFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  organization: string;
  setOrganization: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  sendInvitation: boolean;
  setSendInvitation: (value: boolean) => void;
}

const AppointmentFormInputFields = ({
  title,
  setTitle,
  organization,
  setOrganization,
  to,
  setTo,
  notes,
  setNotes,
  sendInvitation,
  setSendInvitation
}: AppointmentFormInputFieldsProps) => {
  // Calculate textarea height based on content
  const calculateTextareaHeight = (text: string) => {
    const baseHeight = 120; // minimum height in pixels
    const lineHeight = 20; // approximate line height
    const lines = text.split('\n').length;
    const contentLines = Math.max(lines, 6); // minimum 6 lines
    return Math.max(baseHeight, contentLines * lineHeight);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
          Appointment Title*
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter appointment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization" className="text-sm font-medium text-gray-700">
          Organization*
        </Label>
        <OrganizationFieldAutocomplete
          value={organization}
          onChange={setOrganization}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="to" className="text-sm font-medium text-gray-700">
          Contact Person (Optional)
        </Label>
        <ToFieldAutocomplete
          value={to}
          onChange={setTo}
          organization={organization}
        />
      </div>

      {/* Send Calendar Invite Section with blue styling */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-col">
            <Label htmlFor="send-invitation" className="text-sm font-medium text-blue-700">
              Send Calendar Invite
            </Label>
            <p className="text-xs text-blue-600 mt-1">
              Send a calendar invitation via email
            </p>
          </div>
          <Switch
            id="send-invitation"
            checked={sendInvitation}
            onCheckedChange={setSendInvitation}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        {/* Email fields - show when send invitation is enabled */}
        {sendInvitation && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <Label htmlFor="email-to" className="text-sm font-medium text-blue-700">
                To: (Email addresses)
              </Label>
              <Input
                id="email-to"
                type="email"
                placeholder="email@example.com, another@example.com"
                className="w-full focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-cc" className="text-sm font-medium text-blue-700">
                CC: (Optional)
              </Label>
              <Input
                id="email-cc"
                type="email"
                placeholder="cc@example.com"
                className="w-full focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-bcc" className="text-sm font-medium text-blue-700">
                BCC: (Optional)
              </Label>
              <Input
                id="email-bcc"
                type="email"
                placeholder="bcc@example.com"
                className="w-full focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes or details"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none transition-all duration-200"
          style={{ 
            height: `${calculateTextareaHeight(notes)}px`,
            minHeight: '120px'
          }}
        />
      </div>
    </div>
  );
};

export default AppointmentFormInputFields;
