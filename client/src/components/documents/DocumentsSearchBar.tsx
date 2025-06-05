
import React from 'react';
import { Search } from 'lucide-react';

interface DocumentsSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const DocumentsSearchBar = ({ searchQuery, onSearchChange }: DocumentsSearchBarProps) => {
  return (
    <div className="max-w-xs sm:max-w-md mx-auto mb-12 sm:mb-16">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-14 pl-12 pr-4 text-base bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default DocumentsSearchBar;
