import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Key, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendGridSetupProps {
  onSuccess?: () => void;
}

export default function SendGridSetup({ onSuccess }: SendGridSetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your SendGrid API key');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/setup-sendgrid', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        toast({
          title: "SendGrid Configured",
          description: "Your API key has been set up successfully",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(data.message || 'Failed to configure SendGrid API key');
      }
    } catch (err) {
      console.error('SendGrid setup error:', err);
      setError('An error occurred while setting up SendGrid');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="max-w-md mx-auto border-amber-200">
      <CardHeader className="bg-amber-50">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-800">SendGrid API Setup</CardTitle>
        </div>
        <CardDescription>
          Configure your SendGrid API key to enable email sending for AskCara
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              SendGrid has been configured successfully. Your emails will now be sent through SendGrid.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">SendGrid API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="SG.xxxxxx..."
                  className="text-xl"
                  required
                />
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                <div className="flex gap-2 items-start">
                  <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Your API key is stored securely and only used for sending emails through
                    SendGrid's service. <a href="https://sendgrid.com/docs/ui/account-and-settings/api-keys/" 
                    target="_blank" rel="noopener noreferrer" 
                    className="text-teal-600 hover:underline">
                      Learn how to get a SendGrid API key
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-end">
        {!success && (
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={loading || !apiKey.trim()}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading ? 'Setting up...' : 'Configure SendGrid'}
          </Button>
        )}
        
        {success && onSuccess && (
          <Button onClick={onSuccess}>
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}