
import React, { useRef } from 'react';
import { EmailCategory } from '../../hooks/useEmailCategoryData';
import EmailCategoryCard from '../EmailCategoryCard';

interface DraggableCategoryCardProps {
  category: EmailCategory;
  index: number;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  isExpanded: boolean;
  onToggle: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, categoryId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const DraggableCategoryCard: React.FC<DraggableCategoryCardProps> = ({
  category,
  index,
  onReorder,
  isExpanded,
  onToggle,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref}>
      <EmailCategoryCard 
        category={category} 
        isExpanded={isExpanded}
        onToggle={onToggle}
        isDragging={isDragging}
        isDragOver={isDragOver}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    </div>
  );
};

export default DraggableCategoryCard;
