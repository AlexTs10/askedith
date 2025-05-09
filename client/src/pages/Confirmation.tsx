import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import useWizardState from '@/lib/useWizardState';

export default function Confirmation() {
  const [_, navigate] = useLocation();
  const { resetState } = useWizardState();
  
  // Handle starting over
  const handleStartOver = () => {
    resetState();
    navigate('/');
  };
  
  return (
    <Card className="bg-white rounded-xl shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center bg-success bg-opacity-10 p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">Your messages were sent!</h2>
          
          <p className="text-lg text-neutral-medium">
            We've notified the selected resources about your needs. Expect to hear back from them soon.
          </p>
          
          {/* Healthcare professional image */}
          <img 
            src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
            alt="Healthcare professional meeting with elderly client" 
            className="rounded-lg shadow-sm w-full max-w-md mx-auto my-4" 
          />
          
          <p className="text-neutral-medium">
            Check your email for a confirmation and summary of your requests.
          </p>
          
          <Button 
            onClick={handleStartOver}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors mt-4"
          >
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
