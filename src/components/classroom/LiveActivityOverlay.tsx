import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, X } from 'lucide-react';

interface LiveActivity {
  id: string;
  classroom_session_id: string;
  teacher_id: string;
  prompt: string;
  format: 'mcq' | 'roleplay' | 'fill_blank';
  payload: any;
  dismissed_at: string | null;
  created_at: string;
}

interface Props {
  bookingId: string;
  isTeacher: boolean;
}

/**
 * Listens for the latest non-dismissed AI activity for this session.
 * Renders a glassmorphic overlay on both teacher + student screens.
 */
export const LiveActivityOverlay: React.FC<Props> = ({ bookingId, isTeacher }) => {
  const [activity, setActivity] = useState<LiveActivity | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, number | string>>({});

  // Initial fetch + realtime subscription
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('live_class_activities')
        .select('*')
        .eq('classroom_session_id', bookingId)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!cancelled && data?.[0]) setActivity(data[0] as LiveActivity);
    })();

    const channel = supabase
      .channel(`live-activities:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_class_activities',
          filter: `classroom_session_id=eq.${bookingId}`,
        },
        (payload) => {
          const next = (payload.new as any) ?? (payload.old as any);
          if (!next) return;
          if (payload.eventType === 'INSERT') {
            setActivity(next as LiveActivity);
            setStudentAnswers({});
          } else if (payload.eventType === 'UPDATE') {
            if (next.dismissed_at) {
              setActivity((cur) => (cur?.id === next.id ? null : cur));
            } else {
              setActivity(next as LiveActivity);
            }
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  const handleDismiss = async () => {
    if (!activity) return;
    await supabase
      .from('live_class_activities')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', activity.id);
    setActivity(null);
  };

  if (!activity) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] mx-auto max-w-2xl px-4 pointer-events-none">
      <Card className="pointer-events-auto bg-card/90 backdrop-blur-xl border-primary/30 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="text-primary">⚡</span>
            {activity.payload?.title ?? 'Quick Activity'}
          </CardTitle>
          {isTeacher && (
            <Button size="icon" variant="ghost" onClick={handleDismiss} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3 max-h-[50vh] overflow-y-auto">
          {activity.format === 'mcq' && (
            <McqRenderer
              items={activity.payload.items}
              answers={studentAnswers}
              onAnswer={(idx, val) => setStudentAnswers((s) => ({ ...s, [idx]: val }))}
              readOnly={isTeacher}
            />
          )}
          {activity.format === 'fill_blank' && (
            <FillBlankRenderer
              items={activity.payload.items}
              answers={studentAnswers as Record<number, string>}
              onAnswer={(idx, val) => setStudentAnswers((s) => ({ ...s, [idx]: val }))}
              readOnly={isTeacher}
            />
          )}
          {activity.format === 'roleplay' && (
            <RoleplayRenderer
              setting={activity.payload.setting}
              items={activity.payload.items}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const McqRenderer: React.FC<{
  items: Array<{ q: string; options: string[]; answer_index: number }>;
  answers: Record<number, number | string>;
  onAnswer: (idx: number, val: number) => void;
  readOnly: boolean;
}> = ({ items, answers, onAnswer, readOnly }) => (
  <div className="space-y-4">
    {items.map((it, i) => (
      <div key={i} className="space-y-2">
        <p className="text-sm font-medium text-foreground">{i + 1}. {it.q}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {it.options.map((opt, j) => {
            const picked = answers[i] === j;
            const showCorrect = readOnly || picked;
            const isCorrect = j === it.answer_index;
            return (
              <button
                key={j}
                disabled={readOnly}
                onClick={() => onAnswer(i, j)}
                className={[
                  'text-left text-sm rounded-md px-3 py-2 border transition-colors',
                  picked && isCorrect && 'bg-green-500/15 border-green-500/40',
                  picked && !isCorrect && 'bg-destructive/15 border-destructive/40',
                  !picked && readOnly && isCorrect && 'bg-green-500/10 border-green-500/30',
                  !picked && !readOnly && 'bg-muted/30 border-border hover:bg-muted/60',
                  !picked && readOnly && !isCorrect && 'bg-muted/20 border-border',
                ].filter(Boolean).join(' ')}
              >
                {opt}
                {readOnly && isCorrect && <CheckCircle2 className="inline h-3 w-3 ml-2 text-green-500" />}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

const FillBlankRenderer: React.FC<{
  items: Array<{ sentence: string; answer: string }>;
  answers: Record<number, string>;
  onAnswer: (idx: number, val: string) => void;
  readOnly: boolean;
}> = ({ items, answers, onAnswer, readOnly }) => (
  <div className="space-y-3">
    {items.map((it, i) => (
      <div key={i} className="space-y-1">
        <p className="text-sm text-foreground">
          {i + 1}. {it.sentence}
          {readOnly && <span className="ml-2 text-xs text-green-500">→ {it.answer}</span>}
        </p>
        {!readOnly && (
          <input
            value={answers[i] ?? ''}
            onChange={(e) => onAnswer(i, e.target.value)}
            placeholder="Your answer…"
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>
    ))}
  </div>
);

const RoleplayRenderer: React.FC<{
  setting: string;
  items: Array<{ teacher_line: string; student_prompt: string }>;
}> = ({ setting, items }) => (
  <div className="space-y-3">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">Setting</p>
    <p className="text-sm text-foreground italic">{setting}</p>
    {items.map((it, i) => (
      <div key={i} className="rounded-md border border-border bg-muted/20 p-3 space-y-1">
        <p className="text-xs text-muted-foreground">Teacher</p>
        <p className="text-sm text-foreground">{it.teacher_line}</p>
        <p className="text-xs text-muted-foreground mt-2">Your turn</p>
        <p className="text-sm text-primary">{it.student_prompt}</p>
      </div>
    ))}
  </div>
);

export default LiveActivityOverlay;
