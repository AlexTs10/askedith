import { useState, useEffect } from 'react';
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
import { Mail, CheckCircle, ExternalLink } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof formSchema>;

interface NylasConnectProps {
  userEmail?: string;
  onConnect?: () => void;
}

export function NylasConnect({ userEmail, onConnect }: NylasConnectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Check if user is already connected to email
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const response = await fetch('/api/nylas/connection-status');
        const data = await response.json();
        setIsConnected(data.connected);
      } catch (error) {
        console.error('Error checking email connection status:', error);
      }
    };

    checkConnectionStatus();
  }, []);

  // Add this useEffect to listen for NYLAS_CONNECTION_SUCCESS messages
  useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NYLAS_CONNECTION_SUCCESS') {
        if (event.data.grantId) {
          localStorage.setItem('nylas_grant_id', event.data.grantId);
          fetch('/api/nylas/set-grant-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grantId: event.data.grantId }),
          });
        }
        setIsConnected(true);
      }
    };
    window.addEventListener('message', messageListener);
    return () => window.removeEventListener('message', messageListener);
  }, []);

  // Initialize form with user email if available
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: userEmail || '',
    },
  });

  // Handle form submission - will start the OAuth flow
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Important: Save the user's email to use in the authorization flow
      localStorage.setItem('nylas_auth_email', data.email);
      
      // Use the exact authenticated redirect URI you registered with Nylas
      const callbackUrl = 'https://askcara-project.elias18.repl.co/callback';
      
      console.log('Using authenticated callback URL for OAuth:', callbackUrl);
      
      // Request a Nylas OAuth URL for the provided email
      const response = await fetch('/api/nylas/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: data.email,
          // Use the full URL as the redirect URI - must match what's registered with Nylas
          redirectUri: callbackUrl
        }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to generate authorization URL');
      }
      
      const { authUrl } = await response.json();
      
      // Also store the email for personalized messaging as a backup
      await fetch('/api/store-user-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });
      
      // Close the dialog
      setIsOpen(false);
      
      // Open the Nylas authorization page in a new window
      window.open(authUrl, '_blank', 'width=800,height=600');
      
      toast({
        title: 'Email Connection Started',
        description: 'Please complete the authorization in the new window to connect your email account.',
      });
      
    } catch (error) {
      console.error('Error starting email connection:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to start the email connection process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If connected, display a different button
  if (isConnected) {
    return (
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
        disabled
      >
        <CheckCircle className="h-4 w-4" />
        Email Connected
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
        <Mail className="h-4 w-4" />
        Connect Your Email
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Your Email</DialogTitle>
            <DialogDescription>
              Connect your email account to send messages directly from your inbox and organize responses automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">What happens when you connect your email?</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>AskEdith will create an organized folder structure</li>
                <li>Emails will be sent from your account directly</li>
                <li>Replies from providers will be organized automatically</li>
                <li>Your credentials are never stored - secure OAuth is used</li>
              </ul>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Connect Email Account'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}