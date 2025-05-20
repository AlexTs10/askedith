import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function EmailConnect() {
  const [email, setEmail] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);
  
  // Function to check if connected to Nylas
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/nylas/connection-status');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };
  
  // Function to handle connecting email
  const connectEmail = async () => {
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Get auth URL
      const response = await fetch('/api/nylas/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Open auth URL in new tab
        const authWindow = window.open(data.authUrl, '_blank', 'width=800,height=600');
        
        if (!authWindow) {
          setError("Pop-up was blocked. Please allow pop-ups for this site.");
          setIsConnecting(false);
          return;
        }
        
        toast({
          title: "Authorization Window Opened",
          description: "Please complete the authentication in the new window.",
        });
        
        // Start polling for connection status
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes (10 second intervals)
        
        const checkInterval = setInterval(async () => {
          attempts++;
          const statusResponse = await fetch('/api/nylas/connection-status');
          const statusData = await statusResponse.json();
          
          if (statusData.connected) {
            clearInterval(checkInterval);
            setIsConnected(true);
            setIsConnecting(false);
            toast({
              title: "Email Connected!",
              description: "Your email has been successfully connected.",
              variant: "success",
            });
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setIsConnecting(false);
            setError("Connection timed out. Please try again.");
          }
        }, 10000); // Check every 10 seconds
      } else {
        setError("Failed to generate authentication URL");
        setIsConnecting(false);
      }
    } catch (err) {
      console.error('Error connecting to Nylas:', err);
      setError("An error occurred while trying to connect your email");
      setIsConnecting(false);
    }
  };
  
  // Helper to validate email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-6">
        <Link href="/email-preview" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Email Preview
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Connect Your Email</h1>
      
      <Card className="p-6">
        {isConnected ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Email Successfully Connected!</h2>
            <p className="text-gray-600 mb-6">
              Your email account has been connected to AskEdith. You can now send emails
              directly from your own email address.
            </p>
            <Link href="/email-preview">
              <Button>Return to Email Preview</Button>
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-2">Connect Your Google Email Account</h2>
            <p className="text-gray-600 mb-6">
              By connecting your Google email account, all emails sent through AskEdith will
              appear in your sent folder, and all responses will be organized in dedicated
              folders in your mailbox.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="your.email@gmail.com"
                  disabled={isConnecting}
                />
              </div>
              
              <Button
                onClick={connectEmail}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Connect With Google
                  </>
                )}
              </Button>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                  <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-red-800">Troubleshooting Tips:</h4>
                      <ul className="list-disc pl-5 text-sm text-red-700 mt-1 space-y-1">
                        <li>Make sure pop-ups are allowed for this site</li>
                        <li>Try using Chrome or another modern browser</li>
                        <li>If you see an "unverified app" warning, click "Advanced" and proceed</li>
                        <li>Ensure you're already logged into your Google account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Don't want to connect your email?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You can still send emails without connecting your account. Emails will be sent from our
                  system on your behalf, and the "Reply-To" will be set to your email address.
                </p>
                <Link href="/email-preview">
                  <Button variant="outline">
                    Continue Without Connecting
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}