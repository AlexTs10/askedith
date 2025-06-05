
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import EmailCategoryListItem from './EmailCategoryListItem';
import { EmailCategory } from '../../hooks/useEmailCategoryData';

interface EmailCategoryListContentProps {
  categories: EmailCategory[];
  onAddNewCategory: () => void;
  showAddButton: boolean;
}

export interface EmailCategoryListContentRef {
  collapseAll: () => void;
}

const EmailCategoryListContent = forwardRef<EmailCategoryListContentRef, EmailCategoryListContentProps>(({
  categories,
  onAddNewCategory,
  showAddButton
}, ref) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  useImperativeHandle(ref, () => ({
    collapseAll
  }));

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <EmailCategoryListItem
          key={category.id}
          category={category}
          isExpanded={expandedCategories.has(category.id)}
          onToggle={() => toggleCategory(category.id)}
        />
      ))}
      
      {showAddButton && (
        <div className="flex justify-center">
          <div className="w-1/2">
            <button
              onClick={onAddNewCategory}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-600"
            >
              + Add New Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

EmailCategoryListContent.displayName = 'EmailCategoryListContent';

export default EmailCategoryListContent;
