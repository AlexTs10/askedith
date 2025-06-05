
import React from 'react';
import { FileText } from 'lucide-react';
import CompactDocumentCard from './CompactDocumentCard';
import DocumentCard from './DocumentCard';
import DocumentCardGrid from './DocumentCardGrid';
import { AttachmentWithContext } from '../../utils/attachmentUtils';

interface DocumentsContentProps {
  groupedAttachments: [string, AttachmentWithContext[]][];
  selectedFilter: string;
  filteredAttachments: AttachmentWithContext[];
  searchQuery: string;
  selectedFolderId: string | null;
  viewMode: 'grid' | 'list';
}

const DocumentsContent = ({ 
  groupedAttachments, 
  selectedFilter, 
  filteredAttachments, 
  searchQuery, 
  selectedFolderId,
  viewMode 
}: DocumentsContentProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto pt-8">
      {filteredAttachments.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {groupedAttachments.map(([groupKey, attachments]) => (
            <div key={groupKey} className="space-y-4 sm:space-y-6">
              {selectedFilter === 'organization' || selectedFilter === 'date' || selectedFilter === 'person' ? (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800">{groupKey}</h3>
                </div>
              ) : null}
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-14 gap-y-12">
                  {attachments.map((attachment) => (
                    <div key={`${attachment.emailId}-${attachment.id}`} className="transform transition-all duration-200">
                      <DocumentCardGrid attachment={attachment} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {attachments.map((attachment) => (
                    <div key={`${attachment.emailId}-${attachment.id}`} className="transform transition-all duration-200 hover:translate-x-1">
                      <DocumentCard attachment={attachment} isGridView={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3">No documents found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            {searchQuery ? 'Try adjusting your search terms or filters to find the documents you\'re looking for.' : selectedFolderId ? `No documents found in this folder.` : 'No email attachments are available at the moment. Documents will appear here when emails with attachments are received.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentsContent;
