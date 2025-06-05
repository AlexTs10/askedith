
import { useState, useCallback, useRef } from 'react';

interface MapboxPlace {
  id: string;
  place_name: string;
  text: string;
  place_type: string[];
  center: [number, number];
}

export const useMapboxPlaceSuggestions = () => {
  const [suggestions, setSuggestions] = useState<MapboxPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const getSuggestions = useCallback(async (query: string, center?: { lat: number; lng: number }) => {
    console.log('🔍 useMapboxPlaceSuggestions - getSuggestions called with:', { query, center });
    
    if (!query.trim() || query.length < 2) {
      console.log('🔍 Query too short, clearing suggestions');
      setSuggestions([]);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      console.log('🔍 Clearing previous debounce timer');
      clearTimeout(debounceTimer.current);
    }

    // Debounce the API call
    debounceTimer.current = setTimeout(async () => {
      console.log('🔍 Starting debounced API call for:', query);
      setIsLoading(true);
      
      try {
        const accessToken = 'pk.eyJ1IjoiZWxpYXNwMTIzIiwiYSI6ImNtOHFjdXl5eDBqaTkybXEyMGVvaWFsdzIifQ.dg0YQHjrTHMrobBHP35KJQ';
        
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=5&types=poi,address,place`;
        
        if (center) {
          url += `&proximity=${center.lng},${center.lat}`;
          console.log('🔍 Added proximity to URL:', `${center.lng},${center.lat}`);
        }

        console.log('🔍 Making API call to:', url);
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Mapbox API response received:', {
            featuresCount: data.features?.length || 0,
            features: data.features?.map((f: any) => ({ id: f.id, text: f.text, place_name: f.place_name }))
          });
          setSuggestions(data.features || []);
        } else {
          console.error('❌ Mapbox API error response:', response.status, response.statusText);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('❌ Place suggestions error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
        console.log('🔍 API call completed');
      }
    }, 300); // 300ms debounce
  }, []);

  const clearSuggestions = useCallback(() => {
    console.log('🔍 Clearing suggestions');
    setSuggestions([]);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  return { suggestions, isLoading, getSuggestions, clearSuggestions };
};
