import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { SlidePhase, PHASE_COLORS } from '@/services/slideSkeletonEngine';
import { cn } from '@/lib/utils';

interface LessonStructureValidatorProps {
  slidePhases: Array<{ slideNumber: number; phase: SlidePhase; title: string }>;
}

interface ValidationResult {
  type: 'error' | 'warning' | 'pass';
  message: string;
}

function validateLessonStructure(phases: Array<{ phase: SlidePhase }>): ValidationResult[] {
  const results: ValidationResult[] = [];
  const phaseList = phases.map(p => p.phase);

  // Check: Must have at least one Prime before any Produce
  const firstProduceIndex = phaseList.indexOf('produce');
  const firstPrimeIndex = phaseList.indexOf('prime');
  const firstMimicIndex = phaseList.indexOf('mimic');

  if (firstProduceIndex >= 0 && (firstPrimeIndex < 0 || firstPrimeIndex > firstProduceIndex)) {
    results.push({
      type: 'error',
      message: 'A Prime slide must appear before any Produce slide. Students need visual recognition first.',
    });
  }

  // Check: Must have at least one Mimic before any Produce
  if (firstProduceIndex >= 0 && (firstMimicIndex < 0 || firstMimicIndex > firstProduceIndex)) {
    results.push({
      type: 'warning',
      message: 'Warning: Students may struggle without a Mimic phase before Production. Add a phonetic accuracy step.',
    });
  }

  // Check: Should have at least one Warm-Up
  if (!phaseList.includes('warmup')) {
    results.push({
      type: 'warning',
      message: 'No Warm-Up phase detected. A song or chant helps lower the affective filter.',
    });
  }

  // Check: Should have at least one Cool-Off
  if (!phaseList.includes('cooloff')) {
    results.push({
      type: 'warning',
      message: 'No Cool-Off phase. A brain break helps consolidate learning into long-term memory.',
    });
  }

  // Check: Phase order should generally flow warmup → prime → mimic → produce → cooloff
  const phaseOrder: SlidePhase[] = ['warmup', 'prime', 'mimic', 'produce', 'cooloff'];
  let lastPhaseOrder = -1;
  let outOfOrder = false;
  for (const p of phaseList) {
    const idx = phaseOrder.indexOf(p);
    if (idx < lastPhaseOrder && idx >= 0) {
      outOfOrder = true;
      break;
    }
    if (idx >= 0) lastPhaseOrder = idx;
  }

  if (outOfOrder) {
    results.push({
      type: 'warning',
      message: 'Phase order appears non-standard. Recommended: Warm-Up → Prime → Mimic → Produce → Cool-Off.',
    });
  }

  if (results.length === 0) {
    results.push({
      type: 'pass',
      message: '✅ Lesson follows the Scaffolded Mastery structure. All phases are in order.',
    });
  }

  return results;
}

export const LessonStructureValidator: React.FC<LessonStructureValidatorProps> = ({
  slidePhases,
}) => {
  const results = validateLessonStructure(slidePhases);

  // Phase counts
  const phaseCounts = slidePhases.reduce((acc, s) => {
    acc[s.phase] = (acc[s.phase] || 0) + 1;
    return acc;
  }, {} as Record<SlidePhase, number>);

  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5" /> Science Check
      </h4>

      {/* Phase summary */}
      <div className="flex flex-wrap gap-1.5">
        {(['warmup', 'prime', 'mimic', 'produce', 'cooloff'] as SlidePhase[]).map((phase) => {
          const config = PHASE_COLORS[phase];
          const count = phaseCounts[phase] || 0;
          return (
            <span
              key={phase}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium',
                config.bg, config.text,
                count === 0 && 'opacity-40'
              )}
            >
              {config.label} ×{count}
            </span>
          );
        })}
      </div>

      {/* Validation results */}
      <div className="space-y-1.5">
        {results.map((result, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-2 text-xs p-2 rounded',
              result.type === 'error' && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
              result.type === 'warning' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
              result.type === 'pass' && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
            )}
          >
            {result.type === 'error' && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
            {result.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
            {result.type === 'pass' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
            <span>{result.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
