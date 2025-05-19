import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * A simple button that sets the Nylas Grant ID via the direct route
 * This provides a one-click solution for testing without OAuth flow
 */
export function DirectGrantButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const { toast } = useToast();
  
  const handleSetDirectGrant = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/direct/set-direct-grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSet(true);
        toast({
          title: "Success",
          description: "The Grant ID has been set and your email is ready to use.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to set Grant ID",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong setting the Grant ID",
        variant: "destructive",
      });
      console.error("Error setting direct grant:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSetDirectGrant}
      disabled={isLoading || isSet}
      variant={isSet ? "default" : "outline"}
      className={isSet ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {isLoading ? "Setting..." : isSet ? "✓ Email Connected" : "Connect Email with One Click"}
    </Button>
  );
}