import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [_, navigate] = useLocation();

  const startWizard = () => {
    navigate('/wizard/1');
  };

  return (
    <Card className="bg-white rounded-xl shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-dark">
            Welcome to CareGuide Mini
          </h1>
          
          {/* Caring image */}
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
            alt="Caregiver helping elderly person" 
            className="rounded-lg shadow-sm w-full max-w-md mx-auto" 
          />
          
          <p className="text-lg md:text-xl text-neutral-medium">
            We'll help you find the right resources for your loved one's elder care needs.
          </p>
          
          <div className="space-y-4">
            <p className="text-neutral-medium">
              Answer 15 quick questions to get personalized recommendations and connect with service providers.
            </p>
            
            <Button 
              onClick={startWizard}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-lg shadow transition-colors text-lg w-full md:w-auto"
            >
              Start 15-Question Wizard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
