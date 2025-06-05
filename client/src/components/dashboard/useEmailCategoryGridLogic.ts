
import React from 'react';

interface EmailCategory {
  id: string;
  title: string;
  icon: any;
  unread: number;
  pending: number;
  total: number;
  color: string;
  bgColor: string;
  textColor: string;
}

interface UseEmailCategoryGridLogicProps {
  categories: EmailCategory[];
  currentPage?: number;
}

export const useEmailCategoryGridLogic = ({ 
  categories, 
  currentPage 
}: UseEmailCategoryGridLogicProps) => {
  const [internalCurrentPage, setInternalCurrentPage] = React.useState(1);
  
  // Use external currentPage if provided, otherwise use internal state
  const activePage = currentPage || internalCurrentPage;
  
  // Pagination settings: 9 categories per page (3 rows of 3)
  const CATEGORIES_PER_PAGE = 9;
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);
  
  // Calculate which categories to show on current page
  const startIndex = (activePage - 1) * CATEGORIES_PER_PAGE;
  const endIndex = startIndex + CATEGORIES_PER_PAGE;
  const currentPageCategories = categories.slice(startIndex, endIndex);
  
  // Determine where to place the "Add New Category" button
  const totalCategoriesOnPage = currentPageCategories.length;
  const shouldShowAddButton = activePage > totalPages || 
    (activePage === totalPages && totalCategoriesOnPage < CATEGORIES_PER_PAGE);
  
  let priorityCategories = [];
  let compactCategories = [];
  let addButtonInFirstRow = false;
  let addButtonInCompactRows = false;
  
  if (shouldShowAddButton) {
    if (totalCategoriesOnPage < 3) {
      priorityCategories = currentPageCategories;
      addButtonInFirstRow = true;
    } else if (totalCategoriesOnPage < 9) {
      priorityCategories = currentPageCategories.slice(0, 3);
      compactCategories = currentPageCategories.slice(3);
      addButtonInCompactRows = true;
    }
  } else {
    priorityCategories = currentPageCategories.slice(0, 3);
    compactCategories = currentPageCategories.slice(3);
  }
  
  const handlePageChange = (page: number) => {
    if (!currentPage) {
      setInternalCurrentPage(page);
    }
  };

  return {
    activePage,
    totalPages,
    priorityCategories,
    compactCategories,
    addButtonInFirstRow,
    addButtonInCompactRows,
    handlePageChange
  };
};
