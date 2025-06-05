import React, { forwardRef, useImperativeHandle, useState, useCallback, useMemo, useEffect } from 'react';
import { EmailCategory } from '../../hooks/useEmailCategoryData';
import { usePersistentCategoryOrder } from '../../hooks/usePersistentCategoryOrder';
import AccordionCategoryRow from './AccordionCategoryRow';

interface EmailCategoryGridContentProps {
  priorityCategories: EmailCategory[];
  compactCategories: EmailCategory[];
  addButtonInFirstRow: boolean;
  addButtonInCompactRows: boolean;
  onAddNewCategory: () => void;
  onExpandedChange?: (allExpanded: boolean) => void;
}

export interface EmailCategoryGridContentRef {
  openAll: () => void;
  closeAll: () => void;
  toggleAll: () => void;
  allExpanded: boolean;
}

const EmailCategoryGridContent = forwardRef<EmailCategoryGridContentRef, EmailCategoryGridContentProps>(({
  priorityCategories,
  compactCategories,
  addButtonInFirstRow,
  addButtonInCompactRows,
  onAddNewCategory,
  onExpandedChange
}, ref) => {
  const allCategories = [...priorityCategories, ...compactCategories];
  const { orderedCategories, handleReorder } = usePersistentCategoryOrder(allCategories);
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // State to track which cards are expanded - first 3 categories (first row) default to open
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => {
    const firstThreeCategories = orderedCategories.slice(0, 3);
    return new Set(firstThreeCategories.map(cat => cat.id));
  });

  // Check if all CURRENTLY DISPLAYED cards are expanded (relative to what's on this page)
  const allExpanded = useMemo(() => {
    if (orderedCategories.length === 0) return false;
    // Only check against categories that are actually displayed on this page
    return orderedCategories.every(cat => expandedCards.has(cat.id));
  }, [expandedCards, orderedCategories]);

  // Notify parent whenever allExpanded state changes
  useEffect(() => {
    onExpandedChange?.(allExpanded);
  }, [allExpanded, onExpandedChange]);

  // Functions to control accordion for ONLY the categories displayed on this page
  const openAll = useCallback(() => {
    // Only expand the categories currently displayed on this page
    setExpandedCards(new Set(orderedCategories.map(cat => cat.id)));
  }, [orderedCategories]);

  const closeAll = useCallback(() => {
    // Only close the categories currently displayed on this page
    const currentPageCategoryIds = new Set(orderedCategories.map(cat => cat.id));
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      // Remove only the categories that are on the current page
      currentPageCategoryIds.forEach(id => newSet.delete(id));
      return newSet;
    });
  }, [orderedCategories]);

  const toggleAll = useCallback(() => {
    if (allExpanded) {
      closeAll();
    } else {
      openAll();
    }
  }, [allExpanded, openAll, closeAll]);

  // Function to toggle individual card
  const toggleCard = useCallback((categoryId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, categoryId: string) => {
    setDraggedItem(categoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', categoryId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  }, [draggedItem, dragOverIndex]);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem) {
      setDragOverIndex(index);
    }
  }, [draggedItem]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drag over index if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain') || draggedItem;
    
    if (!draggedId) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const draggedIndex = orderedCategories.findIndex(cat => cat.id === draggedId);

    if (draggedIndex !== -1 && targetIndex !== draggedIndex) {
      handleReorder(draggedIndex, targetIndex);
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  }, [draggedItem, orderedCategories, handleReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  // Calculate rows dynamically based on ordered categories
  const categoriesPerRow = 3;
  
  // Expose accordion controls to parent
  useImperativeHandle(ref, () => ({
    openAll,
    closeAll,
    toggleAll,
    allExpanded
  }), [openAll, closeAll, toggleAll, allExpanded]);

  // Create rows from ordered categories with drag and drop support
  const rows = [];
  for (let i = 0; i < orderedCategories.length; i += categoriesPerRow) {
    const rowCategories = orderedCategories.slice(i, i + categoriesPerRow);
    const rowIndex = Math.floor(i / categoriesPerRow);
    const isFirstRow = rowIndex === 0;
    
    rows.push({
      categories: rowCategories,
      startIndex: i,
      showAddButton: (isFirstRow && addButtonInFirstRow) || (!isFirstRow && addButtonInCompactRows && i + categoriesPerRow >= orderedCategories.length)
    });
  }

  return (
    <div className="space-y-8">
      {rows.map((row, rowIndex) => (
        <AccordionCategoryRow
          key={`row-${rowIndex}`}
          title=""
          categories={row.categories}
          isOpen={true}
          onToggle={() => {}}
          showAddButton={row.showAddButton}
          onAddNewCategory={onAddNewCategory}
          onReorder={handleReorder}
          startIndex={row.startIndex}
          hideHeader={true}
          expandedCards={expandedCards}
          onToggleCard={toggleCard}
          draggedItem={draggedItem}
          dragOverIndex={dragOverIndex}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
});

EmailCategoryGridContent.displayName = 'EmailCategoryGridContent';

export default EmailCategoryGridContent;
