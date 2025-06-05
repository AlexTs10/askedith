
import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { AttachmentWithContext } from '../../utils/attachmentUtils';

interface DocumentPreviewProps {
  documents: AttachmentWithContext[];
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documents }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (documents.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const displayedDocuments = isExpanded ? documents : documents.slice(0, 3);
  const remainingCount = documents.length - 3;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-green-600" />
        <h3 className="text-sm font-medium text-gray-800">
          Related Documents ({documents.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {displayedDocuments.map((document) => (
          <div key={`${document.emailId}-${document.name}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
              <p className="text-xs text-gray-600 truncate">
                From: {document.senderName} ({document.senderOrganization})
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatFileSize(document.size)}</span>
              <span>•</span>
              <span>{formatDate(document.emailDate)}</span>
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-blue-600 hover:text-blue-800 text-center pt-1 w-full cursor-pointer hover:underline"
          >
            +{remainingCount} more documents
          </button>
        )}
        
        {isExpanded && documents.length > 3 && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-gray-500 hover:text-gray-700 text-center pt-1 w-full cursor-pointer hover:underline"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;
