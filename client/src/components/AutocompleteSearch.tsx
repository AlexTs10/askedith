import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

interface AutocompleteSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  onSearch,
  initialValue = ''
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Sample organization names from our categories
  const organizationNames = [
    // Senior Living
    "Sunrise Senior Living",
    "Golden Years Community",
    "Evergreen Retirement Homes",
    "Serenity Village",
    // Home Care
    "HomeCarePlus",
    "Comfort Care Services",
    "LiveWell Home Assistance",
    "ElderCare At Home",
    // Federal Benefits
    "Medicare Services",
    "Social Security Office",
    "Veterans Affairs",
    "Federal Senior Aid",
    // Local Government
    "City Senior Services",
    "County Elder Support",
    "Community Resource Center",
    "Public Assistance Office",
    // Attorneys
    "Elder Law Partners",
    "Estate Planning Associates",
    "Senior Rights Legal Group",
    "Guardian Legal Services",
    // Other Professionals
    "Senior Financial Advisors",
    "Elder Wellness Center",
    "Family Support Network",
    "Senior Transition Services"
  ];

  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Filter suggestions based on input
    if (inputValue.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }
    
    const filtered = organizationNames.filter(
      org => org.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
  }, [inputValue]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    setActiveSuggestion(0);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If no suggestions, do nothing
    if (filteredSuggestions.length === 0) return;

    // Up arrow
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev === 0 ? filteredSuggestions.length - 1 : prev - 1));
    }
    // Down arrow 
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev === filteredSuggestions.length - 1 ? 0 : prev + 1));
    }
    // Enter key
    else if (e.key === 'Enter' && showSuggestions) {
      e.preventDefault();
      if (filteredSuggestions[activeSuggestion]) {
        setInputValue(filteredSuggestions[activeSuggestion]);
        onSearch(filteredSuggestions[activeSuggestion]);
        setShowSuggestions(false);
      }
    }
    // Escape key
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 sm:h-5 w-4 sm:w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search conversations..."
          className="pl-10 text-sm sm:text-base bg-white border-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.trim() !== '' && setShowSuggestions(true)}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef} 
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-4 py-2 text-sm cursor-pointer ${
                index === activeSuggestion ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;
