
import React from 'react';
import { Scale, Briefcase, CreditCard, Home, Activity, Building2, Building, Cross, Pill } from 'lucide-react';

interface CategoryIconProps {
  categoryId: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, className = "h-4 w-4" }) => {
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, { icon: React.ReactNode; bgColor: string }> = {
      'elder-law-attorneys': { icon: <Scale className={className} />, bgColor: '#F59E0B' },
      'professionals': { icon: <Briefcase className={className} />, bgColor: '#6B7280' },
      'paying-for-care': { icon: <CreditCard className={className} />, bgColor: '#F59E0B' },
      'home-care': { icon: <Home className={className} />, bgColor: '#10B981' },
      'physical-therapy': { icon: <Activity className={className} />, bgColor: '#10B981' },
      'senior-living': { icon: <Building2 className={className} />, bgColor: '#8B5CF6' },
      'government-va': { icon: <Building className={className} />, bgColor: '#3B82F6' },
      'hospitals': { icon: <Cross className={className} />, bgColor: '#EF4444' },
      'pharmacies': { icon: <Pill className={className} />, bgColor: '#EC4899' }
    };
    return iconMap[categoryId] || { icon: <Home className={className} />, bgColor: '#6B7280' };
  };

  const categoryIcon = getCategoryIcon(categoryId);

  return (
    <div 
      className="flex-shrink-0 p-1 rounded text-white"
      style={{ backgroundColor: categoryIcon.bgColor }}
    >
      {categoryIcon.icon}
    </div>
  );
};

export default CategoryIcon;
