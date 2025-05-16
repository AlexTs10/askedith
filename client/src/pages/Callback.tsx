import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Loader } from 'lucide-react';

export default function NylasCallback() {
  const [_, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your email authorization...');
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract the code from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (!code) {
          setStatus('error');
          setMessage('No authorization code found in the callback URL.');
          return;
        }
        
        console.log('Authorization code received:', code);
        
        // Use the exact same redirect URI that we registered with Nylas
        // This MUST match exactly what was used in the auth URL generation
        const callbackUrl = 'https://askcara-project.elias18.repl.co/callback';
        
        console.log('Using registered callback URL for token exchange:', callbackUrl);
        
        // Send the code to the backend with the exact same redirect URI
        const response = await fetch(`/api/nylas/callback?code=${code}&redirect_uri=${encodeURIComponent(callbackUrl)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to complete authorization');
        }
        
        console.log('Authorization successful:', data);
        setStatus('success');
        setMessage('Your email has been successfully connected to AskEdith!');
      } catch (error) {
        console.error('Error processing callback:', error);
        setStatus('error');
        setMessage('Failed to connect your email account. Please try again.');
      }
    };
    
    processCallback();
  }, []);
  
  const returnToApp = () => {
    // Navigate back to the email preview page
    navigate('/email-preview/0');
  };
  
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl font-normal tracking-normal mb-2 text-teal-600">
            <span>A</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
            <span>E</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>dith</span>
          </h1>
          <p className="text-xl text-gray-600 font-light">Email Connection</p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6 px-6 pb-8">
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              {status === 'loading' && (
                <div className="animate-spin mb-4">
                  <Loader className="h-12 w-12 text-teal-500" />
                </div>
              )}
              
              {status === 'success' && (
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
              )}
              
              {status === 'error' && (
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <svg className="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              
              <h2 className="text-xl font-medium">
                {status === 'loading' ? 'Connecting Your Email' : 
                 status === 'success' ? 'Email Connected!' : 
                 'Connection Failed'}
              </h2>
              
              <p className="text-gray-600 mb-2">{message}</p>
              
              {status !== 'loading' && (
                <Button onClick={returnToApp} className="mt-4 px-4 py-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Email Composer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}