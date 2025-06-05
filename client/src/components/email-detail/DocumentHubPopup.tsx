
import React, { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { SidebarProvider } from '../ui/sidebar';
import DocumentSidebar from '../documents/DocumentSidebar';
import DocumentHubHeader from './DocumentHubHeader';
import DocumentHubStats from './DocumentHubStats';
import DocumentHubSearchFilters from './DocumentHubSearchFilters';
import DocumentHubContent from './DocumentHubContent';
import { getAllAttachments, filterAttachments, getAttachmentStats } from '../../utils/attachmentUtils';
import { getDocumentsInFolder, createFolder } from '../../utils/folderUtils';
import { AttachmentWithContext } from '../../utils/attachmentUtils';

interface DocumentHubPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isAccordionMode?: boolean;
}

const DocumentHubPopup: React.FC<DocumentHubPopupProps> = ({ isOpen, onClose, isAccordionMode = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'documents' | 'images' | 'spreadsheets' | 'organization' | 'date'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [folderRefreshKey, setFolderRefreshKey] = useState(0);
  const [directionFilter, setDirectionFilter] = useState<'all' | 'received' | 'sent'>('all');

  const allAttachments = getAllAttachments();
  
  // Add debugging for folder filtering
  console.log('Selected folder ID:', selectedFolderId);
  console.log('All attachments:', allAttachments.map(att => ({ id: att.id, emailId: att.emailId, name: att.name })));
  
  if (selectedFolderId) {
    const folderAssignments = getDocumentsInFolder(selectedFolderId);
    console.log(`Folder assignments for ${selectedFolderId}:`, folderAssignments);
  }
  
  // Filter attachments by folder first, then by other criteria
  // Use attachment name as documentId since that's what we have in our assignments
  const folderFilteredAttachments = selectedFolderId 
    ? allAttachments.filter(attachment => {
        const folderAssignments = getDocumentsInFolder(selectedFolderId);
        const isInFolder = folderAssignments.some(assignment => 
          assignment.documentId === attachment.name && assignment.emailId === attachment.emailId
        );
        console.log(`Attachment ${attachment.name} from email ${attachment.emailId} in folder ${selectedFolderId}:`, isInFolder);
        return isInFolder;
      })
    : allAttachments;

  console.log('Folder filtered attachments:', folderFilteredAttachments.length);

  // Apply direction filter
  const directionFilteredAttachments = directionFilter === 'all'
    ? folderFilteredAttachments 
    : folderFilteredAttachments.filter(attachment => attachment.direction === directionFilter);

  const filteredAttachments = filterAttachments(directionFilteredAttachments, searchQuery, selectedFilter === 'organization' || selectedFilter === 'date' ? 'all' : selectedFilter);
  const stats = getAttachmentStats(allAttachments);

  const handleCreateFolder = (name: string) => {
    if (name.trim()) {
      createFolder(name.trim());
      // Trigger a re-render by updating the refresh key
      setFolderRefreshKey(prev => prev + 1);
    }
  };

  // Modified search handler to reset direction filter to 'all'
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Reset direction filter to 'all' when user performs a search
    if (value.trim() && directionFilter !== 'all') {
      setDirectionFilter('all');
    }
  };

  // Group attachments by different criteria
  const groupAttachments = (attachments: AttachmentWithContext[], filterType: string) => {
    if (filterType === 'all' || filterType === 'documents' || filterType === 'images' || filterType === 'spreadsheets') {
      return [['All Files', attachments] as [string, AttachmentWithContext[]]];
    }

    if (filterType === 'organization') {
      const groups: Record<string, AttachmentWithContext[]> = {};
      attachments.forEach(attachment => {
        const key = attachment.senderOrganization || 'Unknown Organization';
        if (!groups[key]) groups[key] = [];
        groups[key].push(attachment);
      });
      return Object.entries(groups);
    }

    if (filterType === 'date') {
      const groups: Record<string, AttachmentWithContext[]> = {};
      attachments.forEach(attachment => {
        const date = new Date(attachment.emailDate);
        const key = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
        if (!groups[key]) groups[key] = [];
        groups[key].push(attachment);
      });
      return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
    }

    return [['All Files', attachments] as [string, AttachmentWithContext[]]];
  };

  const groupedAttachments = groupAttachments(filteredAttachments, selectedFilter);

  // If in accordion mode, render without dialog wrapper and without header
  if (isAccordionMode) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white p-6">
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-full min-h-[600px] w-full justify-center">
            <div className="w-full max-w-6xl flex">
              <DocumentSidebar 
                key={folderRefreshKey}
                selectedFolderId={selectedFolderId}
                onFolderSelect={setSelectedFolderId}
                onCreateFolder={handleCreateFolder}
              />
              
              <div className="flex-1 flex flex-col space-y-6 px-6">
                <DocumentHubStats stats={stats} />

                <DocumentHubSearchFilters
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  selectedFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
                  directionFilter={directionFilter}
                  onDirectionFilterChange={setDirectionFilter}
                />

                <DocumentHubContent
                  groupedAttachments={groupedAttachments}
                  selectedFilter={selectedFilter}
                  filteredAttachments={filteredAttachments}
                  searchQuery={searchQuery}
                  selectedFolderId={selectedFolderId}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1424px] w-full max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <DocumentHubHeader />
        
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-full min-h-[600px] w-full">
            <DocumentSidebar 
              key={folderRefreshKey}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              onCreateFolder={handleCreateFolder}
            />
            
            <div className="flex-1 flex flex-col space-y-6 px-6">
              <DocumentHubStats stats={stats} />

              <DocumentHubSearchFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                directionFilter={directionFilter}
                onDirectionFilterChange={setDirectionFilter}
              />

              <DocumentHubContent
                groupedAttachments={groupedAttachments}
                selectedFilter={selectedFilter}
                filteredAttachments={filteredAttachments}
                searchQuery={searchQuery}
                selectedFolderId={selectedFolderId}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentHubPopup;
