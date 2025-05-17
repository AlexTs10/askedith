import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Component for manually exchanging an OAuth code for a token
 * This is used as a fallback when the automatic callback fails
 */
const ManualCodeExchange = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Function to exchange the code
  const handleExchangeCode = async () => {
    if (!code) {
      setError('Please enter an authorization code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nylas/manual-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to exchange code for token');
      }
    } catch (err) {
      console.error('Error exchanging code:', err);
      setError('An error occurred while exchanging the code');
    } finally {
      setLoading(false);
    }
  };

  // Generate auth URL for copying
  const generateAuthUrl = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nylas/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'your.email@gmail.com' }),
      });

      const data = await response.json();

      if (data.authUrl) {
        await navigator.clipboard.writeText(data.authUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Error generating URL:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manual OAuth Code Exchange</CardTitle>
        <CardDescription>
          Use this tool if the automatic callback failed during authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Manual process required</AlertTitle>
          <AlertDescription className="text-amber-700">
            Due to domain connectivity issues, you'll need to manually copy the authorization code
            from the callback URL and paste it here.
          </AlertDescription>
        </Alert>

        {!success ? (
          <>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Step 1: Get the Authorization URL</h3>
              <Button 
                variant="outline" 
                onClick={generateAuthUrl}
                className="w-full"
                disabled={loading}
              >
                {copied ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    URL Copied to Clipboard
                  </span>
                ) : loading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating URL...
                  </span>
                ) : (
                  'Copy Authorization URL'
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Step 2: Open URL and Authorize</h3>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Paste the copied URL in a new tab and press Enter</li>
                <li>Complete the Google authentication process</li>
                <li>When you reach the "We can't connect" error page, look at the URL</li>
                <li>Find and copy the <strong>code</strong> parameter (after "code=")</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Step 3: Enter Authorization Code</h3>
              <Input
                placeholder="Paste the authorization code here"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full"
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>
          </>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Connected Successfully!</span>
            </div>
            <p className="text-green-700 text-sm mt-2">
              Your email account has been connected to AskEdith and the folder structure
              has been created to organize your provider responses.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!success ? (
          <Button 
            onClick={handleExchangeCode} 
            disabled={loading || !code}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exchanging Code...
              </span>
            ) : (
              'Connect Email Account'
            )}
          </Button>
        ) : (
          <Button 
            onClick={() => window.location.href = '/email-preview'}
            className="w-full"
          >
            Continue to Email Preview
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ManualCodeExchange;