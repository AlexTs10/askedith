
import { useMemo } from 'react';
import { getAllAttachments } from '../utils/attachmentUtils';

interface UseDocumentFilteringProps {
  searchQuery: string;
}

export const useDocumentFiltering = ({ searchQuery }: UseDocumentFilteringProps) => {
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const allAttachments = getAllAttachments();
    const query = searchQuery.toLowerCase();
    
    return allAttachments.filter(attachment => 
      attachment.name.toLowerCase().includes(query) ||
      attachment.senderName.toLowerCase().includes(query) ||
      attachment.senderOrganization.toLowerCase().includes(query) ||
      attachment.emailSubject.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return { filteredDocuments };
};
