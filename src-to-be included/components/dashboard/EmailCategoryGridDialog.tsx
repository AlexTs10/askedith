
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface EmailCategoryGridDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newCategoryName: string;
  onNameChange: (name: string) => void;
  onCreateCategory: () => void;
}

const EmailCategoryGridDialog: React.FC<EmailCategoryGridDialogProps> = ({
  isOpen,
  onClose,
  newCategoryName,
  onNameChange,
  onCreateCategory
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-600 font-normal">Create New Category</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onCreateCategory();
              }
            }}
            className="text-gray-600"
          />
          <Button 
            onClick={onCreateCategory} 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCategoryGridDialog;
