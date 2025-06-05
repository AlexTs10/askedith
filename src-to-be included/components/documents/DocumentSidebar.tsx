
import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
} from '../ui/sidebar';
import { getAllFolders, getFoldersByParent } from '../../utils/folderUtils';
import CreateFolderButton from './CreateFolderButton';
import DefaultFoldersList from './DefaultFoldersList';
import CustomFoldersList from './CustomFoldersList';

interface DocumentSidebarProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
}

const DocumentSidebar: React.FC<DocumentSidebarProps> = ({ 
  selectedFolderId, 
  onFolderSelect,
  onCreateFolder
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh of folder data
  const allFolders = getAllFolders();
  const rootFolders = getFoldersByParent(null);

  console.log('DocumentSidebar render - allFolders:', allFolders);
  console.log('DocumentSidebar render - rootFolders:', rootFolders);

  // Default folders with their configurations
  const defaultFolders = [
    {
      id: 'all',
      name: 'All Files',
      parentId: null,
      createdAt: '',
      color: 'from-purple-400 to-purple-500'
    },
    {
      id: 'insurance',
      name: 'Insurance',
      parentId: null,
      createdAt: '',
      color: 'from-blue-400 to-blue-500'
    },
    {
      id: 'medical',
      name: 'Medical',
      parentId: null,
      createdAt: '',
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      id: 'legal',
      name: 'Legal',
      parentId: null,
      createdAt: '',
      color: 'from-purple-400 to-purple-500'
    },
    {
      id: 'finances',
      name: 'Finances',
      parentId: null,
      createdAt: '',
      color: 'from-amber-400 to-orange-500'
    },
    {
      id: 'discounts',
      name: 'Discounts',
      parentId: null,
      createdAt: '',
      color: 'from-rose-400 to-pink-500'
    },
    {
      id: 'housing',
      name: 'Housing',
      parentId: null,
      createdAt: '',
      color: 'from-teal-400 to-teal-500'
    }
  ];

  const [orderedFolders, setOrderedFolders] = useState(defaultFolders);

  // Update ordered folders when needed
  React.useEffect(() => {
    setOrderedFolders(defaultFolders);
  }, []);

  const handleCreateFolder = (name: string) => {
    console.log('DocumentSidebar handleCreateFolder called with:', name);
    onCreateFolder(name);
    // Force a refresh by updating the key
    setRefreshKey(prev => prev + 1);
  };

  const handleFolderDeleted = () => {
    console.log('DocumentSidebar handleFolderDeleted called');
    // Force a refresh by updating the key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Sidebar variant="sidebar" className="min-w-[240px] max-w-[280px]">
      <SidebarContent className="pt-20">
        <SidebarGroup>
          <CreateFolderButton onCreateFolder={handleCreateFolder} />
          
          {/* All Files row positioned 24pts below button */}
          <div className="h-6" />
          
          <DefaultFoldersList
            defaultFolders={defaultFolders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={onFolderSelect}
            orderedFolders={orderedFolders}
            setOrderedFolders={setOrderedFolders}
          />
          
          <CustomFoldersList
            key={refreshKey}
            rootFolders={rootFolders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={onFolderSelect}
            onFolderDeleted={handleFolderDeleted}
          />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DocumentSidebar;
