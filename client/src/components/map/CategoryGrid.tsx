
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import CategoryIcon from './CategoryIcon';

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface CategoryGridProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle
}) => {
  // Organized category groups for vertical layout (3 categories per column)
  const categoryGroups = [
    ['elder-law-attorneys', 'professionals', 'paying-for-care'],
    ['home-care', 'physical-therapy', 'senior-living'],
    ['government-va', 'hospitals', 'pharmacies']
  ];

  // Get category by ID
  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);

  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked:', categoryId);
    onCategoryToggle(categoryId);
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {categoryGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          {group.map((categoryId) => {
            const category = getCategoryById(categoryId);
            if (!category) return null;
            
            return (
              <div
                key={category.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => onCategoryToggle(category.id)}
                  className="flex-shrink-0 border-gray-300 data-[state=checked]:bg-white data-[state=checked]:border-gray-400 data-[state=checked]:text-gray-700"
                  onClick={(e) => e.stopPropagation()}
                />
                <CategoryIcon categoryId={category.id} />
                <span className="text-sm text-gray-700 flex-1">{category.name}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
