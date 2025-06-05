
import { getCustomCategories, saveCustomCategories } from '@/utils/categoryUtils';
import { EmailCategory } from '@/hooks/useEmailCategoryData';

export const useCategoryDeleteHandler = (
  orderedCategories: EmailCategory[],
  onCategoryAdded?: () => void
) => {
  const handleDeleteCategory = (categoryId: string, toast: any) => {
    const categoryToDelete = orderedCategories.find(cat => cat.id === categoryId);
    
    // Check if category is empty (no unread, pending, or total emails)
    if (categoryToDelete && categoryToDelete.total === 0) {
      try {
        // Remove from custom categories in localStorage
        const customCategories = getCustomCategories();
        const filteredCategories = customCategories.filter(cat => cat.id !== categoryId);
        saveCustomCategories(filteredCategories);
        
        toast({
          title: "Category Deleted",
          description: `"${categoryToDelete.title}" has been deleted.`,
        });
        
        // Notify parent component to refresh categories
        if (onCategoryAdded) {
          onCategoryAdded();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cannot Delete",
        description: "Only empty categories can be deleted.",
        variant: "destructive",
      });
    }
  };

  // Check if a category is a custom category and is empty
  const isCustomEmptyCategory = (categoryId: string) => {
    const customCategories = getCustomCategories();
    const isCustom = customCategories.some(cat => cat.id === categoryId);
    const categoryData = orderedCategories.find(cat => cat.id === categoryId);
    console.log('Category delete check:', {
      categoryId,
      isCustom,
      categoryData: categoryData ? { total: categoryData.total, title: categoryData.title } : null,
      result: isCustom && categoryData && categoryData.total === 0
    });
    return isCustom && categoryData && categoryData.total === 0;
  };

  return {
    handleDeleteCategory,
    isCustomEmptyCategory
  };
};
