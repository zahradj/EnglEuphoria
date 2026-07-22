import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CurriculumGeneratorWizard } from './CurriculumGeneratorWizard';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export interface CurriculumContext {
  system: string;
  level: string;
  ageGroup: string;
  levelId?: string;
}

interface CurriculumStepProps {
  onNextStep: () => void;
  onCurriculumSelected?: (ctx: CurriculumContext) => void;
}

export const CurriculumStep: React.FC<CurriculumStepProps> = ({ onNextStep, onCurriculumSelected }) => {
  const [selectedContext, setSelectedContext] = useState<CurriculumContext | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleCurriculumGenerated = (ctx: { system: string; level: string; ageGroup: string }) => {
    const context: CurriculumContext = { ...ctx };
    setSelectedContext(context);
    onCurriculumSelected?.(context);
  };

  const handleClearAllCurriculum = async () => {
    setIsClearing(true);
    try {
      // Delete lessons first (they reference units)
      const { error: lessonsErr } = await supabase
        .from('curriculum_lessons')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (lessonsErr) throw lessonsErr;

      // Delete units
      const { error: unitsErr } = await supabase
        .from('curriculum_units')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (unitsErr) throw unitsErr;

      toast.success('All curriculum data cleared! Ready for fresh testing.');
      setSelectedContext(null);
    } catch (err: any) {
      console.error('Clear curriculum error:', err);
      toast.error('Failed to clear curriculum: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Step 1: Curriculum</h1>
          <p className="text-muted-foreground mt-1">
            Generate a new curriculum with AI, then move on to generate lessons.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2 shrink-0" disabled={isClearing}>
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear All Curriculum
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Curriculum Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>all curriculum units and lessons</strong> from the database.
                This action cannot be undone. Use this to prepare for a fresh test.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllCurriculum} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Clear Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {selectedContext && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm text-foreground font-medium">Selected:</span>
          <Badge variant="secondary">{selectedContext.ageGroup}</Badge>
          <Badge variant="secondary">{selectedContext.level}</Badge>
          <Badge variant="outline">{selectedContext.system}</Badge>
        </div>
      )}

      <CurriculumGeneratorWizard onCurriculumGenerated={handleCurriculumGenerated} />

      {/* Next Step CTA */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={onNextStep} size="lg" className="gap-2">
          Next: Slide Builder
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
