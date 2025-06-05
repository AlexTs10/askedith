
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailData } from '@/types/email';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Paperclip, FileText, Image, FileSpreadsheet, File } from 'lucide-react';
import { useIsTablet } from '@/hooks/use-tablet';

interface EmailTableProps {
  emails: EmailData[];
  formatDate: (dateString: string) => string;
}

const getFileIcon = (type: string) => {
  if (type.includes('wordprocessingml') || type.includes('docx')) {
    return <FileText className="w-4 h-4 text-purple-500" />;
  }
  if (type.includes('pdf')) {
    return <FileText className="w-4 h-4 text-red-500" />;
  }
  if (type.startsWith('image/')) {
    return <Image className="w-4 h-4 text-green-500" />;
  }
  if (type.includes('sheet') || type.includes('csv') || type.includes('excel')) {
    return <FileSpreadsheet className="w-4 h-4 text-blue-500" />;
  }
  if (type.includes('document') || type.includes('text')) {
    return <FileText className="w-4 h-4 text-red-500" />;
  }
  return <File className="w-4 h-4 text-gray-500" />;
};

const EmailTable: React.FC<EmailTableProps> = ({ emails, formatDate }) => {
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const handleRowClick = (emailId: string) => {
    navigate(`/email/${emailId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isTablet ? "w-[400px]" : "w-[280px]"}>Sender</TableHead>
            <TableHead className={isTablet ? "w-[800px]" : "w-[1200px]"}>Subject</TableHead>
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.length > 0 ? (
            emails.map((email) => (
              <React.Fragment key={email.id}>
                <TableRow 
                  className={`cursor-pointer hover:bg-gray-50 ${!email.read ? 'font-medium' : ''}`}
                  onClick={() => handleRowClick(email.id)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className={`${!email.read ? 'font-medium' : ''} ${isTablet ? 'text-sm' : ''}`}>
                          {email.sender.name}
                        </span>
                        <span className={`text-gray-500 break-words ${isTablet ? 'text-xs' : 'text-sm'}`}>
                          {email.sender.organization}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className={`${!email.read ? 'font-medium' : ''} break-words ${isTablet ? 'text-sm' : ''}`}>
                        {email.subject}
                      </span>
                      <span className={`text-gray-500 break-words line-clamp-3 bg-amber-50 px-2 py-1 rounded ${isTablet ? 'text-xs' : 'text-sm'}`}>
                        {email.content.substring(0, isTablet ? 180 : 240)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-gray-500">{formatDate(email.date)}</TableCell>
                  <TableCell className="text-center">
                    {!email.read ? (
                      <Badge className="bg-purple-500 hover:bg-purple-600">Unread</Badge>
                    ) : !email.replied ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
                    ) : !email.responseReceived ? (
                      <Badge className="bg-red-500 hover:bg-red-600">No Response</Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">Complete</Badge>
                    )}
                  </TableCell>
                </TableRow>
                
                {/* Attachments row */}
                {email.attachments && email.attachments.length > 0 && (
                  <TableRow className="border-t-0 hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(email.id)}>
                    <TableCell colSpan={4} className="py-3 pl-8 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Attachments ({email.attachments.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {email.attachments.slice(0, 5).map((attachment, index) => (
                          <div key={index} className="flex items-center gap-1.5 text-gray-600 bg-white rounded-md px-2 py-1 text-xs border border-gray-200">
                            {getFileIcon(attachment.type)}
                            <span className="break-words line-clamp-1 max-w-[200px]" title={attachment.name}>
                              {attachment.name}
                            </span>
                          </div>
                        ))}
                        {email.attachments.length > 5 && (
                          <div className="flex items-center gap-1.5 text-gray-500 bg-white rounded-md px-2 py-1 text-xs border border-gray-200">
                            <Paperclip className="w-3 h-3" />
                            <span>+{email.attachments.length - 5} more</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Mail className="h-8 w-8 mb-2 opacity-30" />
                  <p>No emails found</p>
                  <p className="text-sm">
                    {emails.length === 0 && window.location.search 
                      ? "Try changing your search terms" 
                      : "No emails match the selected filters"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmailTable;
