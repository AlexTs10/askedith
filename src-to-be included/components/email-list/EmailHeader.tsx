
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import IndexActionButtons from '../../pages/IndexActionButtons';

interface EmailHeaderProps {
  currentCategory: any;
  emailCount: number;
  activeTab: string;
  onComposeClick: () => void;
  onCalendarClick?: () => void;
}

const EmailHeader: React.FC<EmailHeaderProps> = ({
  currentCategory,
  emailCount,
  activeTab,
  onComposeClick,
  onCalendarClick
}) => {
  const navigate = useNavigate();

  // Determine the display title based on the category
  const getDisplayTitle = () => {
    if (currentCategory?.id === 'all') {
      return 'All Categories';
    }
    return currentCategory ? currentCategory.title : 'All Categories';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center flex-1">
          <h1 className="text-3xl font-light text-gray-800">
            <span className="font-semibold text-gray-700">Conversation:</span>{' '}
            {getDisplayTitle()}
          </h1>
        </div>
        
        <div className="w-20"></div> {/* Spacer to balance the layout */}
      </div>
      
      <div className="mb-24">
        <IndexActionButtons
          onNewEmail={onComposeClick}
          onViewDocuments={() => navigate('/documents')}
          onCalendarClick={onCalendarClick || (() => {})}
        />
      </div>
    </div>
  );
};

export default EmailHeader;
