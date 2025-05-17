import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Copy, ExternalLink, Check } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NylasSetupPage() {
  const [currentDomain, setCurrentDomain] = useState('');
  const [copied, setCopied] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get the current domain dynamically from the browser
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const callbackUrl = `${protocol}//${hostname}/callback`;
    setCurrentDomain(callbackUrl);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Nylas OAuth Setup</h1>
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Important Setup Required</AlertTitle>
        <AlertDescription>
          To use Nylas for email integration, you must register your current callback URL in the 
          Nylas dashboard. This ensures OAuth can redirect back to your application correctly.
        </AlertDescription>
      </Alert>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Register Your Callback URL</CardTitle>
          <CardDescription>
            Follow these steps to update your Nylas application settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-4 mb-6">
            <li>Log in to the <a href="https://dashboard.nylas.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Nylas Dashboard</a></li>
            <li>Navigate to your application settings</li>
            <li>Find the "Redirect URIs" or "Callback URLs" section</li>
            <li>Add the following URL to the allowed redirect URIs:</li>
            <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between">
              <code className="text-sm font-mono">{currentDomain}</code>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyToClipboard}
                className="ml-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <li>Save your changes in the Nylas dashboard</li>
          </ol>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <p className="font-medium text-amber-800 mb-2">Why is this needed?</p>
            <p className="text-amber-700">
              For security reasons, OAuth providers only redirect to pre-approved URLs.
              Since your application URL may change in Replit, you need to update 
              the allowed redirect URLs in Nylas to match your current domain.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => window.open('https://dashboard.nylas.com', '_blank')} 
          className="flex-1"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Nylas Dashboard
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setLocation('/nylas-test')}
          className="flex-1"
        >
          Continue to Nylas Test
        </Button>
      </div>
    </div>
  );
}