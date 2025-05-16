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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center">
      {/* Ribbon */}
      <div className="w-full bg-teal-600 text-white text-center py-1 text-sm font-medium">
        AskEdith 2.0 - Enhanced Edition
      </div>
      {/* Main content area */}
      <main className="flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-normal mb-6 text-teal-600">
            <span className="text-teal-700 font-bold">A</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }} className="text-teal-600">sk</span>
            <span className="text-teal-700 font-bold">E</span>
            <span style={{ fontSize: 'calc(100% - 2pt)' }} className="text-teal-600">dith</span>
            <span className="text-xs align-top bg-amber-100 text-amber-700 px-1 py-0.5 rounded ml-1">2.0</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 font-light mb-10">
            Share Once. Reach Many.
          </p>
          
          <div className="mb-8">
            <img 
              src={caregiverIllustration}
              alt="Caregiver helping with resources" 
              className="rounded-xl w-full max-w-xl mx-auto" 
            />
          </div>
        </div>
        
        {/* Features section */}
        <div className="text-center w-full">
          <div className="max-w-xl mx-auto">
            <p className="text-xl leading-relaxed text-gray-600 mb-8 mt-0">
              No more phone marathons. No more repeating your story. 
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
              <div className="p-5 rounded-lg border border-gray-200 bg-gray-50/60 shadow-sm">
                <HeartIcon className="w-8 h-8 text-teal-600 mb-3 mx-auto" />
                <h3 className="font-medium feature-card-header">Personalized Matches</h3>
                <p className="text-sm text-gray-600 feature-card-text">Answer Just 15 Questions.</p>
                <p className="text-sm text-gray-600 feature-card-text">See Your Curated Resources.</p>
                <p className="text-sm text-gray-600 feature-card-text">Select Who You Want to Contact.</p>
              </div>
              <div className="p-5 rounded-lg border border-gray-200 bg-gray-50/60 shadow-sm">
                <LightbulbIcon className="w-8 h-8 text-amber-500 mb-3 mx-auto" />
                <h3 className="font-medium feature-card-header">Instant Connections</h3>
                <p className="text-sm text-gray-600 feature-card-text">We Help You Write Your Story.</p>
                <p className="text-sm text-gray-600 feature-card-text">You Review Your Email Template.</p>
                <p className="text-sm text-gray-600 feature-card-text">You send to all resources once.</p>
              </div>
            </div>
            
            <Button 
              onClick={startWizard}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-lg px-8 py-6 rounded-full transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 w-full md:w-auto border-2 border-teal-400"
            >
              Let's Begin 
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-md text-gray-600 font-light mt-4">
              Takes about 5 minutes to complete.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
