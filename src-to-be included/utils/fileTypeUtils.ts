
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File
} from 'lucide-react';

export const getFileTypeInfo = (type: string) => {
  if (type.startsWith('image/')) {
    return {
      icon: Image,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      badgeColor: 'bg-purple-400 hover:bg-purple-500',
      statusBadgeColor: 'bg-purple-400 text-white font-normal text-xs'
    };
  }
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
    return {
      icon: FileText,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-400 hover:bg-blue-500',
      statusBadgeColor: 'bg-blue-400 text-white font-normal text-xs'
    };
  }
  if (type.includes('sheet') || type.includes('csv') || type.includes('excel')) {
    return {
      icon: FileSpreadsheet,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-400 hover:bg-green-500',
      statusBadgeColor: 'bg-green-400 text-white font-normal text-xs'
    };
  }
  return {
    icon: File,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    badgeColor: 'bg-orange-400 hover:bg-orange-500',
    statusBadgeColor: 'bg-orange-400 text-white font-normal text-xs'
  };
};

export const getStatusBadgeColor = (direction: string, fileTypeColor: string) => {
  if (direction === 'sent') {
    return 'bg-orange-500 text-white';
  }
  if (direction === 'received') {
    return 'bg-green-500 text-white';
  }
  return fileTypeColor;
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
