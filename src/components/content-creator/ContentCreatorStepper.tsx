import React from 'react';
import { cn } from '@/lib/utils';
import { Check, BookOpen, LayoutDashboard, Library } from 'lucide-react';

export type PipelineStep = 1 | 2 | 3;

export interface PipelineProgressData {
  totalLessons: number;
  generatedLessons: number;
  lessonsWithSlides: number;
}

interface ContentCreatorStepperProps {
  currentStep: PipelineStep;
  onStepChange: (step: PipelineStep) => void;
  progress?: PipelineProgressData;
}

const STEPS = [
  { step: 1 as PipelineStep, label: 'Blueprint', icon: BookOpen, description: 'Generate curriculum' },
  { step: 2 as PipelineStep, label: 'Slide Builder', icon: LayoutDashboard, description: 'Build & design' },
  { step: 3 as PipelineStep, label: 'Library', icon: Library, description: 'Manage & publish' },
];

export const ContentCreatorStepper: React.FC<ContentCreatorStepperProps> = ({
  currentStep,
  onStepChange,
  progress,
}) => {
  return (
    <div className="w-full px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {STEPS.map((s, index) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const isLast = index === STEPS.length - 1;

          return (
            <React.Fragment key={s.step}>
              <button
                onClick={() => onStepChange(s.step)}
                className={cn(
                  'flex items-center gap-2.5 group cursor-pointer transition-all duration-200',
                  isActive && 'scale-105'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-200',
                    isActive
                      ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25'
                      : isCompleted
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-muted border-border text-muted-foreground group-hover:border-primary/30'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <span
                    className={cn(
                      'text-sm font-semibold block leading-tight',
                      isActive
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                </div>
              </button>

              {!isLast && (
                <div className="flex-1 mx-2 hidden sm:block">
                  <div
                    className={cn(
                      'h-0.5 w-full rounded-full transition-colors duration-300',
                      currentStep > s.step ? 'bg-primary/40' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
