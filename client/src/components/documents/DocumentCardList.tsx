
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Calendar, User, Building } from 'lucide-react';
import { getFileTypeInfo, getStatusBadgeColor, formatFileSize, formatDate } from '../../utils/fileTypeUtils';
import StatusBadge from './StatusBadge';

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

interface DocumentCardListProps {
  attachment: AttachmentWithContext;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

const DocumentCardList = ({ attachment, onMouseEnter, onMouseLeave }: DocumentCardListProps) => {
  const navigate = useNavigate();
  const fileInfo = getFileTypeInfo(attachment.type);
  const FileIcon = fileInfo.icon;
  const statusBadgeColor = getStatusBadgeColor(attachment.direction, fileInfo.statusBadgeColor);

  return (
    <Card 
      className="hover:shadow-md transition-shadow"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${fileInfo.bgColor} flex items-center justify-center`}>
              <FileIcon className={`h-6 w-6 ${fileInfo.textColor}`} />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-700 mb-1">{attachment.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {attachment.senderName}
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {attachment.senderOrganization}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(attachment.emailDate)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">{formatFileSize(attachment.size)}</div>
              <StatusBadge direction={attachment.direction} statusBadgeColor={statusBadgeColor} />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/email/${attachment.emailId}`)}
              >
                View Email
              </Button>
              <Button
                size="sm"
                className={`${fileInfo.badgeColor} text-white`}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCardList;
