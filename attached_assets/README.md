
# Clean Search Results Component

This folder contains all the necessary files to implement the clean search results functionality in a React application.

## Files Included

1. **pages/CleanSearchResults.tsx** - The main component that renders the search results page
2. **components/search/DefaultCategoryImages.tsx** - Helper component for default category images
3. **components/ui/tabs.tsx** - UI component for tabs
4. **components/ui/button.tsx** - UI component for buttons
5. **lib/utils.ts** - Utility functions
6. **data/mockSearchData.ts** - Mock data for search results
7. **data/Icons.tsx** - Simple icon components

## Dependencies Required

To use these components, your project needs the following npm packages:

```
npm install react react-dom lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-tabs
```

## How to Use

1. Copy these files into your Replit project maintaining the folder structure
2. Update import paths if necessary
3. Add the CleanSearchResults component to your routing

## Features

- Category-based search results
- Responsive design (mobile, tablet, desktop)
- "Check to Contact" functionality
- Fallback images for failed logo loads
- Teal color theme
- Tracking of contacted items by category for email templates
