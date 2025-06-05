
import React from 'react';
import { Trash2 } from 'lucide-react';
import { SidebarMenu } from '@/components/ui/sidebar';
import { EmailCategory } from '@/hooks/useEmailCategoryData';
import EmailCategoryItem from '../EmailCategoryItem';
import { useToast } from '@/hooks/use-toast';
import { useCategoryDeleteHandler } from './CategoryDeleteHandler';

interface DraggableCategoryListProps {
  orderedCategories: EmailCategory[];
  category: string | undefined;
  activeTab: string;
  draggedItem: string | null;
  dragOverIndex: number | null;
  onCategoryAdded?: () => void;
  onDragStart: (e: React.DragEvent, categoryId: string) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const DraggableCategoryList: React.FC<DraggableCategoryListProps> = ({
  orderedCategories,
  category,
  activeTab,
  draggedItem,
  dragOverIndex,
  onCategoryAdded,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  const { toast } = useToast();
  const { handleDeleteCategory, isCustomEmptyCategory } = useCategoryDeleteHandler(
    orderedCategories,
    onCategoryAdded
  );

  return (
    <SidebarMenu className="space-y-1">
      {orderedCategories.map((cat, index) => {
        const isDragging = draggedItem === cat.id;
        const isDropTarget = dragOverIndex === index;
        const canDelete = isCustomEmptyCategory(cat.id);
        
        console.log('Rendering category:', {
          id: cat.id,
          title: cat.title,
          total: cat.total,
          canDelete
        });
        
        return (
          <div key={cat.id} className="relative">
            {/* Drop indicator line above */}
            {isDropTarget && draggedItem !== cat.id && (
              <div className="absolute -top-1 left-3 right-3 h-0.5 bg-purple-500 rounded-full z-10" />
            )}
            
            <div
              draggable
              onDragStart={(e) => onDragStart(e, cat.id)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnter={(e) => onDragEnter(e, index)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, index)}
              onDragEnd={onDragEnd}
              className={`cursor-move transition-all duration-200 group relative ${
                isDragging ? 'scale-95 rotate-1 shadow-lg z-20' : ''
              } ${isDropTarget && !isDragging ? 'transform translate-y-1' : ''}`}
            >
              <EmailCategoryItem 
                category={cat} 
                activeCategory={category} 
                activeTab={activeTab} 
              />
              
              {/* Delete button for custom empty categories */}
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Delete button clicked for category:', cat.id);
                    handleDeleteCategory(cat.id, toast);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded z-30"
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>
            
            {/* Add extra space every 3 items with increased spacing */}
            {(index + 1) % 3 === 0 && index < orderedCategories.length - 1 && (
              <div className="h-8" />
            )}
          </div>
        );
      })}
    </SidebarMenu>
  );
};

export default DraggableCategoryList;
