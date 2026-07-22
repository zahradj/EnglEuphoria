import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { VoiceRecorder, type SpeechEvaluation } from '../VoiceRecorder';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/** Threshold of revert-tier attempts on the same lesson that triggers adaptive reinforcement. */
const REINFORCEMENT_THRESHOLD = 3;

interface SpeakingPracticeProps {
  targetSentence: string;
  hub?: 'playground' | 'academy' | 'success';
  context?: string;
  lessonId?: string;
  slideId?: string;
  minPassingTier?: 'gold' | 'soft';   // default 'soft' (>= 50)
  onComplete?: (result: SpeechEvaluation) => void;
  /**
   * Fires when the student has accumulated REINFORCEMENT_THRESHOLD or more
   * unresolved `revert` attempts on this lesson — the parent player should
   * branch into the Reinforcement Lesson Generator (needs unitId, which the
   * activity doesn't have).
   */
  onNeedsReinforcement?: (info: { revertCount: number; lessonId: string }) => void;
}

/**
 * Lesson-player slide activity that wraps <VoiceRecorder /> and:
 *  - Persists every attempt to `speech_attempts`
 *  - Auto-logs `revert` tier attempts to `mistake_repository`
 *  - Gates "Next" until the student reaches the minimum passing tier
 */
export const SpeakingPractice = ({
  targetSentence,
  hub = 'academy',
  context,
  lessonId,
  slideId,
  minPassingTier = 'soft',
  onComplete,
  onNeedsReinforcement,
}: SpeakingPracticeProps) => {
  const [bestResult, setBestResult] = useState<SpeechEvaluation | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [reinforcementFired, setReinforcementFired] = useState(false);

  const tierRank = (t: SpeechEvaluation['tier']) =>
    t === 'gold' ? 2 : t === 'soft' ? 1 : 0;
  const passes = (t: SpeechEvaluation['tier']) =>
    tierRank(t) >= tierRank(minPassingTier);

  const persist = useCallback(
    async (r: SpeechEvaluation) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      // 1. Always log the attempt
      await supabase.from('speech_attempts').insert({
        user_id: uid,
        lesson_id: lessonId ?? null,
        slide_id: slideId ?? null,
        hub,
        target_sentence: targetSentence,
        transcript: r.transcript,
        overall_score: r.overallScore,
        accuracy_score: r.accuracyScore,
        fluency_score: r.fluencyScore,
        pronunciation_score: r.pronunciationScore,
        tier: r.tier,
        feedback: r.feedback,
        word_breakdown: r.wordBreakdown,
      });

      // 2. If revert tier → push into Mistake Repository for spaced review
      if (r.tier === 'revert') {
        await supabase.from('mistake_repository').insert({
          user_id: uid,
          mistake_type: 'speaking_pronunciation',
          target_content: targetSentence,
          attempted_content: r.transcript ?? '',
          context: r.feedback,
          severity: 'high',
          source_lesson_id: lessonId ?? null,
          source_slide_id: slideId ?? null,
          metadata: {
            scores: {
              overall: r.overallScore,
              accuracy: r.accuracyScore,
              fluency: r.fluencyScore,
              pronunciation: r.pronunciationScore,
            },
            wordBreakdown: r.wordBreakdown,
            hub,
          },
        });

        // 3. Adaptive trigger: if 3+ unresolved revert attempts on this lesson,
        //    surface reinforcement to the parent player (idempotent per mount).
        if (lessonId && !reinforcementFired) {
          const { count } = await supabase
            .from('mistake_repository')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', uid)
            .eq('source_lesson_id', lessonId)
            .eq('mistake_type', 'speaking_pronunciation')
            .eq('resolved', false);

          if ((count ?? 0) >= REINFORCEMENT_THRESHOLD) {
            setReinforcementFired(true);
            toast.warning('Let\'s slow down — generating a quick reinforcement lesson.', {
              description: `${count} repeated stumbles detected on this lesson.`,
            });
            onNeedsReinforcement?.({ revertCount: count ?? 0, lessonId });
          }
        }
      }
    },
    [hub, lessonId, slideId, targetSentence, reinforcementFired, onNeedsReinforcement]
  );

  const handleResult = (r: SpeechEvaluation) => {
    setAttempts((n) => n + 1);
    setBestResult((prev) => (!prev || r.overallScore > prev.overallScore ? r : prev));
    void persist(r);
  };

  const passed = bestResult && passes(bestResult.tier);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <VoiceRecorder
        targetSentence={targetSentence}
        hub={hub}
        context={context}
        onResult={handleResult}
      />

      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-muted-foreground">
          {attempts === 0
            ? 'Take your first attempt to continue.'
            : `Attempts: ${attempts} · Best: ${bestResult?.overallScore ?? 0}/100`}
        </p>

        <Button
          disabled={!passed}
          onClick={() => bestResult && onComplete?.(bestResult)}
          className={cn(
            'transition-all',
            passed && 'bg-emerald-600 hover:bg-emerald-700 text-white'
          )}
        >
          {passed ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Continue
            </>
          ) : (
            <>
              Continue <ArrowRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SpeakingPractice;
