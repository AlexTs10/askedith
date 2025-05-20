import React from 'react';

/**
 * Get a default image URL for a given category
 * @param category - The category to get an image for
 * @returns URL of the default image
 */
export const getDefaultImageForCategory = (category?: string): string => {
  // Default fallback image
  if (!category) return '/assets/caregiver-illustration.png';
  
  // Force matching to the specific images for the Lovable.dev design
  if (category === "Veteran Benefits") {
    return "/assets/Veteran Benefits.png";
  } else if (category === "Senior Living") {
    return "/assets/Senior Living.png";
  } else if (category === "Financial Advisors") {
    return "/assets/Financial Advisors.png";
  } else if (category === "Aging Life Care Professionals") {
    return "/assets/Aging Life Care Professionals.png";
  } else if (category === "Home Care" || category === "Home Care Companies") {
    return "/assets/Home Care.png";
  } else if (category === "Local Government Offices" || category === "Government Agencies") {
    return "/assets/Local Government Offices.png";
  } else if (category === "Elder Law Attorneys") {
    return "/assets/caregiver-illustration.png";
  }
  
  // Default fallback
  return '/assets/caregiver-illustration.png';
};

/**
 * Get a category label for display purposes
 * @param category - The original category name
 * @returns A user-friendly display name for the category
 */
export const getCategoryLabel = (category?: string): string => {
  if (!category) return '';
  
  switch (category) {
    case "Home Care Companies":
      return "In-Home Care";
    case "Government Agencies":
      return "Government Office";
    case "Senior Living":
      return "Assisted Living";
    case "Elder Law Attorneys":
      return "Legal Services";
    case "Aging Life Care Professionals":
      return "Care Management";
    case "Veteran Benefits":
      return "Veteran Services";
    default:
      return category;
  }
};

/**
 * Returns an emoji icon for each category
 * @param category - The category name
 * @returns An emoji string representing the category
 */
export const getCategoryIcon = (category?: string): string => {
  if (!category) return '';
  
  switch (category) {
    case "Home Care Companies":
      return "🏠";
    case "Senior Living":
      return "🏘️";
    case "Government Agencies":
      return "🏛️";
    case "Elder Law Attorneys":
      return "⚖️";
    case "Aging Life Care Professionals":
      return "👴";
    case "Veteran Benefits":
      return "🎖️";
    default:
      return "";
  }
};