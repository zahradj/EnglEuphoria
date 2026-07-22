import { useEffect, useState } from 'react';
import { BookText, Volume2, ChevronDown } from 'lucide-react';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSpeak } from '@/hooks/useSpeak';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { FromLastLessonRail } from '@/components/student/learning-lab/FromLastLessonRail';

type GrammarEntry = {
  lessonId: string;
  title: string;
  pattern: string | null;
  cefr: string | null;
  package: any | null;
  completedAt: string | null;
};

const HUB_THEME: Record<string, { text: string; ring: string; chip: string; card: string }> = {
  playground: {
    text: 'text-orange-600',
    ring: 'ring-orange-300/60',
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200',
    card: 'bg-gradient-to-br from-orange-100/60 to-amber-50/40 dark:from-orange-500/10 dark:to-amber-500/5',
  },
  academy: {
    text: 'text-indigo-600',
    ring: 'ring-indigo-300/60',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
    card: 'bg-gradient-to-br from-indigo-100/60 to-violet-50/40 dark:from-indigo-500/10 dark:to-violet-500/5',
  },
  professional: {
    text: 'text-emerald-600',
    ring: 'ring-emerald-300/60',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    card: 'bg-gradient-to-br from-emerald-100/60 to-teal-50/40 dark:from-emerald-500/10 dark:to-teal-500/5',
  },
};

export function GrammarJournalTab() {
  const { studentLevel } = useStudentLevel();
  const { user } = useAuth();
  const speak = useSpeak();
  const [rows, setRows] = useState<GrammarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const theme = HUB_THEME[studentLevel || 'playground'] ?? HUB_THEME.playground;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const { data: comp } = await (supabase as any)
        .from('lesson_completions')
        .select('lesson_id, completed_at')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(200);
      const ids = Array.from(new Set((comp ?? []).map((r: any) => r.lesson_id).filter(Boolean)));
      if (ids.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const { data: lessons } = await (supabase as any)
        .from('curriculum_lessons')
        .select('id, title, grammar_pattern, slot_cefr_level, grammar_package')
        .in('id', ids);
      const byId = new Map((lessons ?? []).map((l: any) => [l.id, l]));
      const merged: GrammarEntry[] = [];
      for (const c of comp ?? []) {
        const l: any = byId.get(c.lesson_id);
        if (!l) continue;
        const hasGrammar = !!(l.grammar_pattern || l.grammar_package);
        if (!hasGrammar) continue;
        merged.push({
          lessonId: l.id,
          title: l.title ?? 'Lesson',
          pattern: l.grammar_pattern ?? null,
          cefr: l.slot_cefr_level ?? null,
          package: l.grammar_package ?? null,
          completedAt: c.completed_at ?? null,
        });
      }
      // de-duplicate by lessonId, keep first (newest)
      const seen = new Set<string>();
      const unique = merged.filter((m) => (seen.has(m.lessonId) ? false : (seen.add(m.lessonId), true)));
      setRows(unique);
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold flex items-center gap-2', theme.text)}>
            <BookText className="w-7 h-7" />
            Grammar Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Every grammar pattern from your lessons, with form cards and examples you can replay.
          </p>
        </div>
        <div className={cn('rounded-full px-3 py-1 text-sm font-semibold', theme.chip)}>
          {rows.length} patterns
        </div>
      </div>

      {/* 🆕 From your last lesson — surfaced from rows in the last 7 days */}
      {(() => {
        const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = rows.filter((r) => r.completedAt && new Date(r.completedAt).getTime() >= since).slice(0, 8);
        if (recent.length === 0) return null;
        return (
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 p-4">
            <h2 className={cn('font-bold text-sm mb-2', theme.text)}>🆕 Grammar from your last lessons</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recent.map((r) => (
                <button
                  key={r.lessonId}
                  onClick={() => setOpenId(r.lessonId)}
                  className="shrink-0 rounded-xl bg-background/80 ring-1 ring-emerald-200/60 dark:ring-emerald-800/50 px-3 py-2 min-w-[10rem] max-w-[16rem] text-left"
                >
                  <div className="font-bold text-sm truncate">{r.pattern || 'Grammar'}</div>
                  <div className="text-[11px] text-muted-foreground truncate">from “{r.title}”</div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}



      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-10 text-center text-muted-foreground">
          No grammar covered yet. Patterns you study in lessons will be journaled here automatically.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const isOpen = openId === row.lessonId;
            const pkg = row.package as any;
            const forms: any[] = Array.isArray(pkg?.form_cards) ? pkg.form_cards : [];
            const examples: string[] = Array.isArray(pkg?.examples)
              ? pkg.examples.map((e: any) => (typeof e === 'string' ? e : e?.sentence ?? e?.text)).filter(Boolean)
              : [];
            return (
              <div
                key={row.lessonId}
                className={cn('rounded-2xl ring-1 ring-border/40 overflow-hidden', theme.card)}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : row.lessonId)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <div className={cn('font-bold text-base', theme.text)}>
                      {row.pattern || 'Grammar pattern'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      from “{row.title}” {row.cefr ? `· ${row.cefr}` : ''}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn('w-5 h-5 shrink-0 transition-transform', isOpen && 'rotate-180', theme.text)}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/30">
                    {forms.length > 0 && (
                      <div className="grid sm:grid-cols-3 gap-2 pt-3">
                        {forms.slice(0, 3).map((f: any, i: number) => (
                          <div key={i} className="rounded-xl bg-background/60 p-3 ring-1 ring-border/30">
                            <div className={cn('text-[11px] uppercase tracking-wider font-semibold mb-1', theme.text)}>
                              {f.label ?? f.type ?? `Form ${i + 1}`}
                            </div>
                            <div className="text-sm font-medium">{f.formula ?? f.pattern ?? f.example ?? ''}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {examples.length > 0 ? (
                      <div className="space-y-1.5">
                        {examples.slice(0, 6).map((ex, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-background/50 px-3 py-2">
                            <div className="text-sm">{ex}</div>
                            <button
                              onClick={() => speak(ex)}
                              className={cn('p-1.5 rounded-full hover:bg-background', theme.text)}
                              aria-label="Play example"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Open the lesson to see full form cards and practice this pattern again.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
