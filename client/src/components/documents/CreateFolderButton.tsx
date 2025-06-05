
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FolderPlus } from 'lucide-react';
import { createFolder } from '../../utils/folderUtils';

interface CreateFolderButtonProps {
  onCreateFolder: (name: string) => void;
}

const CreateFolderButton: React.FC<CreateFolderButtonProps> = ({ onCreateFolder }) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = (name: string) => {
    if (name.trim()) {
      createFolder(name.trim());
      onCreateFolder(name.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFolder(newFolderName);
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  return (
    <div className="px-3 mb-6">
      {isCreatingFolder ? (
        <div className="space-y-3">
          <Input
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm h-8"
            autoFocus
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleCreateFolder(newFolderName)}
              disabled={!newFolderName.trim()}
              className="h-7 text-xs flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }}
              className="h-7 text-xs flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreatingFolder(true)}
          className="flex items-center gap-2 h-8 w-full justify-start bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
        >
          <FolderPlus className="w-4 h-4" />
          Create Folder
        </Button>
      )}
    </div>
  );
};

export default CreateFolderButton;
