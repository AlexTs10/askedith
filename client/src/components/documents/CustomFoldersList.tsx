
import React, { useState } from 'react';
import { SidebarMenu } from '../ui/sidebar';
import FolderItem from './FolderItem';
import { DocumentFolder, getFoldersByParent, getDocumentsInFolder, deleteFolder } from '../../utils/folderUtils';

interface CustomFoldersListProps {
  rootFolders: DocumentFolder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderDeleted?: () => void;
}

const CustomFoldersList: React.FC<CustomFoldersListProps> = ({
  rootFolders,
  selectedFolderId,
  onFolderSelect,
  onFolderDeleted
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getDocumentCount = (folderId: string): number => {
    return getDocumentsInFolder(folderId).length;
  };

  const handleDeleteFolder = (folderId: string) => {
    console.log('CustomFoldersList handleDeleteFolder called with:', folderId);
    
    // If the deleted folder is currently selected, deselect it
    if (selectedFolderId === folderId) {
      onFolderSelect(null);
    }
    
    deleteFolder(folderId);
    
    // Notify parent component that a folder was deleted
    if (onFolderDeleted) {
      onFolderDeleted();
    }
  };

  const renderFolderTree = (folders: DocumentFolder[], level: number = 0): React.ReactNode[] => {
    return folders.map(folder => {
      const childFolders = getFoldersByParent(folder.id);
      const hasChildren = childFolders.length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      const documentCount = getDocumentCount(folder.id);

      return (
        <React.Fragment key={folder.id}>
          <FolderItem
            folder={folder}
            isActive={selectedFolderId === folder.id}
            isExpanded={isExpanded}
            documentCount={documentCount}
            onSelect={onFolderSelect}
            onToggleExpand={toggleExpanded}
            onDelete={handleDeleteFolder}
            showDeleteButton={true}
            level={level}
          />
          {hasChildren && isExpanded && renderFolderTree(childFolders, level + 1)}
        </React.Fragment>
      );
    });
  };

  if (rootFolders.length === 0) {
    return null;
  }

  return (
    <SidebarMenu className="space-y-1">
      {renderFolderTree(rootFolders)}
    </SidebarMenu>
  );
};

export default CustomFoldersList;
