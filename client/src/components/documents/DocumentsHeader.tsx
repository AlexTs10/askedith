
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
import CalendarPopup from '../CalendarPopup';
import IndexActionButtons from '../../pages/IndexActionButtons';

interface DocumentsHeaderProps {
  onNewEmailClick: () => void;
  onCalendarClick: () => void;
}

const DocumentsHeader = ({ onNewEmailClick, onCalendarClick }: DocumentsHeaderProps) => {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="text-center mb-8 sm:mb-16">
      <div className="flex items-center justify-between mb-12">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center flex-1">
          <h1 className="text-3xl sm:text-4xl font-light text-gray-800 mb-6 sm:mb-8">Document Hub</h1>
          <p className="text-sm sm:text-base text-gray-600 font-light mb-12">Manage and organize your email attachments</p>
        </div>
        
        <div className="w-20"></div> {/* Spacer to balance the layout */}
      </div>
      
      <div className="mb-24">
        <IndexActionButtons
          onNewEmail={onNewEmailClick}
          onViewDocuments={() => {/* Already on documents page */}}
          onCalendarClick={onCalendarClick}
        />
      </div>

      {/* Calendar Popup */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          <CalendarPopup showTrigger={false} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsHeader;
