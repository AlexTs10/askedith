
import React from 'react';
import { SidebarMenu } from '../ui/sidebar';
import FolderItem from './FolderItem';
import { getDocumentsInFolder } from '../../utils/folderUtils';
import { useFolderDragDrop } from '../../hooks/useFolderDragDrop';

interface DefaultFolder {
  id: string;
  name: string;
  parentId: null;
  createdAt: string;
  color: string;
}

interface DefaultFoldersListProps {
  defaultFolders: DefaultFolder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  orderedFolders: DefaultFolder[];
  setOrderedFolders: (folders: DefaultFolder[]) => void;
}

const DefaultFoldersList: React.FC<DefaultFoldersListProps> = ({
  defaultFolders,
  selectedFolderId,
  onFolderSelect,
  orderedFolders,
  setOrderedFolders
}) => {
  const {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useFolderDragDrop();

  const getDocumentCount = (folderId: string): number => {
    return getDocumentsInFolder(folderId).length;
  };

  return (
    <SidebarMenu className="space-y-1">
      {orderedFolders.map((folder, index) => {
        const isDragging = draggedItem === folder.id;
        const isDropTarget = dragOverIndex === index;
        
        return (
          <div key={folder.id} className="relative">
            {/* Drop indicator line above */}
            {isDropTarget && draggedItem !== folder.id && (
              <div className="absolute -top-1 left-3 right-3 h-0.5 bg-purple-500 rounded-full z-10" />
            )}
            
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, folder.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index, orderedFolders, setOrderedFolders)}
              onDragEnd={handleDragEnd}
              className={`cursor-move transition-all duration-200 ${
                isDragging ? 'scale-95 rotate-1 shadow-lg z-20' : ''
              } ${isDropTarget && !isDragging ? 'transform translate-y-1' : ''}`}
            >
              <FolderItem
                folder={folder}
                isActive={selectedFolderId === folder.id}
                isExpanded={false}
                documentCount={folder.id === 'all' ? 0 : getDocumentCount(folder.id)}
                onSelect={() => onFolderSelect(folder.id === 'all' ? null : folder.id)}
                onToggleExpand={() => {}}
                level={0}
              />
            </div>
            
            {/* Add extra space every 3 items with increased spacing */}
            {(index + 1) % 3 === 0 && index < orderedFolders.length - 1 && (
              <div className="h-8" />
            )}
          </div>
        );
      })}
    </SidebarMenu>
  );
};

export default DefaultFoldersList;
