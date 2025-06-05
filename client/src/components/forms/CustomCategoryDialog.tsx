
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CustomCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string) => boolean;
}

const CustomCategoryDialog: React.FC<CustomCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddCategory
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    const success = onAddCategory(newCategoryName);
    if (success) {
      setNewCategoryName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Category</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
          />
          <Button onClick={handleAddCategory} size="sm">
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomCategoryDialog;
