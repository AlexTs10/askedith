
import { useMemo } from 'react';
import { getAllEmailsWithAttachments } from '../utils/emailDataUtils';
import { EmailData } from '../types/email';

interface UseEmailFilteringProps {
  category?: string;
  activeTab: string;
  searchQuery: string;
}

export const useEmailFiltering = ({ category, activeTab, searchQuery }: UseEmailFilteringProps) => {
  const filteredEmails = useMemo(() => {
    let emails = getAllEmailsWithAttachments();
    
    // Filter by category
    if (category && category !== 'all') {
      emails = emails.filter(email => email.category === category);
    }
    
    // Filter by status (activeTab)
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'unread':
          emails = emails.filter(email => !email.read);
          break;
        case 'pending':
          emails = emails.filter(email => email.read && !email.replied);
          break;
        case 'no-response':
          emails = emails.filter(email => email.replied && !email.responseReceived);
          break;
        case 'complete':
          emails = emails.filter(email => email.responseReceived);
          break;
        case 'private':
          emails = emails.filter(email => email.private);
          break;
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      emails = emails.filter(email => 
        email.subject.toLowerCase().includes(query) ||
        email.sender.name.toLowerCase().includes(query) ||
        email.sender.organization.toLowerCase().includes(query) ||
        email.content.toLowerCase().includes(query)
      );
    }
    
    return emails;
  }, [category, activeTab, searchQuery]);
  
  return { filteredEmails };
};
