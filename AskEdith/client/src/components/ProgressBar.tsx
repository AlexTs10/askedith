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
      {/* Progress bar with animation - Using AskEdith teal colors */}
      <div className="relative h-1.5 bg-gray-200 overflow-hidden rounded-full">
        <div 
          className="absolute top-0 left-0 h-full bg-teal-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Removed step indicators as requested to reduce mental stress */}
    </div>
  );
}

export default ProgressBar;
