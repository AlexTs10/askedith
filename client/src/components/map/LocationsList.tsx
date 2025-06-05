
import React from 'react';
import { MapPin, Phone, Globe, Star, Clock } from 'lucide-react';

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

interface LocationsListProps {
  locations: Location[];
  selectedLocation: string | null;
  onLocationSelect: (locationId: string) => void;
  isLoading?: boolean;
}

const LocationsList: React.FC<LocationsListProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center">
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
        <p className="text-gray-500">Try adjusting your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {locations.length} location{locations.length !== 1 ? 's' : ''} found
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {locations.map((location) => (
          <div
            key={location.id}
            onClick={() => onLocationSelect(location.id)}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedLocation === location.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{location.name}</h4>
                <p className="text-xs text-gray-500 capitalize">{location.category.replace('-', ' ')}</p>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{location.address}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{location.phone}</span>
                </div>
                
                {location.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 flex-shrink-0" />
                    <span className="text-blue-600 hover:underline">Visit website</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span>{location.rating}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{location.hours}</span>
                  </div>
                  
                  <span className="text-blue-600 font-medium">{location.distance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationsList;
