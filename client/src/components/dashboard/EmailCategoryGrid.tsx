
import React, { useState, useRef, useCallback } from 'react';
import { useEmailCategoryGridLogic } from './useEmailCategoryGridLogic';
import EmailCategoryGridHeader from './EmailCategoryGridHeader';
import EmailCategoryGridContent, { EmailCategoryGridContentRef } from './EmailCategoryGridContent';
import EmailCategoryListContent, { EmailCategoryListContentRef } from './EmailCategoryListContent';
import EmailCategoryGridPagination from './EmailCategoryGridPagination';
import SearchResultsDisplay from './SearchResultsDisplay';
import { EmailCategory } from '../../hooks/useEmailCategoryData';
import { getAllEmailsWithAttachments } from '../../utils/emailDataUtils';

interface EmailCategoryGridProps {
  categories: EmailCategory[];
  searchQuery?: string;
  itemsPerPage?: number;
  currentPage?: number;
  showPagination?: boolean;
  onCategoryAdded?: () => void;
}

const EmailCategoryGrid: React.FC<EmailCategoryGridProps> = ({
  categories,
  searchQuery = '',
  itemsPerPage = 6,
  currentPage = 1,
  showPagination = true,
  onCategoryAdded
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allExpanded, setAllExpanded] = useState(false);
  const listContentRef = useRef<EmailCategoryListContentRef>(null);
  const gridContentRef = useRef<EmailCategoryGridContentRef>(null);

  // Search logic
  const allEmails = getAllEmailsWithAttachments();
  const hasSearchQuery = searchQuery.trim().length > 0;
  const searchResults = hasSearchQuery 
    ? allEmails.filter(email => {
        const query = searchQuery.toLowerCase().trim();
        const searchTerms = query.split(/\s+/);
        const searchableText = [
          email.subject,
          email.sender.name,
          email.sender.email,
          email.sender.organization,
          email.content
        ].join(' ').toLowerCase();
        return searchTerms.every(term => searchableText.includes(term));
      })
    : [];

  const hasNoEmailResults = hasSearchQuery && searchResults.length === 0;
  const filteredCategories = hasSearchQuery 
    ? categories.filter(category => {
        const categoriesWithMatches = new Set(searchResults.map(email => email.category));
        return categoriesWithMatches.has(category.id);
      })
    : categories;

  // Use the existing hook for pagination
  const {
    activePage,
    totalPages,
    priorityCategories,
    compactCategories,
    addButtonInFirstRow,
    addButtonInCompactRows,
    handlePageChange
  } = useEmailCategoryGridLogic({
    categories: filteredCategories,
    currentPage
  });

  const handleCollapseAll = () => {
    listContentRef.current?.collapseAll();
  };

  const handleToggleAll = () => {
    if (viewMode === 'grid') {
      gridContentRef.current?.toggleAll();
    }
  };

  // Callback to receive expanded state changes from grid content
  const handleExpandedChange = useCallback((expanded: boolean) => {
    setAllExpanded(expanded);
  }, []);

  return (
    <div className="space-y-6">
      <EmailCategoryGridHeader 
        activePage={activePage}
        totalPages={totalPages}
        showPagination={showPagination && totalPages > 1 && !hasSearchQuery}
        onPageChange={handlePageChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCollapseAll={viewMode === 'list' ? handleCollapseAll : undefined}
        onToggleAll={viewMode === 'grid' ? handleToggleAll : undefined}
        allExpanded={allExpanded}
      />

      <SearchResultsDisplay
        hasSearchQuery={hasSearchQuery}
        hasNoEmailResults={hasNoEmailResults}
        searchQuery={searchQuery}
        searchResultsCount={searchResults.length}
        filteredCategoriesCount={filteredCategories.length}
      />

      <div className="pt-3">
        {viewMode === 'grid' ? (
          <EmailCategoryGridContent
            ref={gridContentRef}
            priorityCategories={priorityCategories}
            compactCategories={compactCategories}
            addButtonInFirstRow={addButtonInFirstRow && !hasSearchQuery}
            addButtonInCompactRows={addButtonInCompactRows && !hasSearchQuery}
            onAddNewCategory={onCategoryAdded || (() => {})}
            onExpandedChange={handleExpandedChange}
          />
        ) : (
          <EmailCategoryListContent
            ref={listContentRef}
            categories={filteredCategories}
            onAddNewCategory={onCategoryAdded || (() => {})}
            showAddButton={!hasSearchQuery}
          />
        )}
      </div>

      {showPagination && totalPages > 1 && !hasSearchQuery && (
        <EmailCategoryGridPagination 
          activePage={activePage}
          totalPages={totalPages}
          showPagination={true}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default EmailCategoryGrid;
