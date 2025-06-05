
import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarMenu } from '../ui/sidebar';
import { EmailCategory } from '../../hooks/useEmailCategoryData';
import ShowAllEmailsButton from './sidebar/ShowAllEmailsButton';
import DraggableCategoryList from './sidebar/DraggableCategoryList';
import AddCategoryDialog from './sidebar/AddCategoryDialog';
import { useCategoryDragDrop } from './sidebar/useCategoryDragDrop';

interface EmailSidebarProps {
  emailCategories: EmailCategory[];
  category?: string;
  activeTab: string;
  onCategoryAdded: () => void;
}

const EmailSidebar = ({ 
  emailCategories, 
  category, 
  activeTab, 
  onCategoryAdded
}: EmailSidebarProps) => {
  const {
    orderedCategories,
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useCategoryDragDrop(emailCategories);

  return (
    <Sidebar side="left" className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            <ShowAllEmailsButton category={category} activeTab={activeTab} />
            <DraggableCategoryList 
              orderedCategories={orderedCategories}
              category={category} 
              activeTab={activeTab}
              draggedItem={draggedItem}
              dragOverIndex={dragOverIndex}
              onCategoryAdded={onCategoryAdded}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
            <AddCategoryDialog onCategoryAdded={onCategoryAdded} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default EmailSidebar;
