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
    if (state.selectedResourceIds.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one resource to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Find selected resources
    const selectedResources = resources.filter(
      resource => state.selectedResourceIds.includes(resource.id)
    );
    
    // Generate emails
    const emailsToSend = generateEmails(selectedResources, state.answers);
    
    // Update state and navigate
    updateState({ 
      emailsToSend,
      currentEmailIndex: 0
    });
    
    navigate('/email-preview/0');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-md">
        <CardContent className="p-6 md:p-8 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark mb-6">Loading Resources...</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-neutral-light rounded-lg p-5">
                <div className="flex items-start">
                  <Skeleton className="h-5 w-5 rounded mr-3" />
                  <div className="w-full">
                    <Skeleton className="h-7 w-48 mb-3" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-md">
        <CardContent className="p-6 md:p-8 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark mb-6">Error Loading Resources</h2>
          <p className="text-error">Sorry, we couldn't load the recommended resources. Please try again later.</p>
          <p className="text-neutral-medium">{error.message}</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Success state
  return (
    <Card className="bg-white rounded-xl shadow-md">
      <CardContent className="p-6 md:p-8 space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark mb-6">Recommended Resources</h2>
        
        <p className="text-lg text-neutral-medium mb-6">
          Based on your answers, we found these resources that may be helpful. 
          Which resources would you like your email to be sent to?
        </p>
        
        <div className="space-y-4">
          {resources.map(resource => (
            <div 
              key={resource.id} 
              className={`border ${state.selectedResourceIds.includes(resource.id) ? 'border-primary' : 'border-neutral-light'} rounded-lg p-5 hover:border-primary transition-colors`}
            >
              <div className="flex items-start">
                <Checkbox 
                  id={`resource-${resource.id}`}
                  checked={state.selectedResourceIds.includes(resource.id)}
                  onCheckedChange={() => toggleResource(resource.id)}
                  className="mt-1 h-5 w-5"
                />
                <div className="ml-3 flex-1">
                  <h3 className="text-xl font-medium text-neutral-dark">{resource.category}</h3>
                  <div className="mt-2 space-y-1 text-neutral-medium">
                    <p className="font-medium">{resource.name}</p>
                    <p>{resource.address}</p>
                    <p>Hours: {resource.hours}</p>
                    <p className="text-primary">{resource.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleContinue}
          className="mt-8 w-full px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}