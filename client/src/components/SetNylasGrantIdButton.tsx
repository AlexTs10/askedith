import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings, CheckCircle } from 'lucide-react';

export function SetNylasGrantIdButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // The preset Grant ID provided by the user
  const presetGrantId = '5bd4e911-f684-4141-bc83-247e2077c9a5';

  // Handle button click to set the Grant ID
  const handleSetGrantId = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const response = await fetch('/api/nylas/set-grant-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          grantId: presetGrantId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to set Nylas Grant ID');
      }
      
      setIsSuccess(true);
      
      toast({
        title: 'Grant ID Set Successfully',
        description: 'Your Nylas Grant ID has been set and verified.',
      });
      
    } catch (error) {
      console.error('Error setting Nylas Grant ID:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to set Nylas Grant ID',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If successful, display a different button
  if (isSuccess) {
    return (
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
      >
        <CheckCircle className="h-4 w-4" />
        Nylas Connected
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSetGrantId}
      className="flex items-center gap-2"
      disabled={isLoading}
    >
      <Settings className="h-4 w-4" />
      {isLoading ? 'Setting Grant ID...' : 'Use Nylas Grant ID'}
    </Button>
  );
}