import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
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
        updateState({ resources: data });
        
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
    <div className="bg-amber-50 min-h-screen">
      {/* Search Header - Exactly as specified */}
      <div className="w-full bg-purple-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Search Results</h1>
              <p className="text-gray-500">Showing results for "senior support"</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-200 flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M6 12h12M9 18h6"></path>
                </svg>
                Filter
              </Button>
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">Sort</Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content with sidebar and results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Category sidebar - Exactly as specified */}
          <aside className="w-full md:w-64 md:shrink-0 mb-6 md:mb-0">
            <h2 className="font-medium text-lg pb-2 border-b border-gray-200 mb-4">Categories</h2>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category} className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveCategory(category)}
                    className={`flex items-center text-left px-3 py-2 rounded-md w-full transition-all ${
                      activeCategory === category 
                        ? 'bg-teal-50 text-teal-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    <span className="flex-grow truncate">{category}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs ml-2">
                      {categoryGroups[category].length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          
          {/* Results section - Exactly as specified */}
          <div className="flex-1">
            {categories.map(category => (
              <div 
                key={category}
                className={activeCategory === category ? 'block' : 'hidden'}
              >
                <h2 className="font-serif text-2xl text-teal-600 mb-6 flex items-center">
                  <span className="mr-2">{getCategoryIcon(category)}</span>
                  {category}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                  {categoryGroups[category].map(resource => (
                    <div 
                      key={resource.id} 
                      className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
                    >
                      {/* Image Area - Exactly as specified */}
                      <div className="h-48 relative bg-white flex items-center justify-center overflow-hidden p-4">
                        <img 
                          src={getDefaultImageForCategory(resource.category)}
                          alt={resource.category || "Resource"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/caregiver-illustration.png';
                          }}
                        />
                        <div className="absolute -top-3 right-4 bg-white text-gray-800 px-3 py-1 rounded-full text-xs border border-gray-200 shadow-sm z-10">
                          {getCategoryLabel(resource.category)}
                        </div>
                      </div>
                      
                      {/* Content Area - Exactly as specified */}
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 mb-2 min-h-[3.5rem] line-clamp-2">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {resource.address || resource.city || ""}
                        </p>
                        
                        <div className="mt-auto flex flex-wrap gap-2">
                          {resource.website && (
                            <a 
                              href={resource.website}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full transition-colors"
                            >
                              Website
                            </a>
                          )}
                          {resource.phone && (
                            <a 
                              href={`tel:${resource.phone}`}
                              className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full transition-colors"
                            >
                              Call
                            </a>
                          )}
                        </div>
                        
                        {/* Check to Contact Button - Exactly as specified */}
                        <button 
                          onClick={() => toggleResource(resource.id)}
                          className={`w-full mt-4 py-3 px-4 text-sm text-center rounded-md transition-colors ${
                            state.selectedResourceIds.includes(resource.id)
                              ? 'bg-teal-600 hover:bg-teal-700 text-white'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-800'
                          }`}
                        >
                          {state.selectedResourceIds.includes(resource.id) ? (
                            <span className="flex items-center justify-center">
                              <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
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
        
        {/* Continue button - Exactly as specified */}
        <div className="mt-8">
          <Button 
            onClick={handleContinue}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-8 rounded-md transition-colors"
            disabled={state.selectedResourceIds.length === 0}
          >
            Continue with Selected Resources
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-center text-sm text-gray-500 mt-3">
            You'll have a chance to review and edit your message before sending
          </p>
        </div>
      </div>
    </div>
  );
}