import { useState, useEffect } from 'react';
import { EmailCategory } from './useEmailCategoryData';

const CATEGORY_ORDER_KEY = 'email-category-order';

export const usePersistentCategoryOrder = (categories: EmailCategory[]) => {
  const [orderedCategories, setOrderedCategories] = useState<EmailCategory[]>(categories);

  // Load saved order on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem(CATEGORY_ORDER_KEY);
    if (savedOrder) {
      try {
        const orderArray: string[] = JSON.parse(savedOrder);
        // Reorder categories based on saved order, keeping any new categories at the end
        const orderedList = [...categories].sort((a, b) => {
          const indexA = orderArray.indexOf(a.id);
          const indexB = orderArray.indexOf(b.id);
          
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          
          return indexA - indexB;
        });
        setOrderedCategories(orderedList);
      } catch (error) {
        console.error('Error loading category order:', error);
        setOrderedCategories(categories);
      }
    } else {
      setOrderedCategories(categories);
    }
  }, [categories]);

  // Save order to localStorage
  const saveOrder = (newOrder: EmailCategory[]) => {
    const orderArray = newOrder.map(cat => cat.id);
    localStorage.setItem(CATEGORY_ORDER_KEY, JSON.stringify(orderArray));
    setOrderedCategories(newOrder);
  };

  // Handle drag and drop reordering
  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...orderedCategories];
    const draggedItem = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, draggedItem);
    saveOrder(newOrder);
  };

  return {
    orderedCategories,
    handleReorder
  };
};
