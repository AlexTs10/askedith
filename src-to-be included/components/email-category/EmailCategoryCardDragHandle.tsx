
import React from 'react';
import { GripVertical } from 'lucide-react';

const EmailCategoryCardDragHandle: React.FC = () => {
  return (
    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing z-10">
      <GripVertical className="w-4 h-4 text-gray-400" />
    </div>
  );
};

export default EmailCategoryCardDragHandle;
