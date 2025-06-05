
import { useMemo } from 'react';
import { 
  Building2, 
  Home, 
  Building, 
  Scale, 
  Briefcase, 
  Shield, 
  Activity, 
  CreditCard,
  Hospital,
  Pill,
  LucideIcon
} from 'lucide-react';
import { useFilteredEmailData } from './useFilteredEmailData';
import { getCustomCategories } from '../utils/categoryUtils';

export interface EmailCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  unread: number;
  pending: number;
  total: number;
  color: string;
  bgColor: string;
  textColor: string;
}

export const useEmailCategoryData = () => {
  const { 
    getFilteredUnreadEmails, 
    getFilteredPendingEmails, 
    getFilteredUnrespondedEmails,
    getFilteredEmailsByCategory 
  } = useFilteredEmailData();

  // Memoize the email categories calculation with new order
  const emailCategories = useMemo(() => {
    // Predefined categories in the new order from your image
    const predefinedCategories = [
      {
        id: 'attorneys',
        title: 'Elder Law Attorneys',
        icon: Scale,
        color: 'from-amber-400 to-orange-500',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-600'
      },
      {
        id: 'other-professionals',
        title: 'Professionals',
        icon: Briefcase,
        color: 'from-gray-400 to-gray-600',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600'
      },
      {
        id: 'paying-for-care',
        title: 'Paying for Care',
        icon: CreditCard,
        color: 'from-orange-400 to-orange-600',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600'
      },
      {
        id: 'home-care',
        title: 'Home Care',
        icon: Home,
        color: 'from-teal-600 to-teal-700',
        bgColor: 'bg-teal-100',
        textColor: 'text-teal-600'
      },
      {
        id: 'physical-therapy',
        title: 'Physical Therapy',
        icon: Activity,
        color: 'from-teal-400 to-teal-600',
        bgColor: 'bg-teal-100',
        textColor: 'text-teal-600'
      },
      {
        id: 'senior-living',
        title: 'Senior Living',
        icon: Building2,
        color: 'from-purple-400 to-purple-500',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600'
      },
      {
        id: 'government-va',
        title: 'Government & VA',
        icon: Building,
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      },
      {
        id: 'hospitals',
        title: 'Hospitals',
        icon: Hospital,
        color: 'from-red-400 to-red-600',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600'
      },
      {
        id: 'pharmacies',
        title: 'Pharmacies',
        icon: Pill,
        color: 'from-pink-400 to-pink-600',
        bgColor: 'bg-pink-100',
        textColor: 'text-pink-600'
      }
    ];

    // Get custom categories and add them to the list
    const customCategories = getCustomCategories();
    
    const allCategories = [...predefinedCategories, ...customCategories.map(custom => ({
      ...custom,
      icon: Briefcase, // Default icon for custom categories
      textColor: 'text-gray-600' // Default text color for custom categories
    }))];

    return allCategories.map(category => {
      const unread = getFilteredUnreadEmails(category.id).length;
      const pending = getFilteredPendingEmails(category.id).length;
      const total = getFilteredEmailsByCategory(category.id).length;

      return {
        ...category,
        unread,
        pending,
        total
      } as EmailCategory;
    });
  }, [getFilteredUnreadEmails, getFilteredPendingEmails, getFilteredEmailsByCategory]);

  // Calculate totals across all categories
  const totalUnread = useMemo(() => {
    return getFilteredUnreadEmails().length;
  }, [getFilteredUnreadEmails]);

  const totalPending = useMemo(() => {
    return getFilteredPendingEmails().length;
  }, [getFilteredPendingEmails]);

  const totalUnresponded = useMemo(() => {
    return getFilteredUnrespondedEmails().length;
  }, [getFilteredUnrespondedEmails]);

  const refreshCategories = () => {
    // This function can be called to trigger a re-render of categories
    // The useMemo dependencies will handle the actual refresh
  };

  return {
    emailCategories,
    totalUnread,
    totalPending,
    totalUnresponded,
    refreshCategories
  };
};
