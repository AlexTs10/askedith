
import React from 'react';
import { Search, FileText, FolderOpen, FileSpreadsheet, Image, Users, Calendar } from 'lucide-react';
import { Button } from '../ui/button';

interface DocumentHubSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilter: 'all' | 'documents' | 'images' | 'spreadsheets' | 'organization' | 'date';
  onFilterChange: (filter: 'all' | 'documents' | 'images' | 'spreadsheets' | 'organization' | 'date') => void;
  directionFilter: 'all' | 'received' | 'sent';
  onDirectionFilterChange: (direction: 'all' | 'received' | 'sent') => void;
}

const DocumentHubSearchFilters: React.FC<DocumentHubSearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  directionFilter,
  onDirectionFilterChange,
}) => {
  const filterOptions = [
    { key: 'all', label: 'All Files', icon: FolderOpen },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'images', label: 'Images', icon: Image },
    { key: 'spreadsheets', label: 'Spreadsheets', icon: FileSpreadsheet },
    { key: 'organization', label: 'Organization', icon: Users },
    { key: 'date', label: 'Date', icon: Calendar }
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
        {/* Search Bar - Left Side */}
        <div className="relative w-full lg:min-w-[400px] lg:max-w-[400px] lg:flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search documents, senders, or organizations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 pl-10 pr-4 text-base bg-white/80 border border-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 rounded-xl outline-none transition-all duration-200"
          />
        </div>
        
        {/* Filter Grid - Right Side */}
        <div className="grid grid-cols-3 gap-2 ml-auto">
          {filterOptions.slice(0, 6).map((filter) => {
            const IconComponent = filter.icon;
            return (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? "default" : "outline"}
                size="default"
                onClick={() => onFilterChange(filter.key as any)}
                className={`
                  px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${selectedFilter === filter.key 
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25" 
                    : "bg-white/80 hover:bg-white text-gray-700 border-gray-300/60 hover:border-purple-300"
                  }
                `}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Direction Filter Row */}
      <div className="flex justify-center mt-4 pt-4 border-t border-gray-200/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 mr-2">Direction:</span>
          <button
            onClick={() => onDirectionFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              directionFilter === 'all' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onDirectionFilterChange('received')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              directionFilter === 'received' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => onDirectionFilterChange('sent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              directionFilter === 'sent' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Sent
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentHubSearchFilters;
