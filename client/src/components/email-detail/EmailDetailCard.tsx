
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { EmailData } from '../../types/email';
import { Paperclip, Download, FileText, Image, File } from 'lucide-react';

interface EmailDetailCardProps {
  email: EmailData;
}

const EmailDetailCard: React.FC<EmailDetailCardProps> = ({ email }) => {
  // Helper function to format date in a readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Email header info */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium">{email.sender.name}</h3>
              <p className="text-gray-600">{email.sender.organization}</p>
              <p className="text-sm text-gray-500">{email.sender.email}</p>
            </div>
            
            <p className="text-sm text-gray-500">
              {formatDate(email.date)}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            <span>To: {email.recipient}</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Email content */}
        <div className="py-4 whitespace-pre-line text-gray-700">
          {email.content}
        </div>

        {/* Attachments section */}
        {email.attachments && email.attachments.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-medium text-gray-700">
                  Attachments ({email.attachments.length})
                </h4>
              </div>
              <div className="grid gap-2">
                {email.attachments.map((attachment) => {
                  const FileIcon = getFileIcon(attachment.type);
                  return (
                    <div 
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md">
                          <FileIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1 bg-white text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors text-sm">
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailDetailCard;
