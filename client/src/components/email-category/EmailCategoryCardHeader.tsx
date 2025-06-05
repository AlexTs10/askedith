
import React from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface EmailCategoryCardHeaderProps {
  title: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  isExpanded: boolean;
  totalNeedingAttention: number;
  onHeaderClick: (e: React.MouseEvent) => void;
  onHeaderHover: () => void;
  onHeaderLeave: () => void;
}

const EmailCategoryCardHeader: React.FC<EmailCategoryCardHeaderProps> = ({
  title,
  icon: Icon,
  bgColor,
  textColor,
  isExpanded,
  totalNeedingAttention,
  onHeaderClick,
  onHeaderHover,
  onHeaderLeave
}) => {
  return (
    <div 
      className={`flex items-center justify-center ${isExpanded ? 'mb-4 sm:mb-5' : ''} ${
        isExpanded ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'
      } p-2 rounded-lg transition-colors cursor-pointer relative`}
      onClick={onHeaderClick}
      onMouseEnter={onHeaderHover}
      onMouseLeave={onHeaderLeave}
    >
      {/* Toggle Arrow - positioned in top right */}
      <div className="absolute top-1 right-1">
        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : 'rotate-0'
        }`} strokeWidth={3} />
      </div>
      
      <div className="flex items-center flex-col text-center">
        <div className={`${isExpanded ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12'} ${bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-2`}>
          <Icon className={`${isExpanded ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'} ${textColor} group-hover:animate-pulse`} />
        </div>
        
        {/* Title always centered below icon with parenthetical count */}
        <div className="flex items-center">
          <h3 className={`${isExpanded ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} font-medium text-gray-800 group-hover:text-gray-900 transition-colors`}>
            {title}
            {!isExpanded && totalNeedingAttention > 0 && (
              <span className="text-gray-500 font-normal"> ({totalNeedingAttention})</span>
            )}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default EmailCategoryCardHeader;
