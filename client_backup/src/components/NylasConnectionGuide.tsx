import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Helper component that guides users through the Nylas OAuth process
 * with troubleshooting tips for common Google OAuth issues
 */
export const NylasConnectionGuide = () => {
  const [email, setEmail] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check if we're connected to Nylas
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/nylas/connection-status');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  // Start OAuth flow
  const connectNylas = async () => {
    try {
      setIsConnecting(true);
      setShowTroubleshooting(false);
      
      const response = await fetch('/api/nylas/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Open OAuth window
        window.open(data.authUrl, '_blank', 'width=800,height=600');
        
        // Start polling for connection status
        let attempts = 0;
        const checkInterval = setInterval(async () => {
          attempts++;
          
          const statusResponse = await fetch('/api/nylas/connection-status');
          const statusData = await statusResponse.json();
          
          if (statusData.connected) {
            clearInterval(checkInterval);
            setIsConnected(true);
            setIsConnecting(false);
          } else if (attempts > 20) { // 20 attempts (10 seconds each)
            clearInterval(checkInterval);
            setIsConnecting(false);
            setShowTroubleshooting(true);
          }
        }, 10000); // Check every 10 seconds
      }
    } catch (error) {
      console.error('Error connecting to Nylas:', error);
      setIsConnecting(false);
      setShowTroubleshooting(true);
    }
  };

  return (
    <div className="space-y-6">
      {isConnected ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-green-800">Email Connected</h3>
            <p className="text-sm text-green-700 mt-1">
              Your email account is successfully connected. You can now send emails directly from your account.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Connect Your Email</h2>
            <p className="text-gray-600">
              Connect your email account to send messages directly from your own email address. Recipients will see your email in the "From" field.
            </p>
            
            <div className="grid gap-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <Button 
                onClick={connectNylas} 
                disabled={!email || isConnecting}
                className="flex items-center justify-center"
              >
                {isConnecting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Connect Email
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {showTroubleshooting && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>
                <div className="space-y-3 mt-2">
                  <p>We encountered a problem connecting to your email account. This could be due to:</p>
                  
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Google's security restrictions for third-party apps</li>
                    <li>Account permission settings in your Google account</li>
                    <li>Browser pop-up blocker preventing the authentication window</li>
                  </ul>
                  
                  <p className="text-sm font-medium mt-2">Try these steps:</p>
                  
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Disable pop-up blockers in your browser</li>
                    <li>Try using Chrome or another browser</li>
                    <li>Make sure you're logged into your Gmail account</li>
                    <li>If you see a warning about an unverified app, you may need to click "Advanced" and proceed anyway</li>
                  </ol>
                  
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => connectNylas()}>
                      Try Again
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default NylasConnectionGuide;