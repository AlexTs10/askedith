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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col items-center">
      {/* Main content area */}
      <main className="flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-normal mb-6 text-teal-600">
            <span>A</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>sk</span>
            <span>C</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }}>ara</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 font-light mb-10">
            Share Once. Reach Many.
          </p>
          
          <div className="mb-8 relative">
            <img 
              src={caregiverIllustration}
              alt="Caregiver helping with resources" 
              className="rounded-xl w-full max-w-lg mx-auto" 
            />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-teal-600 px-4 py-1 rounded-full text-sm font-medium shadow-sm">
              Elder care resources at your fingertips
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="text-center w-full">
          <div className="max-w-xl mx-auto space-y-6">
            <p className="text-xl leading-relaxed text-gray-600">
              Find personalized elder care resources for your loved ones through our simple guided process.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                <HeartIcon className="w-8 h-8 text-teal-600 mb-3 mx-auto" />
                <h3 className="font-medium mb-2">Personalized Matches</h3>
                <p className="text-sm text-gray-600">Custom-tailored resources based on your specific needs</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                <LightbulbIcon className="w-8 h-8 text-amber-500 mb-3 mx-auto" />
                <h3 className="font-medium mb-2">Instant Connections</h3>
                <p className="text-sm text-gray-600">Send emails to the resources you choose with one click</p>
              </div>
            </div>
            
            <Button 
              onClick={startWizard}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-8 py-6 rounded-full transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 w-full md:w-auto"
            >
              Start 15-Question Wizard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Takes about 5 minutes to complete. Your information is secure and never shared.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
