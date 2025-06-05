
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useTypewriterEffect } from '../../hooks/useTypewriterEffect';

interface MapSearchBarProps {
  onSearch: (query: string) => void;
  onLocationRequest: () => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({ onSearch, onLocationRequest }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { text: placeholderText, isFading } = useTypewriterEffect(!isFocused && !query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused || query ? "Search for care providers..." : ""}
            className="w-full h-14 pl-12 pr-16 text-base bg-white border border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          
          {/* Typewriter effect placeholder */}
          {!isFocused && !query && (
            <div 
              className={`absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-opacity duration-300 ${
                isFading ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {placeholderText}
              <span className="animate-pulse">|</span>
            </div>
          )}
          
          <button
            type="button"
            onClick={onLocationRequest}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
            title="Use my location"
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MapSearchBar;
