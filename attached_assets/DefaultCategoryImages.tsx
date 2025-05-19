
import React from 'react';

// Map of category names to default image URLs
export const defaultCategoryImages: Record<string, string> = {
  "Legal Services": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "In-Home Care": "/lovable-uploads/59ca4042-c924-4970-8334-c6b250c3ef3e.png",
  "Retirement Community": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Assisted Living": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Senior Community": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Government Office": "/lovable-uploads/5260028f-201b-4666-9005-2ba5fd7f708a.png",
  // Adding additional categories that might be used in the search results
  "Home Care": "/lovable-uploads/59ca4042-c924-4970-8334-c6b250c3ef3e.png",
  "Senior Living": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Local Government": "/lovable-uploads/5260028f-201b-4666-9005-2ba5fd7f708a.png",
  // Additional variations of category names to ensure matching
  "Senior living": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "senior living": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Senior Living Facility": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Senior Housing": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "retirement community": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Retirement community": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "assisted living": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Assisted living": "/lovable-uploads/98e92fde-0012-47ca-8071-1908cbb6f947.png",
  "Home care": "/lovable-uploads/59ca4042-c924-4970-8334-c6b250c3ef3e.png",
  "home care": "/lovable-uploads/59ca4042-c924-4970-8334-c6b250c3ef3e.png",
  "Local government": "/lovable-uploads/5260028f-201b-4666-9005-2ba5fd7f708a.png",
  "local government": "/lovable-uploads/5260028f-201b-4666-9005-2ba5fd7f708a.png",
  // Default fallback image if category is not found
  "default": "https://images.unsplash.com/photo-1564732005956-20420ebdee39?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
};

/**
 * Get a default image URL for a given category
 * @param category - The category to get an image for
 * @returns URL of the default image
 */
export const getDefaultImageForCategory = (category?: string): string => {
  if (!category) {
    return defaultCategoryImages.default;
  }
  
  // Try exact match first
  if (category in defaultCategoryImages) {
    return defaultCategoryImages[category];
  }
  
  // Try case-insensitive match
  const lowerCaseCategory = category.toLowerCase();
  const categoryKeys = Object.keys(defaultCategoryImages);
  
  for (const key of categoryKeys) {
    if (key.toLowerCase() === lowerCaseCategory) {
      return defaultCategoryImages[key];
    }
  }
  
  // Try partial match (if category contains a key or vice versa)
  for (const key of categoryKeys) {
    if (key !== 'default' && 
        (lowerCaseCategory.includes(key.toLowerCase()) || 
         key.toLowerCase().includes(lowerCaseCategory))) {
      return defaultCategoryImages[key];
    }
  }
  
  // Return default if no match found
  return defaultCategoryImages.default;
};
