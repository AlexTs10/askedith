
import React from 'react';
import { Card } from '../ui/card';
import { FileText, LayoutGrid, LayoutList } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import CompactDocumentCard from '../documents/CompactDocumentCard';
import DocumentCard from '../documents/DocumentCard';
import { AttachmentWithContext } from '../../utils/attachmentUtils';

interface DocumentHubContentProps {
  groupedAttachments: [string, AttachmentWithContext[]][];
  selectedFilter: 'all' | 'documents' | 'images' | 'spreadsheets' | 'organization' | 'date';
  filteredAttachments: AttachmentWithContext[];
  searchQuery: string;
  selectedFolderId: string | null;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const DocumentHubContent: React.FC<DocumentHubContentProps> = ({
  groupedAttachments,
  selectedFilter,
  filteredAttachments,
  searchQuery,
  selectedFolderId,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <>
      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && onViewModeChange(value as 'grid' | 'list')}
          className="border border-gray-200 rounded-lg p-1.5 bg-white shadow-md w-60 justify-center"
        >
          <ToggleGroupItem 
            value="grid" 
            aria-label="Grid view"
            className="px-4 py-2.5 rounded-md data-[state=on]:bg-blue-500 data-[state=on]:text-white hover:bg-gray-50 transition-all duration-200 flex-1 justify-center"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Grid</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List view"
            className="px-4 py-2.5 rounded-md data-[state=on]:bg-blue-500 data-[state=on]:text-white hover:bg-gray-50 transition-all duration-200 flex-1 justify-center"
          >
            <LayoutList className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">List</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Documents Grid */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200/60 bg-white">
        <div className="px-6 py-6">
          {filteredAttachments.length > 0 ? (
            <div className="space-y-8">
              {groupedAttachments.map(([groupKey, attachments]) => (
                <div key={groupKey} className="space-y-6">
                  {selectedFilter === 'organization' || selectedFilter === 'date' ? (
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200/30">
                      <h3 className="text-lg font-semibold text-gray-800">{groupKey}</h3>
                    </div>
                  ) : null}
                  
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-3 gap-10">
                      {attachments.map((attachment) => (
                        <div key={`${attachment.emailId}-${attachment.id}`} className="transform transition-all duration-200 hover:scale-[1.02]">
                          <CompactDocumentCard attachment={attachment} layout="grid" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
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
            <Card className="p-16 text-center bg-white/60 backdrop-blur-sm border-gray-200/60">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">No documents found</h3>
              <p className="text-gray-500 text-base leading-relaxed max-w-md mx-auto">
                {searchQuery ? 'Try adjusting your search terms or filters to find the documents you\'re looking for.' : selectedFolderId ? `No documents found in this folder.` : 'No email attachments are available at the moment. Documents will appear here when emails with attachments are received.'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default DocumentHubContent;
