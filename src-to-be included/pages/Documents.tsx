import React, { useState } from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import DocumentSidebar from '../components/documents/DocumentSidebar';
import DocumentsHeader from '../components/documents/DocumentsHeader';
import DocumentsSearchBar from '../components/documents/DocumentsSearchBar';
import DocumentsFilterRow from '../components/documents/DocumentsFilterRow';
import DocumentsContent from '../components/documents/DocumentsContent';
import { getAllAttachments, filterAttachments, getAttachmentStats, AttachmentWithContext } from '../utils/attachmentUtils';
import { getDocumentsInFolder, createFolder } from '../utils/folderUtils';
import NewEmailForm from '../components/NewEmailForm';
import SlideOutCalendarSidebar from '../components/calendar/SlideOutCalendarSidebar';
import { useToast } from '../hooks/use-toast';
import { useSlideOutCalendar } from '../hooks/useSlideOutCalendar';

type FilterType = 'all' | 'person' | 'organization' | 'date';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewEmailForm, setShowNewEmailForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'received' | 'sent'>('all');
  const { toast } = useToast();
  const { isCalendarOpen, openCalendar, closeCalendar } = useSlideOutCalendar();

  const allAttachments = getAllAttachments();
  
  // Filter attachments by folder first, then by other criteria
  const folderFilteredAttachments = selectedFolderId 
    ? allAttachments.filter(attachment => {
        const folderAssignments = getDocumentsInFolder(selectedFolderId);
        const isInFolder = folderAssignments.some(assignment => 
          assignment.documentId === attachment.name && assignment.emailId === attachment.emailId
        );
        return isInFolder;
      })
    : allAttachments;

  // Apply direction filter - this should work regardless of other filters
  const directionFilteredAttachments = directionFilter === 'all'
    ? folderFilteredAttachments 
    : folderFilteredAttachments.filter(attachment => attachment.direction === directionFilter);

  const filteredAttachments = filterAttachments(directionFilteredAttachments, searchQuery, 'all');
  const stats = getAttachmentStats(allAttachments);

  const handleCreateFolder = (name: string) => {
    if (name.trim()) {
      createFolder(name.trim());
    }
  };

  const handleNewEmail = (emailData: any) => {
    console.log('New email to be sent:', emailData);
    
    toast({
      title: "Email Sent",
      description: `Email sent to ${emailData.toName} at ${emailData.toOrganization}`,
    });
  };

  // Group attachments by different criteria
  const groupAttachments = (attachments: AttachmentWithContext[], filterType: FilterType): [string, AttachmentWithContext[]][] => {
    if (filterType === 'all') {
      return [['All Files', attachments]];
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

    if (filterType === 'person') {
      const groups: Record<string, AttachmentWithContext[]> = {};
      attachments.forEach(attachment => {
        const key = attachment.senderName || 'Unknown Person';
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

    return [['All Files', attachments]];
  };

  const groupedAttachments = groupAttachments(filteredAttachments, selectedFilter);

  // Calculate counts for each filter - when direction filter is applied, respect it
  const getFilterCount = (filterType: string) => {
    // Apply direction filter first
    const baseAttachments = directionFilter === 'all' ? allAttachments : 
      allAttachments.filter(attachment => attachment.direction === directionFilter);
    
    if (filterType === 'organization') {
      const uniqueOrgs = new Set(baseAttachments.map(a => a.senderOrganization));
      return uniqueOrgs.size;
    }
    if (filterType === 'person') {
      const uniquePersons = new Set(baseAttachments.map(a => a.senderName));
      return uniquePersons.size;
    }
    if (filterType === 'date') {
      const uniqueMonths = new Set(baseAttachments.map(a => {
        const date = new Date(a.emailDate);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
      }));
      return uniqueMonths.size;
    }
    return 0;
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter as FilterType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarProvider defaultOpen={true}>
        <div className="flex gap-6 w-full">
          <DocumentSidebar 
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
            onCreateFolder={handleCreateFolder}
          />
          
          {/* Main content area - centered and wider */}
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="w-full max-w-[1920px] mx-auto px-6 py-4 sm:py-8 pt-16">
              <DocumentsHeader 
                onNewEmailClick={() => setShowNewEmailForm(true)}
                onCalendarClick={openCalendar}
              />
              
              <DocumentsSearchBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <DocumentsFilterRow
                selectedFilter={selectedFilter}
                onFilterChange={handleFilterChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                directionFilter={directionFilter}
                onDirectionFilterChange={setDirectionFilter}
                getFilterCount={getFilterCount}
              />

              <DocumentsContent 
                groupedAttachments={groupedAttachments}
                selectedFilter={selectedFilter}
                filteredAttachments={filteredAttachments}
                searchQuery={searchQuery}
                selectedFolderId={selectedFolderId}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>

        {/* New Email Form */}
        <NewEmailForm
          isOpen={showNewEmailForm}
          onClose={() => setShowNewEmailForm(false)}
          onSend={handleNewEmail}
        />

        {/* Slide-out Calendar Sidebar */}
        <SlideOutCalendarSidebar
          isOpen={isCalendarOpen}
          onClose={closeCalendar}
        />
      </SidebarProvider>
    </div>
  );
};

export default Documents;
