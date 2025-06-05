
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { addCustomCategory } from '@/utils/categoryUtils';
import { useToast } from '@/hooks/use-toast';

interface AddCategoryDialogProps {
  onCategoryAdded?: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ onCategoryAdded }) => {
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

  const handleAddCustomCategory = () => {
    if (newCategoryName.trim()) {
      try {
        addCustomCategory(newCategoryName.trim());
        setNewCategoryName('');
        setShowNewCategoryDialog(false);
        
        toast({
          title: "Category Created",
          description: `"${newCategoryName.trim()}" has been added as a new category.`,
        });
        
        if (onCategoryAdded) {
          onCategoryAdded();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="px-3 mb-2">
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-600 font-normal">Create New Category</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomCategory();
                }
              }}
              className="text-gray-800"
            />
            <Button 
              onClick={handleAddCustomCategory} 
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCategoryDialog;
