
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define ContactedItem type
export interface ContactedItem {
  id: string;
  categoryId: string;
  categoryName: string;
}

// Utility function to group contacted items by category
export function groupContactItemsByCategory(contactedItems: ContactedItem[]) {
  // Group contacted items by category
  const contactsByCategory: Record<string, {categoryName: string, items: string[]}> = {};
  
  contactedItems.forEach(item => {
    if (!contactsByCategory[item.categoryId]) {
      contactsByCategory[item.categoryId] = {
        categoryName: item.categoryName,
        items: []
      };
    }
    contactsByCategory[item.categoryId].items.push(item.id);
  });
  
  return contactsByCategory;
}

// Utility to prepare email template data based on category
export function prepareEmailTemplateData(contactedItems: ContactedItem[], results: any[]) {
  const groupedByCategory = groupContactItemsByCategory(contactedItems);
  
  // Create a structure with full result data for each category
  const emailData: Record<string, {categoryName: string, contacts: any[]}> = {};
  
  Object.entries(groupedByCategory).forEach(([categoryId, data]) => {
    emailData[categoryId] = {
      categoryName: data.categoryName,
      contacts: results.filter(result => data.items.includes(result.id))
    };
  });
  
  return emailData;
}
