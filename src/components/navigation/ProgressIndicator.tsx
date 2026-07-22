import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  showStepNumbers?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  showStepNumbers = true
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>
      
      <Progress value={progressPercentage} className="mb-4" />
      
      {stepLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {stepLabels.map((label, index) => (
            <span 
              key={index}
              className={`${
                index + 1 <= currentStep 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground'
              }`}
            >
              {showStepNumbers && `${index + 1}. `}{label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};