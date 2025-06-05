
import React from 'react';
import { Plus } from 'lucide-react';

interface AddNewCategoryButtonProps {
  onClick: () => void;
  categoriesInRow: number;
}

const AddNewCategoryButton: React.FC<AddNewCategoryButtonProps> = ({ 
  onClick, 
  categoriesInRow 
}) => {
  return (
    <div className="space-y-0">
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-purple-400 hover:shadow-md transition-all duration-300">
        <div 
          className="flex items-center justify-between p-4 sm:p-6 hover:bg-purple-50 transition-colors cursor-pointer group"
          onClick={onClick}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 group-hover:bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 transition-colors">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-600 group-hover:text-purple-700 transition-colors">
              Add New Category
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-400 group-hover:text-purple-600 transition-colors">
              Click to create
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewCategoryButton;
