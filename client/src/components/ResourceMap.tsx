import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Resource } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Globe, Clock, X } from 'lucide-react';

interface ResourceMapProps {
  resources: Resource[];
  selectedCategory?: string | null;
  onCategoryFilter?: (category: string | null) => void;
}

// Category colors for markers
const categoryColors: Record<string, string> = {
  'Veteran Benefits': '#ef4444', // red
  'Aging Life Care Professionals': '#3b82f6', // blue
  'Home Care Companies': '#10b981', // green
  'Government Agencies': '#f59e0b', // yellow
  'Financial Advisors': '#8b5cf6', // purple
  'Other': '#6b7280', // gray
};

const ResourceMap: React.FC<ResourceMapProps> = ({ 
  resources, 
  selectedCategory, 
  onCategoryFilter 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [mapboxKey, setMapboxKey] = useState<string>('');

  // Filter resources based on selected category
  const filteredResources = selectedCategory 
    ? resources.filter(resource => resource.category === selectedCategory)
    : resources;

  // Get unique categories from resources
  const categories = Array.from(new Set(resources.map(r => r.category)));

  // Fetch Mapbox API key
  useEffect(() => {
    const fetchMapboxKey = async () => {
      try {
        const response = await fetch('/api/mapbox-key');
        const data = await response.json();
        if (data.mapboxPublicKey) {
          setMapboxKey(data.mapboxPublicKey);
          mapboxgl.accessToken = data.mapboxPublicKey;
        }
      } catch (error) {
        console.error('Failed to fetch Mapbox key:', error);
      }
    };

    fetchMapboxKey();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxKey) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxKey]);

  // Update markers when resources or filter changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter resources with valid coordinates
    const validResources = filteredResources.filter(
      resource => resource.latitude && resource.longitude
    );

    if (validResources.length === 0) return;

    // Create markers for each resource
    const newMarkers = validResources.map(resource => {
      const lat = parseFloat(resource.latitude as string);
      const lng = parseFloat(resource.longitude as string);

      if (isNaN(lat) || isNaN(lng)) return null;

      // Create marker element with category color
      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${categoryColors[resource.category] || categoryColors.Other};
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Add click handler
      markerElement.addEventListener('click', () => {
        setSelectedResource(resource);
      });

      return marker;
    }).filter(Boolean) as mapboxgl.Marker[];

    markersRef.current = newMarkers;

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const coordinates = validResources.map(resource => [
        parseFloat(resource.longitude as string),
        parseFloat(resource.latitude as string)
      ]);

      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord as [number, number]);
      }, new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
  }, [filteredResources]);

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Resource Locations</h3>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryFilter?.(null)}
              className="text-xs"
            >
              All ({resources.length})
            </Button>
            {categories.map(category => {
              const count = resources.filter(r => r.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryFilter?.(category)}
                  className="text-xs"
                  style={{
                    backgroundColor: selectedCategory === category 
                      ? categoryColors[category] 
                      : undefined,
                    borderColor: categoryColors[category]
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: categoryColors[category] || categoryColors.Other }}
                  />
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div ref={mapContainer} className="h-96 w-full" />

        {/* Resource Details Popup */}
        {selectedResource && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {selectedResource.name}
                    </h4>
                    {selectedResource.companyName && (
                      <p className="text-gray-600">{selectedResource.companyName}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResource(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Badge 
                  variant="outline" 
                  className="mb-3"
                  style={{ 
                    borderColor: categoryColors[selectedResource.category],
                    color: categoryColors[selectedResource.category]
                  }}
                >
                  {selectedResource.category}
                </Badge>

                <div className="space-y-2 text-sm">
                  {selectedResource.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{selectedResource.address}</span>
                    </div>
                  )}

                  {selectedResource.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={`tel:${selectedResource.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedResource.phone}
                      </a>
                    </div>
                  )}

                  {selectedResource.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={selectedResource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {selectedResource.hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{selectedResource.hours}</span>
                    </div>
                  )}

                  {selectedResource.description && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedResource.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">Legend:</span>
          {categories.map(category => (
            <div key={category} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: categoryColors[category] || categoryColors.Other }}
              />
              <span>{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceMap;