
import React from 'react';
import { Button } from '../ui/button';
import { FileText, FolderOpen, FileSpreadsheet, Image, User, Users, Calendar } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  icon: any;
}

interface DocumentsFilterButtonsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  getFilterCount: (filterType: string) => number;
}

const DocumentsFilterButtons = ({ selectedFilter, onFilterChange, getFilterCount }: DocumentsFilterButtonsProps) => {
  const filterOptions: FilterOption[] = [
    { key: 'all', label: 'All Files', icon: FolderOpen },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'images', label: 'Images', icon: Image },
    { key: 'spreadsheets', label: 'Spreadsheets', icon: FileSpreadsheet },
    { key: 'person', label: 'Person', icon: User },
    { key: 'organization', label: 'Organization', icon: Users },
    { key: 'date', label: 'Month', icon: Calendar }
  ];

  return (
    <div className="mb-12 sm:mb-16">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-lg p-2 shadow-sm">
          <div className="flex items-center">
            {filterOptions.map((filter, index) => {
              const IconComponent = filter.icon;
              const count = getFilterCount(filter.key);
              const isSelected = selectedFilter === filter.key;
              const isLast = index === filterOptions.length - 1;
              
              return (
                <React.Fragment key={filter.key}>
                  <button
                    onClick={() => onFilterChange(filter.key)}
                    className={`
                      flex-1 px-3 py-3 rounded-md font-medium transition-all duration-200 flex flex-col items-center h-16
                      ${isSelected 
                        ? "bg-purple-500 hover:bg-purple-600 text-white shadow-md" 
                        : "text-gray-700 hover:bg-gray-50 hover:shadow-md hover:shadow-purple-200/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-1">
                      <IconComponent className="h-4 w-4" />
                      <span className="text-xs">{filter.label}</span>
                    </div>
                    <span className="text-xs font-bold mt-1">{count}</span>
                  </button>
                  {!isLast && (
                    <div className="w-px h-12 bg-gray-300/80 mx-1"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsFilterButtons;
