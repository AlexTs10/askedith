
import { useState, useEffect } from 'react';
import { useMapboxGeocoding } from './useMapboxGeocoding';

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

const sampleLocations: Location[] = [
  {
    id: '1',
    name: 'Sunrise Senior Living Beverly Hills',
    category: 'senior-living',
    address: '9131 Pico Blvd, Los Angeles, CA 90035',
    phone: '(310) 888-3751',
    website: 'sunriseseniorliving.com',
    rating: 4.8,
    hours: 'Open until 6 PM',
    distance: '0.5 mi',
    lat: 34.0522,
    lng: -118.2437
  },
  {
    id: '2',
    name: 'Visiting Angels Home Care',
    category: 'home-care',
    address: '1234 Wilshire Blvd, Los Angeles, CA 90017',
    phone: '(323) 555-0123',
    website: 'visitingangels.com',
    rating: 4.6,
    hours: '24/7',
    distance: '1.2 mi',
    lat: 34.0622,
    lng: -118.2537
  }
];

export const useCaregiverLocations = (
  searchQuery: string,
  selectedCategories: string[],
  mapCenter: { lat: number; lng: number }
) => {
  const { searchLocations, searchNearbyPlaces } = useMapboxGeocoding();
  const [locations, setLocations] = useState<Location[]>(sampleLocations);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);

  console.log('🏗️ useCaregiverLocations called with:', {
    searchQuery,
    selectedCategories: selectedCategories.length,
    mapCenter
  });

  // Convert geocoding result to Location format
  const convertGeocodingToLocation = (result: any): Location => {
    const address = result.place_name;
    const phone = result.properties?.tel || '(555) 000-0000';
    const website = result.properties?.website;
    
    // Determine category based on place type, properties, or text
    let category = 'professionals';
    const text = result.text?.toLowerCase() || '';
    const placeName = result.place_name?.toLowerCase() || '';
    const properties = result.properties || {};
    
    console.log('🏗️ Converting geocoding result:', {
      id: result.id,
      text: result.text,
      place_name: result.place_name,
      properties
    });
    
    // Enhanced category detection
    if (text.includes('hospital') || placeName.includes('hospital') || placeName.includes('medical center') || placeName.includes('clinic')) {
      category = 'hospitals';
    } else if (text.includes('pharmacy') || placeName.includes('pharmacy') || text.includes('cvs') || text.includes('walgreens') || text.includes('rite aid')) {
      category = 'pharmacies';
    } else if (text.includes('senior') || text.includes('nursing') || text.includes('assisted living') || text.includes('memory care')) {
      category = 'senior-living';
    } else if (text.includes('therapy') || text.includes('rehabilitation') || text.includes('physical therapy') || text.includes('rehab')) {
      category = 'physical-therapy';
    } else if (text.includes('attorney') || text.includes('lawyer') || text.includes('law') || text.includes('legal')) {
      category = 'elder-law-attorneys';
    } else if ((text.includes('care') && (text.includes('home') || text.includes('health'))) || text.includes('caregiver')) {
      category = 'home-care';
    } else if (text.includes('government') || text.includes('va ') || text.includes('veterans') || text.includes('social security')) {
      category = 'government-va';
    } else if (properties.category) {
      const cat = properties.category.toLowerCase();
      if (cat.includes('hospital') || cat.includes('medical')) category = 'hospitals';
      else if (cat.includes('pharmacy')) category = 'pharmacies';
      else if (cat.includes('senior') || cat.includes('care')) category = 'senior-living';
      else if (cat.includes('therapy')) category = 'physical-therapy';
      else if (cat.includes('legal') || cat.includes('law')) category = 'elder-law-attorneys';
    }

    console.log('🏗️ Assigned category:', category, 'to', result.text);

    return {
      id: result.id,
      name: result.text || result.place_name.split(',')[0],
      category,
      address,
      phone,
      website,
      rating: 4.0 + Math.random(),
      hours: 'Hours not available',
      distance: '0.0 mi',
      lat: result.center[1],
      lng: result.center[0]
    };
  };

  // Handle search query changes
  useEffect(() => {
    console.log('🏗️ Search effect triggered with:', { searchQuery, selectedCategories });
    
    const performSearch = async () => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        console.log('🏗️ Performing search for:', searchQuery);
        
        // First search for the location itself
        const locationResults = await searchLocations(searchQuery, mapCenter);
        console.log('🏗️ Location results:', locationResults.length);
        
        if (locationResults.length > 0) {
          const firstResult = locationResults[0];
          const newCenter = {
            lat: firstResult.center[1],
            lng: firstResult.center[0]
          };
          
          console.log('🏗️ Setting search center to:', newCenter);
          setSearchCenter(newCenter);
          
          // Enhanced search terms for better coverage
          const comprehensiveSearchTerms = [
            'hospital', 'medical center', 'clinic', 'urgent care',
            'pharmacy', 'cvs', 'walgreens', 'rite aid',
            'nursing home', 'assisted living', 'senior living', 'memory care',
            'physical therapy', 'rehabilitation', 'therapy',
            'attorney', 'lawyer', 'legal services', 'law office',
            'home care', 'healthcare', 'caregiver services',
            'government office', 'veterans affairs', 'social security'
          ];
          
          // If categories are selected, filter search terms
          let searchTermsToUse = comprehensiveSearchTerms;
          if (selectedCategories.length > 0) {
            searchTermsToUse = selectedCategories.flatMap(cat => {
              switch (cat) {
                case 'hospitals': return ['hospital', 'medical center', 'clinic', 'urgent care'];
                case 'pharmacies': return ['pharmacy', 'cvs', 'walgreens', 'rite aid'];
                case 'senior-living': return ['nursing home', 'assisted living', 'senior living', 'memory care'];
                case 'physical-therapy': return ['physical therapy', 'rehabilitation', 'therapy'];
                case 'elder-law-attorneys': return ['attorney', 'lawyer', 'legal services', 'law office'];
                case 'home-care': return ['home care', 'healthcare', 'caregiver services'];
                case 'government-va': return ['government office', 'veterans affairs', 'social security'];
                default: return [];
              }
            });
          }
          
          console.log('🏗️ Using search terms:', searchTermsToUse);
          
          // Search for nearby places with more comprehensive terms
          let nearbyResults: any[] = [];
          for (const term of searchTermsToUse.slice(0, 8)) { // Increased from 3 to 8
            console.log('🏗️ Searching for:', term);
            const termResults = await searchNearbyPlaces(newCenter, [term]);
            console.log('🏗️ Found', termResults.length, 'results for', term);
            nearbyResults.push(...termResults);
          }
          
          console.log('🏗️ Total nearby results before deduplication:', nearbyResults.length);
          
          // Remove duplicates by ID
          const uniqueResults = nearbyResults.filter((result, index, self) => 
            index === self.findIndex(r => r.id === result.id)
          );
          
          console.log('🏗️ Unique nearby results:', uniqueResults.length);
          
          // Convert all results
          const convertedResults = uniqueResults.map(convertGeocodingToLocation);
          
          // Filter by selected categories if any
          let filteredResults = convertedResults;
          if (selectedCategories.length > 0) {
            filteredResults = convertedResults.filter(location => 
              selectedCategories.includes(location.category)
            );
            console.log('🏗️ Filtered by categories:', filteredResults.length, 'from', convertedResults.length);
          }
          
          console.log('🏗️ Final results to display:', filteredResults.length);
          setSearchResults(filteredResults);
          setLocations(filteredResults.length > 0 ? filteredResults : sampleLocations);
        } else {
          // No location found, just show sample data
          console.log('🏗️ No location found, showing sample data');
          setSearchResults([]);
          setSearchCenter(null);
          setLocations(sampleLocations);
        }
      } else {
        console.log('🏗️ Search query too short, resetting');
        setSearchResults([]);
        setSearchCenter(null);
        let filtered = sampleLocations;
        
        if (selectedCategories.length > 0) {
          filtered = filtered.filter(location => selectedCategories.includes(location.category));
          console.log('🏗️ Filtered sample locations by categories:', filtered.length);
        }
        
        setLocations(filtered);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => {
      console.log('🏗️ Clearing search debounce timer');
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, searchLocations, searchNearbyPlaces, mapCenter, selectedCategories]);

  // Filter by categories
  useEffect(() => {
    console.log('🏗️ Category filter effect triggered with:', selectedCategories);
    if (selectedCategories.length > 0 && !searchQuery.trim()) {
      const filtered = sampleLocations.filter(location => selectedCategories.includes(location.category));
      console.log('🏗️ Filtered locations by categories:', filtered.length);
      setLocations(filtered);
    } else if (!searchQuery.trim()) {
      console.log('🏗️ No search query, showing all sample locations');
      setLocations(sampleLocations);
    }
  }, [selectedCategories, searchQuery]);

  return { locations, searchCenter };
};
