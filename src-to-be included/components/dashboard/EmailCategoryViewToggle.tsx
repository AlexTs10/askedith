
import React from 'react';

interface EmailCategoryViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onToggleAll?: () => void;
  allExpanded?: boolean;
  showAccordionControls?: boolean;
}

const EmailCategoryViewToggle: React.FC<EmailCategoryViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  onToggleAll,
  allExpanded = false,
  showAccordionControls = false
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* View Toggle */}
      <div className="inline-flex items-center gap-2 text-base text-gray-600 bg-purple-50 rounded-lg px-4 py-2">
        <span className="text-gray-700 font-medium">View as:</span>
        <span 
          className={`px-2 py-1 rounded cursor-pointer transition-colors ${
            viewMode === 'grid' 
              ? 'bg-white text-gray-800 shadow-sm' 
              : 'hover:bg-purple-100'
          }`}
          onClick={() => onViewModeChange('grid')}
        >
          Grid
        </span>
        <span className="text-gray-400">|</span>
        <span 
          className={`px-2 py-1 rounded cursor-pointer transition-colors ${
            viewMode === 'list' 
              ? 'bg-white text-gray-800 shadow-sm' 
              : 'hover:bg-purple-100'
          }`}
          onClick={() => onViewModeChange('list')}
        >
          List
        </span>
        
        {/* Dynamic Toggle All Button - now properly relative to current page */}
        {showAccordionControls && onToggleAll && (
          <>
            <span className="text-gray-400">|</span>
            <button
              onClick={onToggleAll}
              className="px-2 py-1 rounded cursor-pointer transition-colors hover:bg-purple-100 text-sm"
            >
              {allExpanded ? 'Close All' : 'Open All'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailCategoryViewToggle;
