
import React from 'react';
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File
} from 'lucide-react';

interface FileIconDisplayProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
}

export const getFileTypeInfo = (type: string) => {
  if (type.startsWith('image/')) {
    return {
      icon: Image,
      badge: 'JPG',
      bgColor: 'bg-purple-400',
      textColor: 'text-white'
    };
  }
  if (type.includes('pdf')) {
    return {
      icon: FileText,
      badge: 'PDF',
      bgColor: 'bg-red-400',
      textColor: 'text-white'
    };
  }
  if (type.includes('sheet') || type.includes('csv') || type.includes('excel')) {
    return {
      icon: FileSpreadsheet,
      badge: 'XLS',
      bgColor: 'bg-green-400',
      textColor: 'text-white'
    };
  }
  if (type.includes('document') || type.includes('text') || type.includes('word')) {
    return {
      icon: FileText,
      badge: 'DOC',
      bgColor: 'bg-blue-400',
      textColor: 'text-white'
    };
  }
  return {
    icon: File,
    badge: 'FILE',
    bgColor: 'bg-gray-400',
    textColor: 'text-white'
  };
};

const FileIconDisplay = ({ type, size = 'medium' }: FileIconDisplayProps) => {
  const fileInfo = getFileTypeInfo(type);
  const FileIcon = fileInfo.icon;

  const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-16 h-20',
    large: 'w-20 h-24'
  };

  const iconSizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-10 w-10'
  };

  const badgeSizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-2 py-1',
    large: 'text-base px-2.5 py-1'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* File Icon Background */}
      <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg shadow-sm flex items-center justify-center relative overflow-hidden">
        {/* File Icon */}
        <FileIcon className={`${iconSizeClasses[size]} text-gray-400`} />
        
        {/* File Type Badge */}
        <div className={`absolute bottom-0 left-0 right-0 ${fileInfo.bgColor} ${fileInfo.textColor} ${badgeSizeClasses[size]} font-bold text-center`}>
          {fileInfo.badge}
        </div>
      </div>
    </div>
  );
};

export default FileIconDisplay;
