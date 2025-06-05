
import { useMemo } from 'react';
import { getAllEmailsWithAttachments } from '../utils/emailDataUtils';
import { EmailData } from '../types/email';

interface UseEmailPreviewProps {
  category: string;
  status: 'unread' | 'pending' | 'unresponded';
}

export const useEmailPreview = ({ category, status }: UseEmailPreviewProps) => {
  const previewEmails = useMemo(() => {
    let emails = getAllEmailsWithAttachments();
    
    // Filter by category
    if (category !== 'all') {
      emails = emails.filter(email => email.category === category);
    }
    
    // Filter by status
    switch (status) {
      case 'unread':
        emails = emails.filter(email => !email.read);
        break;
      case 'pending':
        emails = emails.filter(email => email.read && !email.replied);
        break;
      case 'unresponded':
        emails = emails.filter(email => email.replied && !email.responseReceived);
        break;
    }
    
    // Sort by date (most recent first) and limit to 3
    return emails
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [category, status]);
  
  return { previewEmails };
};
