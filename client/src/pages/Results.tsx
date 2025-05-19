import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Phone, Globe, MapPin, Clock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useWizardState from '@/lib/useWizardState';
import generateEmails from '@/lib/emailGenerator';
import { Resource } from '@shared/schema';
import { getDefaultImageForCategory } from '@/components/search/DefaultCategoryImages';

export default function Results() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { state, updateState } = useWizardState();
  
  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  
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
        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, []);
  
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
      console.log("Selected IDs:", state.selectedResourceIds);
      console.log("All resources:", resources);
      
      // Find selected resources
      const selectedResources = resources.filter(
        resource => state.selectedResourceIds.includes(resource.id)
      );
      
      console.log("Selected resources:", selectedResources);
      
      // Generate emails
      const emailsToSend = generateEmails(selectedResources, state.answers);
      
      console.log("Generated emails:", emailsToSend);
      
      // Update state
      updateState({ 
        emailsToSend,
        currentEmailIndex: 0
      });
      
      console.log("State updated, navigating to email preview");
      
      // Force navigation
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
      <div className="fade-in bg-amber-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Finding Your Resources</h2>
              <div className="animate-pulse">
                <svg className="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"></path>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-background/70 backdrop-blur-sm rounded-xl p-6 overflow-hidden relative animate-pulse">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                    <div className="w-full space-y-3">
                      <Skeleton className="h-7 w-48" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground text-center pt-4">
              Analyzing your responses and matching with available resources...
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="fade-in bg-amber-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-8 md:p-10 space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-destructive/10 p-4 rounded-full">
                <svg className="text-destructive w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Unable to Load Resources</h2>
              <p className="text-destructive font-medium mb-2">We encountered a problem while finding resources for you.</p>
              <p className="text-muted-foreground mb-8">{error.message}</p>
              
              <Button 
                onClick={() => navigate('/')}
                className="bg-background border border-border hover:bg-accent transition-all duration-200"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Function to group resources by category for display
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
  
  // Success state
  return (
    <div className="fade-in bg-amber-50 min-h-screen">
      {/* Header */}
      <div className="text-center pt-8 mb-4">
        <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-normal mb-2 text-teal-600">
          <span>A</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
          <span>E</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>dith</span>
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 font-light mb-2">Share Once. Reach Many.</p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="p-0">
          {/* Header section */}
          <div className="bg-teal-50 p-8 pt-10 pb-12 md:p-10 rounded-t-lg">
            <h2 className="text-2xl md:text-3xl font-serif text-teal-600 mb-4">Your Matched Resources</h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Based on your assessment, we've identified these resources that may help.
                Check the boxes to select the ones you'd like to contact.
              </p>
              <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-teal-100">
                <span className="block text-sm font-medium text-gray-500 mb-1">Share Once. Reach Many.</span>
                <span className="block text-2xl font-medium text-teal-600">{resources.length} Resources</span>
              </div>
            </div>
          </div>
          
          {/* Resources list - grouped by category */}
          <div className="p-8 md:p-10 pt-0 md:pt-0">
            <div className="space-y-8 -mt-6">
              {Object.entries(groupResourcesByCategory()).map(([category, categoryResources]) => (
                <div key={category} className="category-section mb-12">
                  {/* Category header */}
                  <div className="mb-5 mt-8">
                    <h3 className="text-lg font-semibold text-foreground/90 flex items-center">
                      <div className="h-4 w-4 bg-primary rounded-full mr-2"></div>
                      {category}
                      <span className="text-sm ml-2 text-muted-foreground">
                        ({categoryResources.length} {categoryResources.length === 1 ? 'resource' : 'resources'})
                      </span>
                    </h3>
                  </div>
                  
                  {/* Card Grid Layout for Resources with Category Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryResources.map(resource => (
                      <div 
                        key={resource.id} 
                        className={`rounded-xl overflow-hidden transition-all duration-300 h-full border border-gray-200 shadow-sm hover:shadow-md
                         ${state.selectedResourceIds.includes(resource.id) 
                           ? 'ring-2 ring-teal-500' 
                           : 'hover:border-teal-200'}`}
                        onClick={() => toggleResource(resource.id)}
                      >
                        {/* Category Image Header */}
                        <div className="relative h-36 overflow-hidden bg-gray-100">
                          <img
                            src={getDefaultImageForCategory(resource.category)}
                            alt={resource.category || "Resource Image"}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.src = "/assets/caregiver-illustration.png";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="text-xs font-medium text-white bg-teal-600/80 py-1 px-2 rounded-full inline-block backdrop-blur-sm">
                              {resource.category}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          {/* Header with checkbox and name */}
                          <div className="flex items-start gap-3 mb-3">
                            <Checkbox 
                              id={`resource-${resource.id}`}
                              checked={state.selectedResourceIds.includes(resource.id)}
                              onCheckedChange={() => toggleResource(resource.id)}
                              className="h-4 w-4 mt-1 text-teal-600"
                            />
                            
                            <div className="flex-1">
                              <h3 className="text-base font-medium text-gray-800 line-clamp-1">{resource.name}</h3>
                              <div className="mt-1 text-xs text-teal-600">
                                {resource.companyName && <span>{resource.companyName}</span>}
                              </div>
                            </div>
                          </div>
                          
                          {/* Resource details */}
                          <div className="mt-3 text-sm text-gray-600 space-y-2">
                            {resource.address && (
                              <p className="flex items-start gap-2 text-xs">
                                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                <span className="line-clamp-2">{resource.address}</span>
                              </p>
                            )}
                            
                            {resource.phone && (
                              <p className="flex items-center gap-2 text-xs">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span>{resource.phone}</span>
                              </p>
                            )}
                            
                            {resource.website && (
                              <p className="flex items-center gap-2 text-xs">
                                <Globe className="h-3.5 w-3.5 text-gray-400" />
                                <span className="truncate">{resource.website}</span>
                              </p>
                            )}
                            
                            {resource.hours && (
                              <p className="flex items-center gap-2 text-xs">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span>{resource.hours}</span>
                              </p>
                            )}
                          </div>
                          
                          {/* Email at the bottom */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="flex items-center gap-2 text-teal-600 text-xs">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{resource.email}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 space-y-4">
              <div className="bg-white p-5 rounded-lg border border-teal-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-700">
                    Selected Resources: <span className="text-teal-600">{state.selectedResourceIds.length}</span>
                  </h3>
                  {state.selectedResourceIds.length > 0 && (
                    <span className="text-xs bg-teal-50 text-teal-600 py-1 px-3 rounded-full">
                      {state.selectedResourceIds.length} {state.selectedResourceIds.length === 1 ? 'provider' : 'providers'} selected
                    </span>
                  )}
                </div>
                
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 px-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                  disabled={state.selectedResourceIds.length === 0}
                >
                  {state.selectedResourceIds.length === 0 
                    ? "Select Resources to Continue" 
                    : `Continue with ${state.selectedResourceIds.length} Selected Resources`}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="text-center text-sm text-gray-500 mt-3">
                  You'll have a chance to review and edit your message before sending
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}