
import React from 'react';
import { Plus } from 'lucide-react';
import { EmailCategory } from '../../hooks/useEmailCategoryData';
import DraggableCategoryCard from './DraggableCategoryCard';
import AddNewCategoryButton from './AddNewCategoryButton';

interface AccordionCategoryRowProps {
  title: string;
  categories: EmailCategory[];
  isOpen: boolean;
  onToggle: () => void;
  showAddButton?: boolean;
  onAddNewCategory?: () => void;
  onReorder?: (dragIndex: number, hoverIndex: number) => void;
  startIndex?: number;
  hideHeader?: boolean;
  expandedCards?: Set<string>;
  onToggleCard?: (categoryId: string) => void;
  draggedItem?: string | null;
  dragOverIndex?: number | null;
  onDragStart?: (e: React.DragEvent, categoryId: string) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnter?: (e: React.DragEvent, index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetIndex: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const AccordionCategoryRow: React.FC<AccordionCategoryRowProps> = ({
  title,
  categories,
  isOpen,
  onToggle,
  showAddButton = false,
  onAddNewCategory,
  onReorder,
  startIndex = 0,
  hideHeader = false,
  expandedCards = new Set(),
  onToggleCard,
  draggedItem,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <div className="text-gray-500">
            {isOpen ? '−' : '+'}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const globalIndex = startIndex + index;
            const isDragging = draggedItem === category.id;
            const isDragOver = dragOverIndex === globalIndex && !isDragging;
            
            return (
              <div
                key={category.id}
                onDragOver={(e) => onDragOver?.(e, globalIndex)}
                onDragEnter={(e) => onDragEnter?.(e, globalIndex)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop?.(e, globalIndex)}
                className="relative"
              >
                {/* Drop indicator */}
                {isDragOver && (
                  <div className="absolute -inset-2 border-2 border-dashed border-purple-400 rounded-2xl bg-purple-50 opacity-50 pointer-events-none z-10" />
                )}
                
                <DraggableCategoryCard
                  category={category}
                  index={globalIndex}
                  onReorder={onReorder || (() => {})}
                  isExpanded={expandedCards.has(category.id)}
                  onToggle={() => onToggleCard?.(category.id)}
                  isDragging={isDragging}
                  isDragOver={isDragOver}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              </div>
            );
          })}
          
          {showAddButton && (
            <AddNewCategoryButton 
              onClick={onAddNewCategory} 
              categoriesInRow={categories.length}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AccordionCategoryRow;
