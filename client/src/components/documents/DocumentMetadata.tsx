
import React from 'react';
import { Calendar, User, Building } from 'lucide-react';

interface DocumentMetadataProps {
  senderName: string;
  senderOrganization: string;
  emailDate: string;
  layout?: 'grid' | 'list';
}

const DocumentMetadata = ({ 
  senderName, 
  senderOrganization, 
  emailDate, 
  layout = 'grid' 
}: DocumentMetadataProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (layout === 'grid') {
    return (
      <div className="flex-1 space-y-2 mb-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{senderName}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Building className="h-3 w-3 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{senderOrganization}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{formatDate(emailDate)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <User className="h-3 w-3" />
        {senderName}
      </div>
      <div className="flex items-center gap-1">
        <Building className="h-3 w-3" />
        {senderOrganization}
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {formatDate(emailDate)}
      </div>
    </div>
  );
};

export default DocumentMetadata;
