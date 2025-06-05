
import React from 'react';
import EmailCategoryGridPagination from './EmailCategoryGridPagination';
import EmailCategoryViewToggle from './EmailCategoryViewToggle';

interface EmailCategoryGridHeaderProps {
  activePage: number;
  totalPages: number;
  showPagination: boolean;
  onPageChange: (page: number) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCollapseAll?: () => void;
  onToggleAll?: () => void;
  allExpanded?: boolean;
}

const EmailCategoryGridHeader: React.FC<EmailCategoryGridHeaderProps> = ({
  activePage,
  totalPages,
  showPagination,
  onPageChange,
  viewMode,
  onViewModeChange,
  onCollapseAll,
  onToggleAll,
  allExpanded = false
}) => {
  return (
    <div className="text-center space-y-4 mb-8">
      <div className="flex items-center justify-center gap-4">
        <EmailCategoryViewToggle 
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onToggleAll={viewMode === 'grid' ? onToggleAll : undefined}
          allExpanded={allExpanded}
          showAccordionControls={viewMode === 'grid'}
        />
        
        {viewMode === 'list' && onCollapseAll && (
          <button
            onClick={onCollapseAll}
            className="px-3 py-2 text-sm text-gray-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        )}
      </div>
      
      <EmailCategoryGridPagination
        activePage={activePage}
        totalPages={totalPages}
        showPagination={showPagination}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default EmailCategoryGridHeader;
