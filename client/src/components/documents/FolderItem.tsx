
import React from 'react';
import { Badge } from '../ui/badge';
import { SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar';
import { DocumentFolder } from '../../utils/folderUtils';
import { Folder, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

interface FolderItemProps {
  folder: DocumentFolder;
  isActive: boolean;
  isExpanded: boolean;
  documentCount: number;
  onSelect: (folderId: string) => void;
  onToggleExpand: (folderId: string) => void;
  onDelete?: (folderId: string) => void;
  level: number;
  showDeleteButton?: boolean;
}

const FolderItem: React.FC<FolderItemProps> = ({ 
  folder, 
  isActive, 
  isExpanded,
  documentCount,
  onSelect, 
  onToggleExpand,
  onDelete,
  level,
  showDeleteButton = false
}) => {
  const handleClick = () => {
    onSelect(folder.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(folder.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(folder.id);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        isActive={isActive}
        onClick={handleClick}
        className="relative group"
        style={{ paddingLeft: `${0.5 + level * 1}rem` }}
      >
        <div className="flex items-center w-full">
          {level > 0 && (
            <button
              onClick={handleToggleExpand}
              className="mr-1 hover:bg-gray-100 rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          
          <div className={`w-5 h-5 rounded-md bg-gradient-to-r ${folder.color} flex items-center justify-center mr-2`}>
            <Folder className="w-3 h-3 text-white" />
          </div>
          
          <span className="flex-1 truncate">{folder.name}</span>
          
          {documentCount > 0 && (
            <Badge 
              variant="circle"
              className={`ml-2 bg-gradient-to-r ${folder.color}`}
            >
              {documentCount}
            </Badge>
          )}

          {showDeleteButton && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded p-1 transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the folder "{folder.name}"? 
                    {documentCount > 0 && ` This folder contains ${documentCount} document${documentCount === 1 ? '' : 's'}.`}
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default FolderItem;
