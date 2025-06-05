
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { getAllEmailsWithAttachments } from '../../utils/emailDataUtils';
import { cn } from '@/lib/utils';

interface ToFieldAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  organization?: string;
  placeholder?: string;
  className?: string;
}

const CUSTOM_RECIPIENTS_KEY = 'customRecipients';

const ToFieldAutocomplete = ({
  value,
  onChange,
  placeholder = "e.g., Dr. Smith, Family Member (optional)",
  className
}: ToFieldAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [recipients, setRecipients] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load custom recipients from localStorage
  const loadCustomRecipients = (): string[] => {
    try {
      const stored = localStorage.getItem(CUSTOM_RECIPIENTS_KEY);
      if (stored) {
        const customRecipients = JSON.parse(stored);
        console.log('📦 Loaded custom recipients:', customRecipients);
        return customRecipients;
      }
    } catch (error) {
      console.error('Error loading custom recipients:', error);
    }
    return [];
  };

  // Save custom recipient to localStorage
  const saveCustomRecipient = (recipientName: string) => {
    try {
      const customRecipients = loadCustomRecipients();
      const existingRecipient = customRecipients.find(recipient => recipient.toLowerCase() === recipientName.toLowerCase());
      
      if (!existingRecipient) {
        const updatedRecipients = [...customRecipients, recipientName];
        localStorage.setItem(CUSTOM_RECIPIENTS_KEY, JSON.stringify(updatedRecipients));
        console.log('💾 Saved new custom recipient:', recipientName);
        
        // Update the recipients list
        setRecipients(prev => {
          const emailRecipients = prev.filter(recipient => !customRecipients.includes(recipient));
          const allCustomRecipients = loadCustomRecipients();
          return [...emailRecipients, ...allCustomRecipients].sort();
        });
      }
    } catch (error) {
      console.error('Error saving custom recipient:', error);
    }
  };

  // Extract unique recipients from email data + custom recipients
  useEffect(() => {
    console.log('🔍 ToFieldAutocomplete: Starting recipient extraction...');
    const emails = getAllEmailsWithAttachments();
    const recipientSet = new Set<string>();
    
    console.log('📧 Processing emails for recipients', { totalEmails: emails.length });
    
    emails.forEach((email, index) => {
      console.log(`📨 Email ${index + 1}:`, { 
        id: email.id, 
        recipient: email.recipient, 
        sender: email.sender.name,
        organization: email.sender.organization
      });
      
      // Extract recipient name from email strings like "Dr. Patricia Williams <dr.williams@citymedical.com>"
      let recipientName = '';
      
      if (email.recipient.includes('<')) {
        const match = email.recipient.match(/^(.+?)\s*<.*>$/);
        if (match && match[1]) {
          recipientName = match[1].trim();
        }
      } else if (!email.recipient.includes('@')) {
        recipientName = email.recipient.trim();
      }
      
      if (recipientName && recipientName !== 'you@example.com') {
        recipientSet.add(recipientName);
        console.log('✅ Added recipient:', recipientName);
      }
      
      // Also extract from sender names
      if (email.sender.name && email.sender.name !== 'Johnson Family') {
        recipientSet.add(email.sender.name);
        console.log('✅ Added sender as potential recipient:', email.sender.name);
      }
      
      // Also extract from sender organization names
      if (email.sender.organization && email.sender.organization !== 'Johnson Family') {
        recipientSet.add(email.sender.organization);
        console.log('✅ Added organization as potential recipient:', email.sender.organization);
      }
    });
    
    const emailRecipients = Array.from(recipientSet);
    
    // Load custom recipients and combine
    const customRecipients = loadCustomRecipients();
    const allRecipients = [...emailRecipients, ...customRecipients].sort();
    
    console.log('🎯 Final recipients list:', { 
      emailRecipients: emailRecipients.length,
      customRecipients: customRecipients.length,
      total: allRecipients.length, 
      recipients: allRecipients 
    });
    setRecipients(allRecipients);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    console.log('🔍 Filter effect triggered:', { value, recipients: recipients.length });
    
    if (value.trim() === '') {
      console.log('❌ Empty value, hiding suggestions');
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const searchTerm = value.toLowerCase();
    const filtered = recipients.filter(recipient => 
      recipient.toLowerCase().includes(searchTerm)
    );
    
    console.log('🎯 Filtering results:', { 
      searchTerm: `"${searchTerm}"`,
      totalRecipients: recipients.length,
      matchCount: filtered.length, 
      matches: filtered,
      willShow: filtered.length > 0
    });
    
    setFilteredSuggestions(filtered.slice(0, 8));
    setActiveSuggestion(0);
    setShowSuggestions(filtered.length > 0);
  }, [value, recipients]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        console.log('👆 Clicked outside, hiding suggestions');
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('✏️ Input changed:', { newValue });
    onChange(newValue);
    setActiveSuggestion(0);
  };

  const handleInputBlur = () => {
    // Small delay to allow for suggestion clicks
    setTimeout(() => {
      if (value.trim() && !recipients.some(recipient => recipient.toLowerCase() === value.toLowerCase())) {
        console.log('💾 Saving new recipient on blur:', value);
        saveCustomRecipient(value.trim());
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('⌨️ Key pressed:', { key: e.key, showSuggestions, suggestionsCount: filteredSuggestions.length });
    
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        e.preventDefault();
        e.stopPropagation();
        console.log('💾 Saving new recipient on Enter:', value);
        saveCustomRecipient(value.trim());
        setShowSuggestions(false);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev === 0 ? filteredSuggestions.length - 1 : prev - 1));
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev === filteredSuggestions.length - 1 ? 0 : prev + 1));
    }
    else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredSuggestions[activeSuggestion]) {
        console.log('🎯 Selected suggestion:', filteredSuggestions[activeSuggestion]);
        onChange(filteredSuggestions[activeSuggestion]);
        setShowSuggestions(false);
      }
    }
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('👆 Suggestion clicked:', suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    // Remove the setTimeout and focus call that was causing the issue
  };

  const handleInputFocus = () => {
    console.log('🎯 Input focused:', { value, hasFilteredSuggestions: filteredSuggestions.length > 0 });
    if (value.trim() !== '' && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        id="to"
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={cn(
          "text-lg py-6 border-gray-300 hover:border-gray-400 focus:border-gray-400 focus:ring-gray-400",
          className
        )}
      />

      {/* Dropdown with exact same styling as Organization field */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto z-[99999]"
          data-testid="to-autocomplete-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            zIndex: 99999
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              className={cn(
                "px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                index === activeSuggestion 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-gray-50 text-gray-900'
              )}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSuggestionClick(suggestion);
              }}
              onMouseEnter={() => setActiveSuggestion(index)}
            >
              <div className="font-medium text-sm">{suggestion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToFieldAutocomplete;
