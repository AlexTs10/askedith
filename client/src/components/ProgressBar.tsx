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
      {/* Progress bar with animation */}
      <div className="relative h-2.5 bg-muted overflow-hidden rounded-full">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-shimmer" 
            style={{ 
              '--shimmer-size': '150%',
              animationDuration: '1.5s', 
              backgroundSize: '150% 100%',
              backgroundPosition: '-50% 0'
            } as React.CSSProperties}
          />
        </div>
      </div>
      
      {/* Step indicators */}
      <div className="hidden md:flex justify-between px-2">
        {steps.map(step => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              step < currentStep 
                ? 'bg-primary scale-75' 
                : step === currentStep 
                  ? 'bg-primary scale-100 ring-2 ring-primary/30' 
                  : 'bg-muted scale-75'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressBar;
