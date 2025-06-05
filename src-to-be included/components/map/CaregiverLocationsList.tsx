
import React from 'react';
import { MapPin, Phone, Globe } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website?: string;
  rating: number;
  hours: string;
  distance: string;
  lat: number;
  lng: number;
}

interface CaregiverLocationsListProps {
  locations: Location[];
  selectedLocation: string | null;
  onLocationSelect: (locationId: string) => void;
  getCategoryColor: (categoryId: string) => string;
  searchQuery: string;
}

const CaregiverLocationsList: React.FC<CaregiverLocationsListProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  getCategoryColor,
  searchQuery
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {locations.length} location{locations.length !== 1 ? 's' : ''}
          {searchQuery && <span className="text-sm text-gray-500 block">for "{searchQuery}"</span>}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {locations.map((location) => (
          <div
            key={location.id}
            onClick={() => onLocationSelect(location.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedLocation === location.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-6 h-6 rounded-sm mt-1 flex-shrink-0" 
                style={{ backgroundColor: getCategoryColor(location.category) }}
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">{location.name}</h4>
                <p className="text-sm text-gray-600 capitalize mb-2">{location.category.replace('-', ' ')}</p>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{location.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{location.phone}</span>
                  </div>
                  
                  {location.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="text-blue-600">{location.website}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex gap-4">
                  <button className="bg-teal-600 text-white px-4 py-1 rounded text-sm hover:bg-teal-700 transition-colors">
                    Directions
                  </button>
                  <button className="bg-teal-600 text-white px-4 py-1 rounded text-sm hover:bg-teal-700 transition-colors">
                    Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaregiverLocationsList;
