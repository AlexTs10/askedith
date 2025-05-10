import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useWizardState from '@/lib/useWizardState';
import generateEmails from '@/lib/emailGenerator';
import { Resource } from '@shared/schema';

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
      <div className="fade-in">
        <Card className="card border-0">
          <CardContent className="p-8 md:p-10 space-y-8">
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
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="fade-in">
        <Card className="card border-0">
          <CardContent className="p-8 md:p-10 space-y-6">
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
          </CardContent>
        </Card>
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
    <div className="fade-in bg-gradient-to-b from-amber-50 to-white min-h-screen">
      {/* Header */}
      <div className="text-center pt-8 mb-4">
        <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-normal mb-2 text-teal-600">
          <span>A</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
          <span>C</span>
          <span style={{ fontSize: 'calc(100% - 2pt)' }}>ara</span>
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 font-light mb-2">Share Once. Reach Many.</p>
      </div>

      <Card className="card bg-transparent border-0 shadow-none max-w-6xl mx-auto">
        <CardContent className="p-0">
          {/* Header section */}
          <div className="bg-teal-50 p-8 pt-10 pb-12 md:p-10 rounded-t-lg">
            <h2 className="text-2xl md:text-3xl font-serif text-teal-600 mb-4">Your Matched Resources</h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Based on your assessment, we've identified these resources that may help.
              Select the ones you'd like to contact.
            </p>
          </div>
          
          {/* Resources list - grouped by category */}
          <div className="p-8 md:p-10 pt-0 md:pt-0">
            <div className="space-y-8 -mt-6">
              {Object.entries(groupResourcesByCategory()).map(([category, categoryResources]) => (
                <div key={category} className="category-section">
                  {/* Category header */}
                  <div className="mb-4 mt-8">
                    <h3 className="text-lg font-semibold text-foreground/90 flex items-center">
                      <div className="h-4 w-4 bg-primary rounded-full mr-2"></div>
                      {category}
                      <span className="text-sm ml-2 text-muted-foreground">
                        ({categoryResources.length} {categoryResources.length === 1 ? 'resource' : 'resources'})
                      </span>
                    </h3>
                  </div>
                  
                  {/* Card Grid Layout for Resources - Changed to 2 cards per row as requested */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {categoryResources.map(resource => (
                      <div 
                        key={resource.id} 
                        className={`bg-white border border-gray-100 rounded-lg p-5 transition-all duration-300 shadow-sm h-full
                         ${state.selectedResourceIds.includes(resource.id) 
                           ? 'ring-2 ring-teal-600/30 border-teal-600/30 shadow-md' 
                           : 'hover:border-teal-100 hover:shadow-md hover:bg-amber-50/20'}`}
                        onClick={() => toggleResource(resource.id)}
                      >
                        <div className="flex flex-col h-full">
                          {/* Header with checkbox and name */}
                          <div className="flex items-start gap-3 mb-3">
                            <Checkbox 
                              id={`resource-${resource.id}`}
                              checked={state.selectedResourceIds.includes(resource.id)}
                              onCheckedChange={() => toggleResource(resource.id)}
                              className="h-4 w-4 mt-1"
                            />
                            
                            <div>
                              <h3 className="text-lg font-serif text-teal-600 line-clamp-1">{resource.name}</h3>
                              <div className="mt-1 text-xs font-medium text-teal-600 bg-teal-50 py-1 px-2 rounded-full inline-block">
                                Recommended Match
                              </div>
                            </div>
                          </div>
                          
                          {/* Resource details with smaller font size as requested */}
                          <div className="mt-2 text-xs text-gray-600 space-y-2 flex-grow">
                            <p className="flex items-start gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0 mt-1">
                                <path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                                <path d="M8 2h8"></path>
                                <path d="M12 10v4"></path>
                                <path d="M12 18h.01"></path>
                              </svg>
                              <span>{resource.address}</span>
                            </p>
                            
                            <p className="flex items-start gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0 mt-1">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>{resource.hours}</span>
                            </p>
                          </div>
                          
                          {/* Email at the bottom */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="flex items-center gap-2 text-teal-600 text-xs">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                              </svg>
                              <span>{resource.email}</span>
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
              <Button 
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 px-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                disabled={state.selectedResourceIds.length === 0}
              >
                Continue with Selected Resources
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                You'll have a chance to review and edit your message before sending
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}