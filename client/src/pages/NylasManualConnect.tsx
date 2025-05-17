import { useState, useEffect } from 'react';
import ManualCodeExchange from '@/components/ManualCodeExchange';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

/**
 * Page for manually connecting a Nylas account
 * This is a fallback option when the OAuth callback fails
 */
export default function NylasManualConnectPage() {
  const [isConnected, setIsConnected] = useState(false);
  
  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);
  
  // Function to check connection status
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/nylas/connection-status');
      const data = await response.json();
      
      setIsConnected(data.connected);
    } catch (err) {
      console.error('Error checking connection status:', err);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/nylas-test">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Nylas Test
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Manual Email Connection</h1>
      <p className="text-gray-600 mb-6">
        Use this page to manually connect your email account when the automatic callback fails.
      </p>
      
      {isConnected ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-3">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-green-800">Already Connected!</h2>
          </div>
          <p className="text-green-700 mb-4">
            Your email account is already successfully connected to AskEdith.
            You can now send emails directly from your account and organize responses into folders.
          </p>
          <Button asChild>
            <Link to="/email-preview">
              Continue to Email Preview
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ManualCodeExchange />
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Why This Is Needed</h2>
              <p className="text-blue-700 text-sm mb-2">
                Due to technical limitations with the OAuth callback URL in our development environment,
                we need to manually capture and process the authorization code.
              </p>
              <p className="text-blue-700 text-sm">
                This process is still secure, as we're using the official OAuth flow and only asking
                for the authorization code that Google has already approved.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">What to Expect</h2>
              <ul className="text-amber-700 text-sm space-y-2">
                <li>• This will connect your Gmail account to AskEdith</li>
                <li>• We'll create folders in your Gmail for each resource category</li>
                <li>• Emails will be sent directly from your account</li>
                <li>• You'll be able to see all sent emails in your Sent folder</li>
                <li>• Resource replies will be organized into the appropriate folders</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Alternative Option</h2>
              <p className="text-gray-600 text-sm mb-3">
                If you prefer not to use this manual method, you can always use our Simple Sending option,
                which doesn't require connecting your Gmail account.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/email-preview">
                  Use Simple Sending Instead
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}