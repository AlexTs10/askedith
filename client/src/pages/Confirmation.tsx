import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Redo } from 'lucide-react';
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
    <div className="fade-in">
      <Card className="card border-0 overflow-hidden">
        <CardContent className="p-0">
          {/* Success indicator with animation */}
          <div className="bg-gradient-to-b from-success/10 to-success/5 p-10 md:p-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-success/10 w-28 h-28 animate-ping opacity-50"></div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="rounded-full bg-success/20 p-6">
                  <CheckCircle className="h-14 w-14 text-success" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">Success!</h2>
            
            <div className="max-w-md mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                <h3 className="text-xl font-medium mb-3">Messages Sent Successfully</h3>
                <p className="text-lg text-foreground/80 leading-relaxed mb-4">
                  We've notified the selected resources about your care needs.
                </p>
                
                <div className="flex items-center justify-center gap-4 p-4 border-t border-border">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    Resource providers notified
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Expect responses soon
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-8">
                Thank you for using CareGuide. Check your email for a confirmation and summary of your requests.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  className="bg-background border-border hover:bg-accent transition-all duration-200"
                  onClick={() => window.location.href = '/'}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                
                <Button 
                  onClick={handleStartOver}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                >
                  <Redo className="mr-2 h-4 w-4" />
                  Start New Assessment
                </Button>
              </div>
              
              <div className="mt-6 text-xs text-muted-foreground">
                Your information is secure and only shared with your selected resource providers.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
