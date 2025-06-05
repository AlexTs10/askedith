
import React from 'react';
import { Pencil, FileText, Calendar, Mail, MapPin, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IndexActionButtonsProps {
  onNewEmail: () => void;
  onViewDocuments: () => void;
  onCalendarClick: () => void;
}

const IndexActionButtons = ({ onNewEmail, onViewDocuments, onCalendarClick }: IndexActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center gap-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 text-base font-normal underline decoration-gray-400 hover:decoration-blue-600 underline-offset-4"
      >
        <Home className="h-4 w-4" />
        Communication Hub
      </button>
      
      <button
        onClick={onViewDocuments}
        className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200 text-base font-normal underline decoration-gray-400 hover:decoration-green-600 underline-offset-4"
      >
        <FileText className="h-4 w-4" />
        Document Hub
      </button>

      <button
        onClick={() => navigate('/map')}
        className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 text-base font-normal underline decoration-gray-400 hover:decoration-purple-600 underline-offset-4"
      >
        <MapPin className="h-4 w-4" />
        Find Care
      </button>
      
      <button
        onClick={onCalendarClick}
        className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors duration-200 text-base font-normal underline decoration-gray-400 hover:decoration-amber-600 underline-offset-4"
      >
        <Calendar className="h-4 w-4" />
        Calendar
      </button>
    </div>
  );
};

export default IndexActionButtons;
