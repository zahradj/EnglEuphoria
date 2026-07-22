import { useEffect, useState } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSpeak } from '@/hooks/useSpeak';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { FromLastLessonRail } from '@/components/student/learning-lab/FromLastLessonRail';

type PhonRow = {
  id: string;
  phoneme: string;
  mastery_level: string | null;
  audio_url: string | null;
  image_url: string | null;
};

const HUB_THEME: Record<string, { text: string; ring: string; chip: string; tile: string }> = {
  playground: {
    text: 'text-orange-600',
    ring: 'ring-orange-300/60 hover:ring-orange-400',
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200',
    tile: 'bg-gradient-to-br from-orange-200/60 to-amber-100/40 dark:from-orange-500/15 dark:to-amber-500/10',
  },
  academy: {
    text: 'text-indigo-600',
    ring: 'ring-indigo-300/60 hover:ring-indigo-400',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
    tile: 'bg-gradient-to-br from-indigo-200/60 to-violet-100/40 dark:from-indigo-500/15 dark:to-violet-500/10',
  },
  professional: {
    text: 'text-emerald-600',
    ring: 'ring-emerald-300/60 hover:ring-emerald-400',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    tile: 'bg-gradient-to-br from-emerald-200/60 to-teal-100/40 dark:from-emerald-500/15 dark:to-teal-500/10',
  },
};

const MASTERY_RANK: Record<string, number> = { mastered: 3, practicing: 2, introduced: 1 };

export function MapOfSoundsTab() {
  const { studentLevel } = useStudentLevel();
  const { user } = useAuth();
  const speak = useSpeak();
  const [rows, setRows] = useState<PhonRow[]>([]);
  const [loading, setLoading] = useState(true);

  const theme = HUB_THEME[studentLevel || 'playground'] ?? HUB_THEME.playground;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from('student_phonics_progress')
        .select('id, phoneme, mastery_level, audio_url, image_url')
        .eq('student_id', user.id)
        .limit(500);
      setRows(((data ?? []) as PhonRow[]));
      setLoading(false);
    })();
  }, [user?.id]);

  const sorted = [...rows].sort(
    (a, b) => (MASTERY_RANK[b.mastery_level ?? ''] ?? 0) - (MASTERY_RANK[a.mastery_level ?? ''] ?? 0),
  );
  const mastered = rows.filter((r) => r.mastery_level === 'mastered').length;

  const play = (row: PhonRow) => {
    if (row.audio_url) {
      try {
        const a = new Audio(row.audio_url);
        void a.play();
        return;
      } catch {
        /* fall through to TTS */
      }
    }
    speak(row.phoneme);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold flex items-center gap-2', theme.text)}>
            <Volume2 className="w-7 h-7" />
            Map of Sounds
          </h1>
          <p className="text-muted-foreground mt-1">
            Every sound you’ve practiced in your lessons. Tap to hear it again.
          </p>
        </div>
        <div className={cn('rounded-full px-3 py-1 text-sm font-semibold', theme.chip)}>
          {mastered} mastered · {rows.length} sounds
        </div>
      </div>

      <FromLastLessonRail
        table="student_phonics_progress"
        labelField="phoneme"
        title="🆕 Sounds from your last lesson"
        accent={theme.text}
      />



      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-10 text-center text-muted-foreground">
          No sounds yet. Phonics from your lessons will appear here with a play button.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {sorted.map((row) => (
            <button
              key={row.id}
              onClick={() => play(row)}
              className={cn(
                'group relative aspect-square rounded-2xl p-3 flex flex-col items-center justify-center gap-1',
                theme.tile,
                'ring-2 transition-all duration-200 hover:-translate-y-0.5',
                theme.ring,
              )}
              aria-label={`Play sound ${row.phoneme}`}
            >
              {row.mastery_level === 'mastered' && (
                <Sparkles className={cn('absolute top-2 right-2 w-3.5 h-3.5', theme.text)} />
              )}
              <div className={cn('text-2xl font-extrabold tracking-tight', theme.text)}>
                {row.phoneme}
              </div>
              <Volume2 className={cn('w-4 h-4 opacity-70 group-hover:scale-110 transition-transform', theme.text)} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
