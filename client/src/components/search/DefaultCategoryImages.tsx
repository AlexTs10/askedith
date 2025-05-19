import React from 'react';

// Map of category names to default image URLs
export const defaultCategoryImages: Record<string, string> = {
  "Veteran Benefits": "/assets/caregiver-illustration.png",
  "Aging Life Care Professionals": "/assets/caregiver-illustration.png",
  "Home Care Companies": "/assets/home-care.png",
  "Government Agencies": "/assets/local-government-offices.png",
  "Financial Advisors": "/assets/caregiver-illustration.png",
  "Legal Services": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  "In-Home Care": "/assets/home-care.png",
  "Retirement Community": "/assets/senior-living.png",
  "Assisted Living": "/assets/senior-living.png",
  "Senior Community": "/assets/senior-living.png",
  "Government Office": "/assets/local-government-offices.png",
  // Additional categories that might be used in the search results
  "Home Care": "/assets/home-care.png",
  "Senior Living": "/assets/senior-living.png",
  "Local Government": "/assets/local-government-offices.png",
  "Local Government Offices": "/assets/local-government-offices.png",
  // Additional variations of category names to ensure matching
  "Senior living": "/assets/senior-living.png",
  "senior living": "/assets/senior-living.png",
  "Senior Living Facility": "/assets/senior-living.png",
  "Senior Housing": "/assets/senior-living.png",
  "retirement community": "/assets/senior-living.png",
  "Retirement community": "/assets/senior-living.png",
  "assisted living": "/assets/senior-living.png",
  "Assisted living": "/assets/senior-living.png",
  "Home care": "/assets/home-care.png",
  "home care": "/assets/home-care.png",
  "Local government": "/assets/local-government-offices.png",
  "local government": "/assets/local-government-offices.png",
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