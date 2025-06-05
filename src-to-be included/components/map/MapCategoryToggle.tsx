
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Category {
  id: string;
  name: string;
  color: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All Categories', color: '#3B82F6' },
  { id: 'elder-law-attorneys', name: 'Elder Law Attorneys', color: '#8B5CF6' },
  { id: 'home-care', name: 'Home Care', color: '#10B981' },
  { id: 'government-va', name: 'Government & VA', color: '#F59E0B' },
  { id: 'professionals', name: 'Other Professionals', color: '#EF4444' },
  { id: 'physical-therapy', name: 'Physical Therapy', color: '#06B6D4' },
  { id: 'hospitals', name: 'Hospitals', color: '#84CC16' },
  { id: 'paying-for-care', name: 'Paying for Care', color: '#F97316' },
  { id: 'senior-living', name: 'Senior Living', color: '#EC4899' },
  { id: 'pharmacies', name: 'Pharmacies', color: '#6366F1' }
];

interface MapCategoryToggleProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const MapCategoryToggle: React.FC<MapCategoryToggleProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory) || categories[0];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-64 border-none shadow-none">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: selectedCategoryData.color }}
            />
            <SelectValue />
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg">
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MapCategoryToggle;
