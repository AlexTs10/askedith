import React, { useState } from 'react';
import { EmailCategory } from '@/hooks/useEmailCategoryData';

export const useCategoryDragDrop = (emailCategories: EmailCategory[]) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderedCategories, setOrderedCategories] = useState(emailCategories);

  // Update ordered categories when prop changes
  React.useEffect(() => {
    setOrderedCategories(emailCategories);
  }, [emailCategories]);

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedItem(categoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', categoryId);
    
    // Set drag image to be slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over index if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain') || draggedItem;
    
    if (!draggedId) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newCategories = [...orderedCategories];
    const draggedIndex = newCategories.findIndex(cat => cat.id === draggedId);

    if (draggedIndex !== -1 && targetIndex !== draggedIndex) {
      const [draggedCategory] = newCategories.splice(draggedIndex, 1);
      newCategories.splice(targetIndex, 0, draggedCategory);
      setOrderedCategories(newCategories);
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return {
    draggedItem,
    dragOverIndex,
    orderedCategories,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
};
