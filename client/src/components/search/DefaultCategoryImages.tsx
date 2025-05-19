import React from 'react';

// Map of category names to default image URLs
export const defaultCategoryImages: Record<string, string> = {
  "Veteran Benefits": "/assets/caregiver-illustration.png",
  "Aging Life Care Professionals": "/assets/caregiver-illustration.png",
  "Home Care Companies": "/assets/caregiver-illustration.png",
  "Government Agencies": "/assets/caregiver-illustration.png",
  "Financial Advisors": "/assets/caregiver-illustration.png",
  "Legal Services": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "In-Home Care": "/assets/caregiver-illustration.png",
  "Retirement Community": "/assets/caregiver-illustration.png",
  "Assisted Living": "/assets/caregiver-illustration.png",
  "Senior Community": "/assets/caregiver-illustration.png",
  "Government Office": "/assets/caregiver-illustration.png",
  // Additional categories that might be used in the search results
  "Home Care": "/assets/caregiver-illustration.png",
  "Senior Living": "/assets/caregiver-illustration.png",
  "Local Government": "/assets/caregiver-illustration.png",
  // Additional variations of category names to ensure matching
  "Senior living": "/assets/caregiver-illustration.png",
  "senior living": "/assets/caregiver-illustration.png",
  "Senior Living Facility": "/assets/caregiver-illustration.png",
  "Senior Housing": "/assets/caregiver-illustration.png",
  "retirement community": "/assets/caregiver-illustration.png",
  "Retirement community": "/assets/caregiver-illustration.png",
  "assisted living": "/assets/caregiver-illustration.png",
  "Assisted living": "/assets/caregiver-illustration.png",
  "Home care": "/assets/caregiver-illustration.png",
  "home care": "/assets/caregiver-illustration.png",
  "Local government": "/assets/caregiver-illustration.png",
  "local government": "/assets/caregiver-illustration.png",
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