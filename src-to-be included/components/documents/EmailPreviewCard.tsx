
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar, User, Building, Mail } from 'lucide-react';
import { formatDate } from '../../utils/fileTypeUtils';

interface EmailPreviewCardProps {
  emailId: string;
  emailSubject: string;
  senderName: string;
  senderOrganization: string;
  emailDate: string;
  direction: 'received' | 'sent';
  isVisible: boolean;
  slideDirection: 'left' | 'right';
  position: { top: number; left?: number; right?: number };
}

const EmailPreviewCard: React.FC<EmailPreviewCardProps> = ({
  emailId,
  emailSubject,
  senderName,
  senderOrganization,
  emailDate,
  direction,
  isVisible,
  slideDirection,
  position
}) => {
  console.log('EmailPreviewCard render:', { isVisible, slideDirection, position });

  if (!isVisible) return null;

  const slideClass = slideDirection === 'left' 
    ? 'animate-slide-in-left' 
    : 'animate-slide-in-right';

  const positionStyles = slideDirection === 'left'
    ? { top: position.top, left: position.left }
    : { top: position.top, right: position.right };

  console.log('Rendering preview with styles:', positionStyles);

  return (
    <div
      className={`fixed z-[60] w-80 ${slideClass} pointer-events-none`}
      style={positionStyles}
    >
      <Card className="shadow-2xl border-2 border-gray-300 bg-white">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span className="font-medium text-gray-700">
                {direction === 'received' ? 'Received Email' : 'Sent Email'}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
              {emailSubject}
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-3 w-3 text-gray-400" />
                <span className="font-medium">From:</span>
                <span>{senderName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-3 w-3 text-gray-400" />
                <span>{senderOrganization}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{formatDate(emailDate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailPreviewCard;
