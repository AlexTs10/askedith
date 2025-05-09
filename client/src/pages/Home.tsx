import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, LightbulbIcon, HeartIcon } from 'lucide-react';
import caregiverIllustration from '../assets/caregiver-illustration.png';

export default function Home() {
  const [_, navigate] = useLocation();

  const startWizard = () => {
    navigate('/wizard/1');
  };

  return (
    <div className="fade-in">
      <Card className="card overflow-hidden border-0">
        <CardContent className="p-0">
          {/* Top section with illustration */}
          <div className="bg-gradient-to-b from-accent to-accent/30 p-8 md:p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                Welcome to CareGuide
              </h1>
              
              <div className="mb-8 relative">
                <img 
                  src={caregiverIllustration}
                  alt="Caregiver helping with resources" 
                  className="rounded-xl w-full max-w-lg mx-auto" 
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary/90 text-secondary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Helping you find the right care resources
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom section with content */}
          <div className="p-8 md:p-12 text-center">
            <div className="max-w-xl mx-auto space-y-6">
              <p className="text-xl leading-relaxed">
                Find personalized elder care resources for your loved ones through our simple guided process.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                <div className="bg-background/80 p-5 rounded-xl border border-border">
                  <HeartIcon className="w-8 h-8 text-primary mb-3 mx-auto" />
                  <h3 className="font-medium mb-2">Personalized Matches</h3>
                  <p className="text-sm text-muted-foreground">Custom-tailored resources based on your specific needs</p>
                </div>
                <div className="bg-background/80 p-5 rounded-xl border border-border">
                  <LightbulbIcon className="w-8 h-8 text-secondary mb-3 mx-auto" />
                  <h3 className="font-medium mb-2">Instant Connections</h3>
                  <p className="text-sm text-muted-foreground">Send emails to the resources you choose with one click</p>
                </div>
              </div>
              
              <Button 
                onClick={startWizard}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 w-full md:w-auto"
              >
                Start 15-Question Wizard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Takes about 5 minutes to complete. Your information is secure and never shared.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
