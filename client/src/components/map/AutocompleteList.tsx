
import React from 'react';
import CategoryIcon from './CategoryIcon';

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface MapboxPlace {
  id: string;
  place_name: string;
  text: string;
  place_type: string[];
  center: [number, number];
}

interface AutocompleteListProps {
  categories: Category[];
  mapboxPlaces: MapboxPlace[];
  onCategorySelect: (categoryName: string) => void;
  onPlaceSelect: (place: MapboxPlace) => void;
}

const AutocompleteList: React.FC<AutocompleteListProps> = ({
  categories,
  mapboxPlaces,
  onCategorySelect,
  onPlaceSelect
}) => {
  if (categories.length === 0 && mapboxPlaces.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
            Categories
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onCategorySelect(category.name)}
            >
              <CategoryIcon categoryId={category.id} />
              <span className="text-sm text-gray-700">{category.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Places Section */}
      {mapboxPlaces.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
            Places
          </div>
          {mapboxPlaces.map((place) => (
            <div
              key={place.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onPlaceSelect(place)}
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900">{place.text}</div>
                <div className="text-xs text-gray-500">{place.place_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteList;
