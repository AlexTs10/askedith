import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * A component for testing the Nylas connection
 */
export function NylasTestConnect() {
  const [userEmail, setUserEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Function to check connection status
  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nylas/connection-status');
      const data = await response.json();
      setConnected(data.connected);
    } catch (err) {
      console.error('Error checking connection status:', err);
      setError('Failed to check connection status');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle connection
  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      
      // Get the auth URL
      const response = await fetch('/api/nylas/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Open the auth URL in a new window
        window.open(data.authUrl, '_blank');
        
        // Start polling for connection status
        let attempts = 0;
        const maxAttempts = 30; // Poll for 5 minutes (10 second intervals)
        const pollInterval = setInterval(async () => {
          attempts++;
          
          // Check if we're connected
          const statusResponse = await fetch('/api/nylas/connection-status');
          const statusData = await statusResponse.json();
          
          if (statusData.connected) {
            // We're connected!
            clearInterval(pollInterval);
            setConnected(true);
            setConnecting(false);
          } else if (attempts >= maxAttempts) {
            // Timeout
            clearInterval(pollInterval);
            setConnecting(false);
            setError('Connection timeout. Please try again.');
          }
        }, 10000); // Check every 10 seconds
      } else {
        setError('Failed to get authentication URL');
        setConnecting(false);
      }
    } catch (err) {
      console.error('Error connecting to Nylas:', err);
      setError('Failed to connect to email provider');
      setConnecting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Nylas Email Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>Checking connection...</span>
          </div>
        ) : connected ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Connected to email provider</span>
          </div>
        ) : (
          <div className="flex items-center text-red-500">
            <XCircle className="h-5 w-5 mr-2" />
            <span>Not connected</span>
          </div>
        )}
      </div>
      
      {/* Connect Form */}
      {!connected && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Connect Your Email</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md w-full"
                placeholder="your.email@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                We'll connect to this email account via Nylas.
              </p>
            </div>
            
            <div>
              <Button 
                onClick={handleConnect}
                disabled={connecting || !userEmail}
                className="w-full"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Email'
                )}
              </Button>
              
              {connecting && (
                <p className="text-sm text-gray-500 mt-2">
                  A popup window will open to authenticate with your email provider.
                  Please complete the authentication process in that window.
                </p>
              )}
              
              {error && (
                <p className="text-sm text-red-500 mt-2">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Refresh Connection */}
      <div className="mt-4">
        <Button 
          variant="outline" 
          onClick={checkConnectionStatus} 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Connection Status'
          )}
        </Button>
      </div>
    </div>
  );
}

export default NylasTestConnect;