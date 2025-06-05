
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { EmailData } from '../../types/email';
import { getAllCategories } from '../../utils/categoryUtils';
import IndexActionButtons from '../../pages/IndexActionButtons';

interface EmailDetailHeaderProps {
  email: EmailData;
  onCalendarClick?: () => void;
}

const EmailDetailHeader: React.FC<EmailDetailHeaderProps> = ({ email, onCalendarClick }) => {
  const navigate = useNavigate();
  const allCategories = getAllCategories();
  const categoryInfo = allCategories[email.category];
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-12">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center flex-1">
          <h1 className="text-3xl font-light text-gray-800 mb-6">
            {categoryInfo ? categoryInfo.title : 'Unknown Category'} Emails
          </h1>
          <p className="text-gray-600 mb-12">
            Email thread with {email.sender.name}
          </p>
        </div>
        
        <div className="w-20"></div> {/* Spacer to balance the layout */}
      </div>
      
      <div className="mb-24">
        <IndexActionButtons
          onNewEmail={() => {/* This will be handled by existing form */}}
          onViewDocuments={() => navigate('/documents')}
          onCalendarClick={onCalendarClick || (() => {})}
        />
      </div>
    </div>
  );
};

export default EmailDetailHeader;
