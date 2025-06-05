
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Download, Calendar, User, Building, ArrowDown, ArrowUp } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { getFileTypeInfo, formatDate } from '../../utils/fileTypeUtils';
import StatusBadge from './StatusBadge';
import FileIcon from './FileIcon';
import { useIsTablet } from '@/hooks/use-tablet';

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

interface DocumentCardGridProps {
  attachment: AttachmentWithContext;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

const DocumentCardGrid = ({ attachment, onMouseEnter, onMouseLeave }: DocumentCardGridProps) => {
  const navigate = useNavigate();
  const fileInfo = getFileTypeInfo(attachment.type);
  const isTablet = useIsTablet();
  const [isPressed, setIsPressed] = React.useState(false);

  const handleCardPress = () => {
    if (isTablet) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  return (
    <Card 
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 ease-out h-[340px] cursor-pointer ${
        isTablet ? 'active:scale-95' : 'hover:-translate-y-1'
      } ${isPressed ? 'scale-95' : ''}`}
      onTouchStart={handleCardPress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: '10px 10px'
      }}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Top section with icon and file name */}
        <div className={`${fileInfo.badgeColor} p-4 pb-3 rounded-t-2xl flex items-center gap-0.5`}>
          {/* File icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <fileInfo.icon className="h-6 w-6 text-white" />
          </div>
          
          {/* File name */}
          <h3 className={`font-medium text-white leading-tight line-clamp-2 flex-1 ${
            isTablet ? 'text-sm' : 'text-sm'
          }`}>
            {attachment.name}
          </h3>
        </div>

        {/* Metadata section - tablet optimized spacing */}
        <div className={`pl-4 pr-4 flex-1 flex items-center ${isTablet ? 'py-2' : 'py-3'}`}>
          <div className={`space-y-2 ${isTablet ? 'space-y-1.5' : ''}`} style={{ marginLeft: '12px' }}>
            <div className={`flex items-center gap-2 text-gray-500 ${isTablet ? 'text-xs' : 'text-sm'}`}>
              <div className="icon-container" style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                <User className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
              <span className="font-medium text-gray-600">From:</span>
              <span className="break-words">{attachment.senderName}</span>
            </div>
            <div className={`flex items-center gap-2 text-gray-500 ${isTablet ? 'text-xs' : 'text-sm'}`}>
              <div className="icon-container" style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                <Building className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
              <span className="break-words">{attachment.senderOrganization}</span>
            </div>
            <div className={`flex items-center gap-2 text-gray-500 ${isTablet ? 'text-xs' : 'text-sm'}`}>
              <div className="icon-container" style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                <Calendar className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
              <span>{formatDate(attachment.emailDate)}</span>
            </div>
            {/* Status indicator with arrow icon */}
            <div className={`flex items-center gap-2 text-gray-500 ${isTablet ? 'text-xs' : 'text-sm'}`}>
              <div className="icon-container" style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                {attachment.direction === 'received' ? (
                  <ArrowDown className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
                ) : (
                  <ArrowUp className={`text-gray-400 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
                )}
              </div>
              <span className="font-bold text-gray-500">
                {attachment.direction === 'received' ? 'Received' : 'Sent'}
              </span>
            </div>
          </div>
        </div>

        {/* Single integrated action row - tablet optimized touch targets */}
        <div className={`bg-white/50 backdrop-blur-sm rounded-b-2xl border-t border-gray-200/60 flex items-stretch ${
          isTablet ? 'h-14' : 'h-12'
        }`}>
          {/* View Email section */}
          <button
            onClick={() => navigate(`/email/${attachment.emailId}`)}
            className={`flex items-center justify-center flex-1 transition-all duration-200 h-full text-gray-700 hover:bg-gray-100 rounded-bl-2xl ${
              isTablet ? 'active:bg-gray-200' : ''
            }`}
          >
            <span className={`font-medium ${isTablet ? 'text-sm' : 'text-sm'}`}>View Email</span>
          </button>

          {/* Download section */}
          <div 
            className={`${fileInfo.badgeColor} text-white flex items-center justify-center flex-1 cursor-pointer hover:opacity-90 transition-all duration-200 h-full rounded-br-2xl ${
              isTablet ? 'active:opacity-80' : ''
            }`}
          >
            <Download className={`mr-2 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className={`font-medium ${isTablet ? 'text-sm' : 'text-sm'}`}>Download</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCardGrid;
