
import React from 'react';
import { getFileTypeInfo } from '../../utils/fileTypeUtils';

interface FileIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

const FileIcon = ({ type, size = 'md' }: FileIconProps) => {
  const fileInfo = getFileTypeInfo(type);
  const FileIconComponent = fileInfo.icon;
  
  const sizeClasses = {
    sm: { container: 'w-8 h-8', icon: 'h-4 w-4' },
    md: { container: 'w-12 h-12', icon: 'h-6 w-6' },
    lg: { container: 'w-16 h-16', icon: 'h-8 w-8' }
  };
  
  const { container, icon } = sizeClasses[size];

  return (
    <div className={`${container} rounded-xl ${fileInfo.bgColor} flex items-center justify-center shadow-sm`}>
      <FileIconComponent className={`${icon} ${fileInfo.textColor}`} />
    </div>
  );
};

export default FileIcon;
