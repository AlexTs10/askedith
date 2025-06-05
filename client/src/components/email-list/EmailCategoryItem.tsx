
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { EmailCategory } from '@/hooks/useEmailCategoryData';

interface EmailCategoryItemProps {
  category: EmailCategory;
  activeCategory: string | undefined;
  activeTab: string;
}

const EmailCategoryItem: React.FC<EmailCategoryItemProps> = ({ 
  category, 
  activeCategory, 
  activeTab 
}) => {
  const navigate = useNavigate();
  
  return (
    <SidebarMenuItem> {/* Removed mb-3 class as spacing is now handled by the parent */}
      <SidebarMenuButton 
        isActive={category.id === activeCategory}
        tooltip={category.title}
        onClick={() => navigate(`/emails/${category.id}/${activeTab}`)}
        className="pr-10 relative"
      >
        <div className={`w-6 h-6 rounded-md ${category.bgColor} flex items-center justify-center mr-2`}>
          <category.icon className={`w-4 h-4 ${category.textColor}`} />
        </div>
        <span>{category.title}</span>
        {category.unread > 0 && (
          <Badge 
            variant="circle" 
            className={`absolute right-2 bg-gradient-to-r ${category.color}`}
          >
            {category.unread}
          </Badge>
        )}
        {category.pending > 0 && category.unread === 0 && (
          <Badge 
            variant="circle" 
            className={`absolute right-2 bg-gradient-to-r ${category.color} opacity-80`}
          >
            {category.pending}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default EmailCategoryItem;
