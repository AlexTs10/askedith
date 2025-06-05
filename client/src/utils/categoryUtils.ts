// Categories with their display names and colors
export const categoryInfo: Record<string, { title: string, color: string, bgColor: string }> = {
  'attorneys': { 
    title: 'Elder Law Attorneys', 
    color: 'bg-gradient-to-r from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50' 
  },
  'other-professionals': { 
    title: 'Professionals', 
    color: 'bg-gradient-to-r from-indigo-400 to-indigo-500',
    bgColor: 'bg-indigo-50' 
  },
  'paying-for-care': { 
    title: 'Paying for Care', 
    color: 'bg-gradient-to-r from-lime-400 to-lime-500',
    bgColor: 'bg-lime-50' 
  },
  'home-care': { 
    title: 'Home Care', 
    color: 'bg-gradient-to-r from-teal-600 to-teal-700',
    bgColor: 'bg-teal-50' 
  },
  'physical-therapy': { 
    title: 'Physical Therapy', 
    color: 'bg-gradient-to-r from-cyan-400 to-cyan-500',
    bgColor: 'bg-cyan-50' 
  },
  'senior-living': { 
    title: 'Senior Living', 
    color: 'bg-gradient-to-r from-rose-400 to-pink-500',
    bgColor: 'bg-rose-50' 
  },
  'government-va': { 
    title: 'Government & VA', 
    color: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    bgColor: 'bg-emerald-50' 
  },
  'hospitals': { 
    title: 'Hospitals', 
    color: 'bg-gradient-to-r from-red-400 to-red-500',
    bgColor: 'bg-red-50' 
  },
  'pharmacies': { 
    title: 'Pharmacies', 
    color: 'bg-gradient-to-r from-pink-400 to-pink-500',
    bgColor: 'bg-pink-50' 
  }
};

// Custom categories stored in localStorage
const CUSTOM_CATEGORIES_KEY = 'custom-email-categories';

interface CustomCategory {
  id: string;
  title: string;
  color: string;
  bgColor: string;
}

// Get custom categories from localStorage
export const getCustomCategories = (): CustomCategory[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const categories = stored ? JSON.parse(stored) : [];
    console.log('📦 Retrieved custom categories from localStorage:', categories);
    return categories;
  } catch (error) {
    console.error('❌ Error reading custom categories:', error);
    return [];
  }
};

// Save custom categories to localStorage
export const saveCustomCategories = (categories: CustomCategory[]): void => {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
    console.log('💾 Saved custom categories to localStorage:', categories);
    
    // Dispatch a custom event to notify other components with a small delay
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('customCategoriesChanged', { detail: categories }));
      console.log('📤 Dispatched customCategoriesChanged event');
    }, 50);
  } catch (error) {
    console.error('❌ Error saving custom categories:', error);
  }
};

// Add a new custom category
export const addCustomCategory = (title: string): CustomCategory => {
  console.log('🆕 Adding new custom category:', title);
  
  const customCategories = getCustomCategories();
  const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Check if category already exists
  const existingCategory = customCategories.find(cat => cat.id === id);
  if (existingCategory) {
    console.log('⚠️ Category already exists:', existingCategory);
    return existingCategory;
  }
  
  // Generate a random color from available options
  const colorOptions = [
    { color: 'bg-gradient-to-r from-purple-400 to-purple-500', bgColor: 'bg-purple-50' },
    { color: 'bg-gradient-to-r from-pink-400 to-pink-500', bgColor: 'bg-pink-50' },
    { color: 'bg-gradient-to-r from-red-400 to-red-500', bgColor: 'bg-red-50' },
    { color: 'bg-gradient-to-r from-orange-400 to-orange-500', bgColor: 'bg-orange-50' },
    { color: 'bg-gradient-to-r from-yellow-400 to-yellow-500', bgColor: 'bg-yellow-50' },
    { color: 'bg-gradient-to-r from-green-400 to-green-500', bgColor: 'bg-green-50' },
    { color: 'bg-gradient-to-r from-slate-400 to-slate-500', bgColor: 'bg-slate-50' },
  ];
  
  const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
  
  const newCategory: CustomCategory = {
    id,
    title,
    ...randomColor
  };
  
  const updatedCategories = [...customCategories, newCategory];
  saveCustomCategories(updatedCategories);
  
  console.log('✅ Successfully added new category:', newCategory);
  return newCategory;
};

// Get all categories (predefined + custom) - always fresh read
export const getAllCategories = (): Record<string, { title: string, color: string, bgColor: string }> => {
  // Always get fresh custom categories from localStorage
  const customCategories = getCustomCategories();
  const customCategoryInfo = customCategories.reduce((acc, category) => {
    acc[category.id] = {
      title: category.title,
      color: category.color,
      bgColor: category.bgColor
    };
    return acc;
  }, {} as Record<string, { title: string, color: string, bgColor: string }>);
  
  const allCategories = { ...categoryInfo, ...customCategoryInfo };
  console.log('📂 getAllCategories returning:', Object.keys(allCategories));
  return allCategories;
};

// Check if a category exists
export const categoryExists = (categoryId: string): boolean => {
  const allCategories = getAllCategories();
  return categoryId in allCategories;
};
