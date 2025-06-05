

import { useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { EmailData } from '../types/email';
import { 
  getEmailsByCategory, 
  getUnreadEmails, 
  getPendingEmails, 
  getUnrespondedEmails, 
  getAllEmails 
} from '../data/emailData';

export const useFilteredEmailData = () => {
  const { userRole } = useUserRole();

  const filterPrivateEmails = (emails: EmailData[]): EmailData[] => {
    if (userRole === 'primary-caregiver') {
      return emails; // Primary caregivers see all emails
    }
    return emails.filter(email => !email.private); // Family members only see non-private emails
  };

  const filteredEmailsByCategory = useMemo(() => {
    const categories = [
      'attorneys',
      'other-professionals', 
      'paying-for-care',
      'home-care',
      'physical-therapy',
      'senior-living',
      'government-va',
      'hospitals',
      'pharmacies'
    ] as const;

    return categories.reduce((acc, category) => {
      acc[category] = filterPrivateEmails(getEmailsByCategory(category));
      return acc;
    }, {} as Record<string, EmailData[]>);
  }, [userRole]);

  const getFilteredEmailsByCategory = (category: string) => {
    return filterPrivateEmails(getEmailsByCategory(category));
  };

  const getFilteredUnreadEmails = (category?: string) => {
    return filterPrivateEmails(getUnreadEmails(category));
  };

  const getFilteredPendingEmails = (category?: string) => {
    return filterPrivateEmails(getPendingEmails(category));
  };

  const getFilteredUnrespondedEmails = (category?: string) => {
    return filterPrivateEmails(getUnrespondedEmails(category));
  };

  const getFilteredAllEmails = () => {
    return filterPrivateEmails(getAllEmails());
  };

  const getFilteredEmailData = () => {
    return filterPrivateEmails(getAllEmails());
  };

  return {
    filteredEmailsByCategory,
    getFilteredEmailsByCategory,
    getFilteredUnreadEmails,
    getFilteredPendingEmails,
    getFilteredUnrespondedEmails,
    getFilteredAllEmails,
    getFilteredEmailData
  };
};

