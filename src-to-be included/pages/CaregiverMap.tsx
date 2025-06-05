
import React, { useState, useEffect } from 'react';
import { Scale, Briefcase, CreditCard, Home, Activity, Building2, Building, Cross, Pill } from 'lucide-react';
import CaregiverMapComponent from '../components/map/CaregiverMapComponent';
import CategoryDropdown from '../components/map/CategoryDropdown';
import CaregiverLocationsList from '../components/map/CaregiverLocationsList';
import CaregiverMapHeader from '../components/map/CaregiverMapHeader';
import { useCaregiverLocations } from '../hooks/useCaregiverLocations';
import { useMapboxGeocoding } from '../hooks/useMapboxGeocoding';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  count: number;
}

const categories: Category[] = [
  { id: 'elder-law-attorneys', name: 'Elder Law Attorneys', color: '#F59E0B', icon: <Scale className="h-5 w-5" />, count: 2 },
  { id: 'professionals', name: 'Other Professionals', color: '#6B7280', icon: <Briefcase className="h-5 w-5" />, count: 2 },
  { id: 'paying-for-care', name: 'Paying for Care', color: '#F59E0B', icon: <CreditCard className="h-5 w-5" />, count: 1 },
  { id: 'home-care', name: 'Home Care', color: '#10B981', icon: <Home className="h-5 w-5" />, count: 2 },
  { id: 'physical-therapy', name: 'Physical Therapy', color: '#10B981', icon: <Activity className="h-5 w-5" />, count: 2 },
  { id: 'senior-living', name: 'Senior Living', color: '#8B5CF6', icon: <Building2 className="h-5 w-5" />, count: 2 },
  { id: 'government-va', name: 'Government & VA', color: '#3B82F6', icon: <Building className="h-5 w-5" />, count: 2 },
  { id: 'hospitals', name: 'Hospitals', color: '#EF4444', icon: <Cross className="h-5 w-5" />, count: 1 },
  { id: 'pharmacies', name: 'Pharmacies', color: '#EC4899', icon: <Pill className="h-5 w-5" />, count: 3 }
];

const CaregiverMap = () => {
  const { isLoading } = useMapboxGeocoding();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 });
  const [mapZoom, setMapZoom] = useState(12);
  const [hasUserSelectedLocation, setHasUserSelectedLocation] = useState(false);
  
  const { locations, searchCenter } = useCaregiverLocations(searchQuery, selectedCategories, mapCenter);

  console.log('🏠 CaregiverMap rendered with state:', {
    selectedCategories: selectedCategories.length,
    selectedLocation,
    searchQuery,
    mapCenter,
    mapZoom,
    locationsCount: locations.length,
    hasUserSelectedLocation,
    isLoading
  });

  // Update map center when search results are found
  useEffect(() => {
    console.log('🏠 Search center effect triggered with searchCenter:', searchCenter);
    if (searchCenter) {
      console.log('🏠 Updating map center to:', searchCenter);
      setMapCenter(searchCenter);
      setMapZoom(13);
    }
  }, [searchCenter]);

  const handleCategoryToggle = (categoryId: string) => {
    console.log('🏠 Category toggle:', categoryId);
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      console.log('🏠 Updated selected categories:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAllCategories = () => {
    console.log('🏠 handleSelectAllCategories called');
    setSelectedCategories(prev => {
      const allCategoryIds = categories.map(cat => cat.id);
      if (prev.length === allCategoryIds.length) {
        console.log('🏠 Deselecting all categories');
        return [];
      } else {
        console.log('🏠 Selecting all categories');
        return allCategoryIds;
      }
    });
  };

  const handleLocationSelect = (locationId: string) => {
    console.log('🏠 Location selected:', locationId);
    setSelectedLocation(locationId);
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      console.log('🏠 Setting map center to location:', location.name, location.lat, location.lng);
      setMapCenter({ lat: location.lat, lng: location.lng });
      setMapZoom(16);
    }
  };

  const handlePlaceSelect = (place: any) => {
    console.log('🏠 Place selected for search area:', place);
    const newCenter = {
      lat: place.center[1],
      lng: place.center[0]
    };
    console.log('🏠 Setting map center to place:', place.place_name, newCenter);
    setMapCenter(newCenter);
    setMapZoom(14);
    setHasUserSelectedLocation(true);
    // Clear selected location since we're showing a new place
    setSelectedLocation(null);
  };

  const getCategoryColor = (categoryId: string) => {
    const color = categories.find(cat => cat.id === categoryId)?.color || '#6B7280';
    console.log('🏠 Getting category color for:', categoryId, '→', color);
    return color;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <CaregiverMapHeader isLoading={isLoading} />

      {/* Search Bar with Dropdown */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <CategoryDropdown
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onSelectAll={handleSelectAllCategories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          mapCenter={mapCenter}
          onPlaceSelect={handlePlaceSelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <CaregiverLocationsList
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          getCategoryColor={getCategoryColor}
          searchQuery={searchQuery}
        />

        {/* Map */}
        <div className="flex-1">
          <CaregiverMapComponent
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            center={mapCenter}
            zoom={mapZoom}
          />
        </div>
      </div>
    </div>
  );
};

export default CaregiverMap;
