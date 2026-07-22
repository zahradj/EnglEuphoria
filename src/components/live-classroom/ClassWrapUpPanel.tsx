/**
 * <ClassWrapUpPanel /> — teacher-only side panel that appears at end-of-class
 * (or on demand) and 1-click-dispatches AI-generated personalized homework
 * targeting the student's tracked in-class struggles.
 */
import { useMemo, useState } from 'react';
import { Sparkles, X, Send, Loader2, CheckCircle2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Struggle } from '@/hooks/useLiveClassroom';

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  lessonId: string | null;
  studentId: string | null;
  hub: 'playground' | 'academy' | 'success';
  struggles: Struggle[];
}

const HUB_TINT: Record<Props['hub'], string> = {
  playground: 'from-orange-500/15 to-amber-500/10 border-orange-400/40',
  academy: 'from-indigo-600/15 to-purple-600/10 border-indigo-400/40',
  success: 'from-emerald-600/15 to-teal-600/10 border-emerald-400/40',
};
const HUB_BTN: Record<Props['hub'], string> = {
  playground: 'bg-orange-500 hover:bg-orange-400 text-white',
  academy: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
};

type Phase = 'idle' | 'sending' | 'sent' | 'error';

export function ClassWrapUpPanel({ open, onClose, sessionId, lessonId, studentId, hub, struggles }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; vocabulary: string[]; grammar: string[] } | null>(null);

  // Group struggles by skill_tag, sum counts
  const grouped = useMemo(() => {
    const m = new Map<string, { skill_tag: string; count: number; vocab: string[] }>();
    for (const s of struggles) {
      const cur = m.get(s.skill_tag) ?? { skill_tag: s.skill_tag, count: 0, vocab: [] };
      cur.count += s.count ?? 1;
      if (s.vocab_word && !cur.vocab.includes(s.vocab_word)) cur.vocab.push(s.vocab_word);
      m.set(s.skill_tag, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.count - a.count);
  }, [struggles]);

  const canSend = phase === 'idle' && struggles.length > 0 && studentId;

  async function handleGenerate() {
    if (!canSend || !studentId) return;
    setPhase('sending');
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-homework', {
        body: { session_id: sessionId, lesson_id: lessonId, student_id: studentId, hub, struggles },
      });
      if (error) throw new Error(error.message);
      setPreview({
        title: data?.title ?? 'Custom Practice',
        vocabulary: data?.preview?.vocabulary ?? [],
        grammar: data?.preview?.grammar ?? [],
      });
      setPhase('sent');
      toast.success('Custom homework sent to your student');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong');
      setPhase('error');
      toast.error('Failed to send homework');
    }
  }

  if (!open) return null;

  return (
    <aside className="fixed top-0 right-0 z-50 h-dvh w-full sm:w-[420px] flex flex-col border-l border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300">
      <header className={`flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-br ${HUB_TINT[hub]}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-foreground" />
          <h2 className="text-base font-semibold">Class Wrap-Up</h2>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> Tracked struggles ({struggles.length})
          </h3>
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No struggles tracked yet — looks like a clean class!</p>
          ) : (
            <ul className="space-y-2">
              {grouped.map((g) => (
                <li key={g.skill_tag} className="rounded-xl border border-border bg-background/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{g.skill_tag.replace(/^(grammar|vocab|pronunciation):/, '')}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      ×{g.count}
                    </span>
                  </div>
                  {g.vocab.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {g.vocab.map(v => (
                        <span key={v} className="text-[11px] px-1.5 py-0.5 rounded-md bg-muted text-foreground/80">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {phase === 'sent' && preview && (
          <section className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> Sent to your student
            </div>
            <p className="text-sm text-foreground">{preview.title}</p>
            {preview.vocabulary.length > 0 && (
              <p className="text-xs text-muted-foreground">Vocab: {preview.vocabulary.join(', ')}</p>
            )}
            {preview.grammar.length > 0 && (
              <p className="text-xs text-muted-foreground">Grammar: {preview.grammar.join(', ')}</p>
            )}
          </section>
        )}

        {phase === 'error' && (
          <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMsg}
          </section>
        )}

        {!studentId && (
          <section className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
            Waiting for the student to be connected before homework can be dispatched.
          </section>
        )}
      </div>

      <footer className="p-4 border-t border-border bg-background/80 space-y-2">
        <Button
          className={`w-full gap-2 h-12 text-base font-bold ${HUB_BTN[hub]}`}
          onClick={handleGenerate}
          disabled={!canSend}
        >
          {phase === 'sending' ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Drafting…</>
          ) : phase === 'sent' ? (
            <><CheckCircle2 className="h-4 w-4" /> Sent — generate another?</>
          ) : (
            <><Send className="h-4 w-4" /> Submit Report Now</>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full h-10 text-sm font-medium"
          onClick={onClose}
          disabled={phase === 'sending'}
        >
          Do this later
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          AI tailors a 3-activity block targeting only this student's weak points.
          You can always finish the report later from your dashboard.
        </p>
      </footer>
    </aside>
  );
}
