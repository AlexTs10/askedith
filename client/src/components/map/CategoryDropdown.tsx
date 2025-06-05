
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import CategoryGrid from './CategoryGrid';
import AutocompleteList from './AutocompleteList';
import { useMapboxPlaceSuggestions } from '../../hooks/useMapboxPlaceSuggestions';

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface CategoryDropdownProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onSelectAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  mapCenter: { lat: number; lng: number };
  onPlaceSelect: (place: any) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  onSelectAll,
  searchQuery,
  onSearchChange,
  mapCenter,
  onPlaceSelect
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, getSuggestions, clearSuggestions } = useMapboxPlaceSuggestions();

  console.log('🔍 CategoryDropdown rendered with:', {
    searchQuery,
    selectedCategories: selectedCategories.length,
    hasSelectedLocation,
    isDropdownOpen,
    suggestionsCount: suggestions.length
  });

  // Get place suggestions when typing (only when no location selected yet)
  useEffect(() => {
    if (!hasSelectedLocation && searchQuery.trim().length > 2) {
      console.log('🔍 Getting location suggestions for:', searchQuery);
      getSuggestions(searchQuery, mapCenter);
    } else {
      clearSuggestions();
    }
  }, [searchQuery, hasSelectedLocation, getSuggestions, clearSuggestions, mapCenter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('🔍 Clicking outside, closing dropdown');
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputClick = () => {
    console.log('🔍 Input clicked, hasSelectedLocation:', hasSelectedLocation);
    if (hasSelectedLocation) {
      // Toggle dropdown when location is already selected
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleInputFocus = () => {
    console.log('🔍 Input focused, hasSelectedLocation:', hasSelectedLocation);
    setIsFocused(true);
    if (hasSelectedLocation) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputBlur = () => {
    console.log('🔍 Input blurred');
    setIsFocused(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('🔍 Search input changed to:', value);
    onSearchChange(value);
    
    // If user starts typing after selecting a location, reset the flow
    if (hasSelectedLocation) {
      console.log('🔍 Resetting location selection flow');
      setHasSelectedLocation(false);
      setIsDropdownOpen(false);
    }
  };

  const handlePlaceSelect = (place: any) => {
    console.log('🔍 Location selected:', place.place_name);
    onPlaceSelect(place);
    onSearchChange(place.place_name);
    setHasSelectedLocation(true);
    setIsDropdownOpen(true); // Show categories dropdown
    clearSuggestions();
  };

  const handleGoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔍 Go button clicked');
    setIsDropdownOpen(false);
  };

  const handleSelectAllClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔍 Select all clicked');
    onSelectAll();
  };

  // Check if all categories are selected
  const allCategoriesSelected = selectedCategories.length === categories.length;

  // Determine placeholder text
  const getPlaceholderText = () => {
    if (hasSelectedLocation) {
      return "Location set - click to select categories";
    }
    return "Type the city and state you need to search";
  };

  // Determine if we should show location suggestions
  const shouldShowLocationSuggestions = !hasSelectedLocation && suggestions.length > 0 && searchQuery.trim().length > 2;

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={getPlaceholderText()}
          className={`w-full h-12 pl-12 pr-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-text ${
            hasSelectedLocation 
              ? 'bg-amber-50 border-amber-300 text-gray-700' 
              : 'bg-white border-gray-300 text-gray-700'
          }`}
        />
      </div>

      {/* Location Suggestions (Step 1) */}
      {shouldShowLocationSuggestions && (
        <AutocompleteList
          categories={[]}
          mapboxPlaces={suggestions}
          onCategorySelect={() => {}}
          onPlaceSelect={handlePlaceSelect}
        />
      )}

      {/* Category Dropdown (Step 2) */}
      {hasSelectedLocation && isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Select the types of services you're looking for:
              </h3>
            </div>
            
            {/* Category Grid */}
            <CategoryGrid
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={onCategoryToggle}
            />

            {/* Select All Button with Go Button */}
            <div className="border-t border-gray-200 pt-3">
              <div className="w-full flex items-center gap-2 p-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors cursor-pointer">
                <div
                  className="flex items-center gap-2"
                  onClick={handleSelectAllClick}
                >
                  <Checkbox
                    checked={allCategoriesSelected}
                    className="flex-shrink-0 border-white data-[state=checked]:bg-white data-[state=checked]:text-teal-700"
                  />
                  <span className="text-sm font-medium">
                    {allCategoriesSelected ? 'Deselect all categories' : 'Or select all categories'}
                  </span>
                </div>
                <button
                  onClick={handleGoClick}
                  className="ml-2 text-white text-sm font-medium hover:underline"
                >
                  | Go →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
