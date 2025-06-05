
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Download, User, Building, Calendar } from 'lucide-react';
import FileIconDisplay from './FileIconDisplay';
import StatusBadge from './StatusBadge';
import EmailPreviewCard from './EmailPreviewCard';
import { useIsTablet } from '@/hooks/use-tablet';
import { useEmailPreviewHover } from '@/hooks/useEmailPreviewHover';

interface AttachmentWithContext {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  emailId: string;
  emailSubject: string;
  senderName: string;
  senderOrganization: string;
  emailDate: string;
  direction: 'received' | 'sent';
}

interface CompactDocumentCardProps {
  attachment: AttachmentWithContext;
  layout?: 'grid' | 'list';
}

const CompactDocumentCard = ({ attachment, layout = 'grid' }: CompactDocumentCardProps) => {
  const navigate = useNavigate();
  const isTablet = useIsTablet();
  const [isPressed, setIsPressed] = React.useState(false);
  const { hoverState, handleMouseEnter, handleMouseLeave } = useEmailPreviewHover();

  // Get file type colors for badge
  const getFileTypeInfo = (type: string) => {
    if (type.startsWith('image/')) {
      return { 
        badgeColor: 'bg-purple-500',
        statusBadgeColor: 'bg-purple-400 text-white font-normal text-xs'
      };
    }
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
      return { 
        badgeColor: 'bg-blue-500',
        statusBadgeColor: 'bg-blue-400 text-white font-normal text-xs'
      };
    }
    if (type.includes('sheet') || type.includes('csv') || type.includes('excel')) {
      return { 
        badgeColor: 'bg-green-500',
        statusBadgeColor: 'bg-green-400 text-white font-normal text-xs'
      };
    }
    return { 
      badgeColor: 'bg-gray-500',
      statusBadgeColor: 'bg-gray-400 text-white font-normal text-xs'
    };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fileInfo = getFileTypeInfo(attachment.type);

  const handleCardPress = () => {
    if (isTablet) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  return (
    <div className="relative">
      <Card 
        className={`rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow h-full ${
          isTablet ? 'active:scale-98' : ''
        } ${isPressed ? 'scale-98' : ''}`}
        onTouchStart={handleCardPress}
        onMouseEnter={!isTablet ? handleMouseEnter : undefined}
        onMouseLeave={!isTablet ? handleMouseLeave : undefined}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Top section with file icon, name, and status badge */}
          <div className={`flex items-start justify-between border-b border-gray-100 ${
            isTablet ? 'p-3 pb-2' : 'p-4 pb-3'
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileIconDisplay type={attachment.type} size="small" />
              <h3 className={`font-medium text-gray-900 leading-tight line-clamp-2 ${
                isTablet ? 'text-xs' : 'text-sm'
              }`}>
                {attachment.name}
              </h3>
            </div>
            <StatusBadge 
              direction={attachment.direction} 
              statusBadgeColor="" 
            />
          </div>

          {/* Metadata section - tablet optimized */}
          <div className={`pt-3 space-y-3 flex-1 ${isTablet ? 'p-3' : 'p-4'}`}>
            <div className={`space-y-2 ${isTablet ? 'space-y-1.5' : ''}`}>
              <div className={`flex items-center gap-2 text-gray-600 ${isTablet ? 'text-xs' : 'text-sm'}`}>
                <User className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className="font-medium text-gray-900">From:</span>
                <span className="break-words">{attachment.senderName}</span>
              </div>
              <div className={`flex items-center gap-2 text-gray-600 ${isTablet ? 'text-xs' : 'text-sm'}`}>
                <Building className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className="break-words">{attachment.senderOrganization}</span>
              </div>
              <div className={`flex items-center gap-2 text-gray-600 ${isTablet ? 'text-xs' : 'text-sm'}`}>
                <Calendar className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span>{formatDate(attachment.emailDate)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons at bottom - tablet optimized touch targets */}
          <div className={`pt-0 flex gap-2 ${isTablet ? 'p-3' : 'p-4'}`}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/email/${attachment.emailId}`)}
              className={`flex-1 border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 ${
                isTablet ? 'text-xs h-10 active:bg-gray-200' : 'text-xs h-9'
              }`}
            >
              View Email
            </Button>
            <Button
              size="sm"
              className={`${fileInfo.badgeColor} text-white flex-1 hover:opacity-90 ${
                isTablet ? 'text-xs h-10 active:opacity-80' : 'text-xs h-9'
              }`}
            >
              <Download className={`mr-1 ${isTablet ? 'h-3 w-3' : 'h-3 w-3'}`} />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview Card - now positioned as a sibling */}
      {hoverState.isVisible && (
        <EmailPreviewCard
          emailId={attachment.emailId}
          emailSubject={attachment.emailSubject}
          senderName={attachment.senderName}
          senderOrganization={attachment.senderOrganization}
          emailDate={attachment.emailDate}
          direction={attachment.direction}
          isVisible={hoverState.isVisible}
          slideDirection={hoverState.slideDirection}
          position={hoverState.position}
        />
      )}
    </div>
  );
};

export default CompactDocumentCard;
