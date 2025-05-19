import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Settings, CheckCircle } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  grantId: z.string().min(1, 'Grant ID is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface NylasGrantIdSetterProps {
  onSet?: () => void;
}

export function NylasGrantIdSetter({ onSet }: NylasGrantIdSetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grantId: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const response = await fetch('/api/nylas/set-grant-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          grantId: data.grantId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to set Nylas Grant ID');
      }
      
      // Close the dialog
      setIsOpen(false);
      setIsSuccess(true);
      
      toast({
        title: 'Grant ID Set Successfully',
        description: 'Your Nylas Grant ID has been set and verified.',
      });
      
      if (onSet) {
        onSet();
      }
      
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
        Grant ID Set
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Set Nylas Grant ID
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Nylas Grant ID</DialogTitle>
            <DialogDescription>
              Enter the Nylas Grant ID to use for testing email functionality.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">For Testing Purposes Only</p>
              <p className="text-muted-foreground">
                This will set the Nylas Grant ID directly in your session, bypassing the normal OAuth flow.
              </p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="grantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nylas Grant ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Nylas Grant ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Setting Grant ID...' : 'Set Grant ID'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}