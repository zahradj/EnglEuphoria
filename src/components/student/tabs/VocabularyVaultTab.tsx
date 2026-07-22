import { useEffect, useState } from 'react';
import { Archive, Volume2, Search, Star } from 'lucide-react';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSpeak } from '@/hooks/useSpeak';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FromLastLessonRail } from '@/components/student/learning-lab/FromLastLessonRail';

type VocabRow = {
  id: string;
  word: string;
  sticker_image_url: string | null;
  mastery_level: number | null;
  times_reviewed: number | null;
  mastered: boolean | null;
};

const HUB_THEME: Record<string, { text: string; ring: string; chip: string; gradient: string }> = {
  playground: {
    text: 'text-orange-600',
    ring: 'ring-orange-300/60 hover:ring-orange-400',
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200',
    gradient: 'from-orange-400/30 to-amber-300/20',
  },
  academy: {
    text: 'text-indigo-600',
    ring: 'ring-indigo-300/60 hover:ring-indigo-400',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
    gradient: 'from-indigo-400/30 to-violet-300/20',
  },
  professional: {
    text: 'text-emerald-600',
    ring: 'ring-emerald-300/60 hover:ring-emerald-400',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    gradient: 'from-emerald-400/30 to-teal-300/20',
  },
};

export function VocabularyVaultTab() {
  const { studentLevel } = useStudentLevel();
  const { user } = useAuth();
  const speak = useSpeak();
  const [rows, setRows] = useState<VocabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const theme = HUB_THEME[studentLevel || 'playground'] ?? HUB_THEME.playground;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from('student_vocabulary_progress')
        .select('id, word, sticker_image_url, mastery_level, times_reviewed, mastered')
        .eq('student_id', user.id)
        .order('mastered', { ascending: false })
        .order('mastery_level', { ascending: false })
        .limit(500);
      setRows(((data ?? []) as VocabRow[]));
      setLoading(false);
    })();
  }, [user?.id]);

  const filtered = rows.filter((r) => r.word?.toLowerCase().includes(query.toLowerCase()));
  const mastered = rows.filter((r) => r.mastered).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold flex items-center gap-2', theme.text)}>
            <Archive className="w-7 h-7" />
            Vocabulary Vault
          </h1>
          <p className="text-muted-foreground mt-1">
            Every word from your lessons. Tap any sticker to hear it.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn('rounded-full px-3 py-1 text-sm font-semibold', theme.chip)}>
            {mastered} mastered · {rows.length} collected
          </div>
        </div>
      </div>

      <FromLastLessonRail
        table="student_vocabulary_progress"
        labelField="word"
        title="🆕 Words from your last lesson"
        accent={theme.text}
      />


      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your words…"
          className="pl-9 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-10 text-center text-muted-foreground">
          {rows.length === 0
            ? 'Your vault is empty. Words you meet in lessons land here as collectible stickers.'
            : 'No words match that search.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((row) => (
            <button
              key={row.id}
              onClick={() => speak(row.word)}
              className={cn(
                'group relative aspect-square rounded-3xl p-3 text-left',
                'bg-gradient-to-br', theme.gradient,
                'backdrop-blur-xl ring-2 transition-all duration-200 hover:-translate-y-0.5',
                theme.ring,
                row.mastered && 'shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]',
              )}
              aria-label={`Play pronunciation of ${row.word}`}
            >
              {row.sticker_image_url ? (
                <img
                  src={row.sticker_image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : null}
              <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  {row.mastered && (
                    <Star className={cn('w-4 h-4 fill-current', theme.text)} />
                  )}
                  <Volume2 className={cn('w-5 h-5 ml-auto opacity-80 group-hover:scale-110 transition-transform', theme.text)} />
                </div>
                <div>
                  <div className="font-bold text-lg leading-tight text-foreground drop-shadow-sm">
                    {row.word}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    Lvl {row.mastery_level ?? 0} · {row.times_reviewed ?? 0}×
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
