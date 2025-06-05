
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { getAllEmailsWithAttachments } from '../../utils/emailDataUtils';
import { getAllCategories } from '../../utils/categoryUtils';
import { cn } from '@/lib/utils';

interface OrganizationFieldAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface OrganizationData {
  name: string;
  category: string;
  categoryTitle: string;
  count: number;
  isCustom?: boolean;
}

const CUSTOM_ORGANIZATIONS_KEY = 'customOrganizations';

const OrganizationFieldAutocomplete = ({
  value,
  onChange,
  placeholder = "e.g., City Hospital, ABC Clinic",
  className
}: OrganizationFieldAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<OrganizationData[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load custom organizations from localStorage
  const loadCustomOrganizations = (): OrganizationData[] => {
    try {
      const stored = localStorage.getItem(CUSTOM_ORGANIZATIONS_KEY);
      if (stored) {
        const customOrgs = JSON.parse(stored);
        console.log('📦 Loaded custom organizations:', customOrgs);
        return customOrgs.map((org: any) => ({
          ...org,
          isCustom: true
        }));
      }
    } catch (error) {
      console.error('Error loading custom organizations:', error);
    }
    return [];
  };

  // Save custom organization to localStorage
  const saveCustomOrganization = (orgName: string) => {
    try {
      const customOrgs = loadCustomOrganizations();
      const existingOrg = customOrgs.find(org => org.name.toLowerCase() === orgName.toLowerCase());
      
      if (!existingOrg) {
        const newOrg: OrganizationData = {
          name: orgName,
          category: 'other-professionals',
          categoryTitle: 'Other Professionals',
          count: 1,
          isCustom: true
        };
        
        const updatedOrgs = [...customOrgs, newOrg];
        localStorage.setItem(CUSTOM_ORGANIZATIONS_KEY, JSON.stringify(updatedOrgs));
        console.log('💾 Saved new custom organization:', orgName);
        
        // Update the organizations list
        setOrganizations(prev => {
          const emailOrgs = prev.filter(org => !org.isCustom);
          const allCustomOrgs = loadCustomOrganizations();
          return [...emailOrgs, ...allCustomOrgs].sort((a, b) => {
            if (a.category !== b.category) {
              return a.categoryTitle.localeCompare(b.categoryTitle);
            }
            if (a.count !== b.count) {
              return b.count - a.count;
            }
            return a.name.localeCompare(b.name);
          });
        });
      }
    } catch (error) {
      console.error('Error saving custom organization:', error);
    }
  };

  // Extract unique organizations from email data + custom organizations
  useEffect(() => {
    console.log('🏢 OrganizationAutocomplete: Starting organization extraction...');
    const emails = getAllEmailsWithAttachments();
    const categories = getAllCategories();
    const organizationMap = new Map<string, { category: string; count: number }>();
    
    console.log('📧 Processing emails for organizations', { totalEmails: emails.length });
    
    emails.forEach((email, index) => {
      console.log(`📨 Email ${index + 1}:`, { 
        id: email.id, 
        organization: email.sender.organization,
        category: email.category
      });
      
      if (email.sender.organization && email.sender.organization !== 'Johnson Family') {
        const orgName = email.sender.organization.trim();
        const existing = organizationMap.get(orgName);
        
        if (existing) {
          existing.count++;
        } else {
          organizationMap.set(orgName, {
            category: email.category || 'other-professionals',
            count: 1
          });
        }
        console.log('✅ Added organization:', orgName, 'Category:', email.category);
      }
    });
    
    const emailOrganizations = Array.from(organizationMap.entries()).map(([name, data]) => ({
      name,
      category: data.category,
      categoryTitle: categories[data.category]?.title || 'Other Professionals',
      count: data.count,
      isCustom: false
    }));

    // Load custom organizations and combine
    const customOrganizations = loadCustomOrganizations();
    const allOrganizations = [...emailOrganizations, ...customOrganizations].sort((a, b) => {
      // Sort by category first, then by count (descending), then alphabetically
      if (a.category !== b.category) {
        return a.categoryTitle.localeCompare(b.categoryTitle);
      }
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log('🎯 Final organizations list:', { 
      emailOrgs: emailOrganizations.length,
      customOrgs: customOrganizations.length,
      total: allOrganizations.length, 
      organizations: allOrganizations 
    });
    setOrganizations(allOrganizations);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    console.log('🔍 Filter effect triggered:', { value, organizations: organizations.length });
    
    if (value.trim() === '') {
      console.log('❌ Empty value, hiding suggestions');
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const searchTerm = value.toLowerCase();
    const filtered = organizations.filter(org => 
      org.name.toLowerCase().includes(searchTerm) ||
      org.categoryTitle.toLowerCase().includes(searchTerm)
    );
    
    console.log('🎯 Filtering results:', { 
      searchTerm: `"${searchTerm}"`,
      totalOrganizations: organizations.length,
      matchCount: filtered.length, 
      matches: filtered.map(o => ({ name: o.name, category: o.categoryTitle, isCustom: o.isCustom })),
      willShow: filtered.length > 0
    });
    
    setFilteredSuggestions(filtered.slice(0, 8));
    setActiveSuggestion(0);
    setShowSuggestions(filtered.length > 0);
  }, [value, organizations]);

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
      if (value.trim() && !organizations.some(org => org.name.toLowerCase() === value.toLowerCase())) {
        console.log('💾 Saving new organization on blur:', value);
        saveCustomOrganization(value.trim());
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('⌨️ Key pressed:', { key: e.key, showSuggestions, suggestionsCount: filteredSuggestions.length });
    
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        e.preventDefault();
        e.stopPropagation();
        console.log('💾 Saving new organization on Enter:', value);
        saveCustomOrganization(value.trim());
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
        onChange(filteredSuggestions[activeSuggestion].name);
        setShowSuggestions(false);
      }
    }
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (organization: OrganizationData) => {
    console.log('👆 Suggestion clicked:', organization);
    onChange(organization.name);
    setShowSuggestions(false);
    // Remove the setTimeout and focus call that was causing the issue
  };

  const handleInputFocus = () => {
    console.log('🎯 Input focused:', { value, hasFilteredSuggestions: filteredSuggestions.length > 0 });
    if (value.trim() !== '' && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'senior-living': 'bg-rose-100 text-rose-700',
      'home-care': 'bg-blue-100 text-blue-700',
      'government': 'bg-emerald-100 text-emerald-700',
      'attorneys': 'bg-amber-100 text-amber-700',
      'other-professionals': 'bg-indigo-100 text-indigo-700',
      'va': 'bg-teal-100 text-teal-700',
      'physical-therapy': 'bg-cyan-100 text-cyan-700',
      'paying-for-care': 'bg-lime-100 text-lime-700',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        id="organization"
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

      {/* Dropdown with category grouping */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto z-[99999]"
          data-testid="organization-autocomplete-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            zIndex: 99999
          }}
        >
          {filteredSuggestions.map((organization, index) => (
            <div
              key={`${organization.name}-${index}`}
              className={cn(
                "px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                index === activeSuggestion 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-gray-50 text-gray-900'
              )}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSuggestionClick(organization);
              }}
              onMouseEnter={() => setActiveSuggestion(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{organization.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getCategoryColor(organization.category)
                    )}>
                      {organization.categoryTitle}
                    </span>
                    <span className="text-xs text-gray-500">
                      {organization.isCustom ? 'Custom' : `${organization.count} email${organization.count !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationFieldAutocomplete;
