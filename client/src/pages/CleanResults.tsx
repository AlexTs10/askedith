import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Filter, Check, ImageOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useWizardState from '@/lib/useWizardState';
import generateEmails from '@/lib/emailGenerator';
import { Resource } from '@shared/schema';
import { getDefaultImageForCategory, getCategoryLabel, getCategoryIcon } from '@/components/search/DefaultCategoryImages';

export default function CleanResults() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { state, updateState } = useWizardState();
  
  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        console.log("Fetching resources...");
        const response = await fetch('/api/resources');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Resources fetched:", data);
        
        setResources(data);
        
        // Make sure we start with no selected resources
        updateState({ 
          resources: data,
          selectedResourceIds: [] // Initialize as empty to ensure no resources are pre-selected
        });
        
        // Set first category as active by default
        const categories = getCategoriesFromResources(data);
        if (categories.length > 0) {
          setActiveCategory(categories[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, []);
  
  // Get unique categories from resources
  const getCategoriesFromResources = (resourceList: Resource[]): string[] => {
    const categories = new Set<string>();
    resourceList.forEach(resource => {
      if (resource.category) {
        categories.add(resource.category);
      }
    });
    return Array.from(categories);
  };
  
  // Function to group resources by category
  const groupResourcesByCategory = () => {
    const grouped: Record<string, Resource[]> = {};
    resources.forEach(resource => {
      if (!grouped[resource.category]) {
        grouped[resource.category] = [];
      }
      grouped[resource.category].push(resource);
    });
    return grouped;
  };
  
  // Handle resource selection
  const toggleResource = (id: number) => {
    const isSelected = state.selectedResourceIds.includes(id);
    let newSelectedIds: number[];
    
    if (isSelected) {
      newSelectedIds = state.selectedResourceIds.filter(resourceId => resourceId !== id);
    } else {
      newSelectedIds = [...state.selectedResourceIds, id];
    }
    
    updateState({ selectedResourceIds: newSelectedIds });
  };
  
  // Handle continue button
  const handleContinue = () => {
    console.log("Continue button clicked");
    
    if (state.selectedResourceIds.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one resource to continue",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Find selected resources
      const selectedResources = resources.filter(
        resource => state.selectedResourceIds.includes(resource.id)
      );
      
      // Generate emails
      const emailsToSend = generateEmails(selectedResources, state.answers);
      
      // Update state
      updateState({ 
        emailsToSend,
        currentEmailIndex: 0
      });
      
      // Navigate to email preview
      window.location.href = '/email-preview/0';
    } catch (error) {
      console.error("Error in handleContinue:", error);
      toast({
        title: "Error",
        description: "Something went wrong preparing your emails. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/3 mb-6"></div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <svg className="text-red-600 w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Unable to Load Resources</h2>
            <p className="text-red-600 font-medium mb-2">We encountered a problem while finding resources for you.</p>
            <p className="text-gray-600 mb-6">{error.message}</p>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Get categories
  const categoryGroups = groupResourcesByCategory();
  const categories = Object.keys(categoryGroups);
  
  // Success state with clean design based on detailed specs
  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Bar - Fixed to top, white background with bottom border */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-serif text-xl text-teal-600">AskEdith</div>
            <div className="flex space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-teal-600">Sign In</Button>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">Sign Up</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Header - Light gray background */}
      <div className="pt-16 bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-2xl text-teal-600 mb-1">Search Results</h1>
              <p className="text-gray-600">Showing results for "senior support"</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-300 flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Sort</Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content with sidebar and results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Category sidebar - Width of 64 (w-64) with right margin */}
          <aside className="w-full md:w-64 md:flex-shrink-0">
            <h2 className="font-medium text-lg text-gray-900 mb-4">Categories</h2>
            <nav className="space-y-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors ${
                    activeCategory === category 
                      ? 'bg-teal-50 text-teal-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{getCategoryIcon(category)}</span>
                    <span className="text-sm">{category}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === category 
                      ? 'bg-teal-100 text-teal-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {categoryGroups[category].length}
                  </span>
                </button>
              ))}
            </nav>
          </aside>
          
          {/* Results section */}
          <div className="flex-1 min-w-0">
            {categories.map(category => (
              <div 
                key={category}
                className={activeCategory === category ? 'block' : 'hidden'}
              >
                <h2 className="font-serif text-2xl text-teal-600 mb-6 flex items-center">
                  <span className="mr-3">{getCategoryIcon(category)}</span>
                  {category}
                </h2>
                
                {/* Two columns on desktop, one on tablet and mobile with gap-8 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {categoryGroups[category].map(resource => (
                    <div 
                      key={resource.id} 
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Logo/image area - 48px height as specified */}
                      <div className="h-48 bg-white flex items-center justify-center p-4">
                        <img 
                          src={`https://logo.dev/${encodeURIComponent(resource.companyName || resource.name)}`}
                          alt={`${resource.name} logo`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            // Fallback to category-specific default image
                            e.currentTarget.src = getDefaultImageForCategory(resource.category);
                            e.currentTarget.onerror = (e2) => {
                              // Final fallback: show ImageOff icon
                              const target = e2.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const iconDiv = document.createElement('div');
                                iconDiv.className = 'fallback-icon flex items-center justify-center w-full h-full text-gray-400';
                                iconDiv.innerHTML = '<svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 9 3 3m0 0 3 3m-3-3 3-3m-3 3-3 3M3 18V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>';
                                parent.appendChild(iconDiv);
                              }
                            };
                          }}
                        />
                      </div>
                      
                      {/* Content area with padding of 4 (p-4) */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 text-lg">
                          {resource.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {resource.address}
                        </p>
                        
                        {/* Contact info */}
                        <div className="space-y-2 mb-4">
                          {resource.website && (
                            <a 
                              href={resource.website}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-teal-600 hover:text-teal-700 text-sm inline-block"
                            >
                              Visit Website →
                            </a>
                          )}
                          {resource.phone && (
                            <div className="text-gray-600 text-sm">
                              {resource.phone}
                            </div>
                          )}
                        </div>
                        
                        {/* Check to Contact button at bottom */}
                        <button 
                          onClick={() => toggleResource(resource.id)}
                          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            state.selectedResourceIds.includes(resource.id)
                              ? 'bg-teal-600 text-white hover:bg-teal-700'
                              : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                          }`}
                        >
                          {state.selectedResourceIds.includes(resource.id) ? (
                            <span className="flex items-center justify-center">
                              <Check className="h-4 w-4 mr-2" />
                              Selected to Contact
                            </span>
                          ) : (
                            "Check to Contact"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Continue button */}
        {state.selectedResourceIds.length > 0 && (
          <div className="mt-12 text-center">
            <Button 
              onClick={handleContinue}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
            >
              Continue with {state.selectedResourceIds.length} Selected Resource{state.selectedResourceIds.length !== 1 ? 's' : ''}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-gray-600 text-sm mt-3">
              You'll have a chance to review and edit your message before sending
            </p>
          </div>
        )}
      </div>

      {/* Footer - Light gray background with top border */}
      <footer className="bg-gray-100 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo section */}
            <div>
              <div className="font-serif text-xl text-teal-600 mb-4">AskEdith</div>
              <p className="text-gray-600 text-sm">
                Connecting seniors and their families with the support they need.
              </p>
            </div>
            
            {/* Links section */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-teal-600">About Us</a></li>
                <li><a href="#" className="hover:text-teal-600">How It Works</a></li>
                <li><a href="#" className="hover:text-teal-600">Resources</a></li>
                <li><a href="#" className="hover:text-teal-600">Contact</a></li>
              </ul>
            </div>
            
            {/* Copyright section */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-teal-600">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-600">Terms of Service</a></li>
              </ul>
              <p className="text-gray-500 text-xs mt-6">
                © 2024 AskEdith. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}