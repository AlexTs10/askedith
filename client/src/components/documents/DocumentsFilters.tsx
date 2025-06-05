
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

interface DocumentsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilter: 'all' | 'documents' | 'images' | 'spreadsheets';
  onFilterChange: (filter: 'all' | 'documents' | 'images' | 'spreadsheets') => void;
}

const DocumentsFilters = ({ searchQuery, onSearchChange, selectedFilter, onFilterChange }: DocumentsFiltersProps) => {
  const filters = [
    { key: 'all', label: 'All Files' },
    { key: 'documents', label: 'Documents' },
    { key: 'images', label: 'Images' },
    { key: 'spreadsheets', label: 'Spreadsheets' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search files, senders, or organizations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        {filters.map(filter => (
          <Button
            key={filter.key}
            variant={selectedFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.key as any)}
            className={selectedFilter === filter.key ? 'bg-purple-500 hover:bg-purple-600 text-white' : ''}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DocumentsFilters;
