
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Folder, Plus, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { getAllFolders, getFoldersByParent, getDocumentsInFolder, deleteFolder, DocumentFolder } from '../../utils/folderUtils';
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
import { Input } from '../ui/input';

interface SimpleFolderListProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
}

const SimpleFolderList: React.FC<SimpleFolderListProps> = ({
  selectedFolderId,
  onFolderSelect,
  onCreateFolder
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const allFolders = getAllFolders();
  const rootFolders = getFoldersByParent(null);

  // Default folders
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

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateForm(false);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (selectedFolderId === folderId) {
      onFolderSelect(null);
    }
    deleteFolder(folderId);
    setRefreshKey(prev => prev + 1);
  };

  const renderFolderItem = (folder: any, level: number = 0) => {
    const childFolders = getFoldersByParent(folder.id);
    const hasChildren = childFolders.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const documentCount = getDocumentCount(folder.id);
    const isActive = selectedFolderId === folder.id;
    const isCustomFolder = !defaultFolders.some(df => df.id === folder.id);

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
            isActive ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${0.5 + level * 1}rem` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(folder.id);
              }}
              className="mr-1 hover:bg-gray-200 rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          
          <div className={`w-4 h-4 rounded-md bg-gradient-to-r ${folder.color} flex items-center justify-center mr-2`}>
            <Folder className="w-2.5 h-2.5 text-white" />
          </div>
          
          <span className="flex-1 truncate text-sm">{folder.name}</span>
          
          {documentCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {documentCount}
            </Badge>
          )}

          {isCustomFolder && (
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
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {childFolders.map(childFolder => renderFolderItem(childFolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Create Folder Button */}
      <div className="space-y-2">
        {!showCreateForm ? (
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateFolder} size="sm" className="flex-1">
                Create
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFolderName('');
                }} 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Default Folders */}
      <div className="space-y-1">
        {defaultFolders.map(folder => renderFolderItem(folder))}
      </div>

      {/* Custom Folders */}
      {rootFolders.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-gray-200">
          {rootFolders.map(folder => renderFolderItem(folder))}
        </div>
      )}
    </div>
  );
};

export default SimpleFolderList;
