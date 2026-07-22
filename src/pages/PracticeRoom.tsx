// Practice Room — full-screen FSRS review session.
// Hub-aware via route, but content is identical: a one-card-at-a-time deck
// where each card is rated 1..5 confidence and FSRS schedules the next review.

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ConfidenceRater, type Confidence } from '@/components/memory/ConfidenceRater';
import { supabase } from '@/integrations/supabase/client';
import { scheduleFsrs, type FsrsState } from '@/memory/fsrs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DeckItem {
  id: string;
  skill_key: string;
  skill_kind: string;
  hub: string | null;
  cefr: string | null;
  last_context: Record<string, unknown> | null;
  fsrs_state: FsrsState | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

export default function PracticeRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deck, setDeck] = useState<DeckItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from('memory_items')
        .select('id, skill_key, skill_kind, hub, cefr, last_context, fsrs_state, ease_factor, interval_days, repetitions')
        .eq('student_id', user.id)
        .lte('next_due_at', new Date().toISOString())
        .order('next_due_at', { ascending: true })
        .limit(20);
      if (error) toast.error('Could not load your review deck.');
      else setDeck((data ?? []) as unknown as DeckItem[]);
      setLoading(false);
    })();
  }, [user?.id]);

  const current = deck[idx];

  const handleRate = useCallback(
    async (rating: Confidence) => {
      if (!current || !user?.id) return;
      const updated = scheduleFsrs(
        {
          ...current,
          student_id: user.id,
          hub: (current.hub as any) ?? 'academy',
          cefr: (current.cefr as any) ?? undefined,
          skill_kind: current.skill_kind as any,
          skill_key: current.skill_key,
          memory_strength: 0,
          active_mastery: 0,
          passive_mastery: 0,
          speaking_retention: 0,
          pronunciation_retention: 0,
          ease_factor: current.ease_factor,
          interval_days: current.interval_days,
          repetitions: current.repetitions,
          forgetting_risk: 0,
          recall_level: 1,
          spiral_stage: 0,
          last_context: (current.last_context as any) ?? undefined,
          fsrs_state: current.fsrs_state ?? null,
        } as any,
        rating,
      );

      const { error } = await supabase
        .from('memory_items')
        .update({
          fsrs_state: updated.fsrs_state as unknown as object,
          ease_factor: updated.ease_factor,
          interval_days: updated.interval_days,
          repetitions: updated.repetitions,
          last_seen_at: updated.last_seen_at,
          next_due_at: updated.next_due_at,
          predicted_decay_at: updated.predicted_decay_at,
          forgetting_risk: updated.forgetting_risk,
        })
        .eq('id', current.id);
      if (error) toast.error('Save failed.');

      // Log review history (best-effort)
      await supabase.from('memory_review_history').insert({
        memory_item_id: current.id,
        student_id: user.id,
        rating,
        scheduled_interval_days: updated.interval_days,
      }).then(() => {}, () => {});

      setRevealed(false);
      setIdx((i) => i + 1);
    },
    [current, user?.id],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your warm-up…</p>
      </div>
    );
  }

  if (deck.length === 0 || idx >= deck.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
          <Check className="w-8 h-8 text-success" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold">All caught up!</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          {deck.length === 0
            ? 'No reviews are due right now. Come back tomorrow.'
            : 'You finished today\'s warm-up. Great work.'}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const progress = (idx / deck.length) * 100;
  const example = (current.last_context as any)?.example as string | undefined;
  const audioUrl = (current.last_context as any)?.audio_url as string | undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Exit
        </Button>
        <p className="text-xs text-muted-foreground">
          {idx + 1} / {deck.length}
        </p>
      </header>
      <Progress value={progress} className="h-1 rounded-none" />
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-2xl mx-auto w-full">
        <Card className="w-full p-8 text-center min-h-[240px] flex flex-col items-center justify-center gap-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {current.skill_kind.replace('_', ' ')}
          </p>
          <h2 className="text-4xl font-semibold text-foreground">{current.skill_key}</h2>
          {audioUrl && (
            <Button variant="ghost" size="icon" onClick={() => new Audio(audioUrl).play()}>
              <Volume2 className="w-5 h-5" />
            </Button>
          )}
          {revealed && example && (
            <p className="text-sm text-muted-foreground italic mt-2 border-t border-border pt-3 w-full">
              "{example}"
            </p>
          )}
        </Card>
        {!revealed ? (
          <Button onClick={() => setRevealed(true)} size="lg">
            Show answer
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-sm text-muted-foreground">How well did you remember?</p>
            <ConfidenceRater onRate={handleRate} />
          </div>
        )}
      </main>
    </div>
  );
}
