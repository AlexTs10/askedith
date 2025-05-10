import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  // Generate steps for the progress indicators
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className="space-y-3">
      {/* Progress bar with animation - Using AskCara teal colors */}
      <div className="relative h-1.5 bg-gray-200 overflow-hidden rounded-full">
        <div 
          className="absolute top-0 left-0 h-full bg-teal-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators - Mobile and desktop friendly */}
      <div className="hidden md:flex justify-between px-2 max-w-lg mx-auto">
        {steps.slice(0, Math.min(10, totalSteps)).map(step => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              step < currentStep 
                ? 'bg-teal-600' 
                : step === currentStep 
                  ? 'bg-teal-600 ring-2 ring-teal-200' 
                  : 'bg-gray-200'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressBar;
