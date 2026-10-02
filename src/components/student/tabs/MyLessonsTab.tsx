import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useStudentHubTheme } from '@/hooks/useStudentHubTheme';
import { usePlaygroundLessons, type PlaygroundLesson } from '@/hooks/usePlaygroundLessons';
import { playgroundLessonKey, playgroundLessonPath } from '@/content/playground-library/lessonRoutes';
import { questForLesson } from '@/content/homework-quests/registry';
import { PlayCircle, Filter, CheckCircle2, Lock, Play, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { HubBackButton } from '@/components/student/common/HubBackButton';

const HUB_LABEL: Record<string, string> = {
  playground: 'Playground Hub',
  academy: 'Academy Hub',
  professional: 'Success Hub',
};

type PlayableLesson = PlaygroundLesson & { path: string; questId: string | null };

/** Playground students' real lesson library: every built lesson, grouped by
 *  unit, opening the same player as the map, with its Homework Quest linked. */
function PlaygroundLessonList() {
  const navigate = useNavigate();
  const { lessons, loading } = usePlaygroundLessons();

  const units = useMemo(() => {
    const playable: PlayableLesson[] = [];
    for (const l of lessons) {
      const meta = { contentFormat: l.contentFormat, unit_number: l.unitNumber, lesson_number: l.lessonNumber };
      const path = playgroundLessonPath(l.id, meta);
      if (!path) continue; // empty scaffold slot — nothing to play yet
      const key = playgroundLessonKey(meta);
      playable.push({ ...l, path, questId: key ? questForLesson(key)?.id ?? null : null });
    }
    const byUnit = new Map<string, PlayableLesson[]>();
    for (const l of playable) {
      const k = `${l.contentFormat ?? 'x'}|${l.unitNumber ?? 0}`;
      if (!byUnit.has(k)) byUnit.set(k, []);
      byUnit.get(k)!.push(l);
    }
    return Array.from(byUnit.values()).map((ls) => ls.sort((a, b) => (a.lessonNumber ?? 0) - (b.lessonNumber ?? 0)));
  }, [lessons]);

  if (loading) {
    return <div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/60" />)}</div>;
  }
  if (units.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/40 p-8 text-center text-muted-foreground">
        Your lessons will show up here as soon as they are ready.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {units.map((ls) => (
        <section key={`${ls[0].contentFormat}-${ls[0].unitNumber}`} className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
            Unit {ls[0].unitNumber ?? '—'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ls.map((l) => {
              const done = l.status === 'completed';
              return (
                <div key={l.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 ring-1 ring-border/60">
                  <div className="flex items-start gap-3">
                    <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white', done ? 'bg-emerald-500' : 'bg-gradient-to-br from-orange-500 to-amber-500')}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase text-muted-foreground">Lesson {l.lessonNumber ?? l.number}</p>
                      <h3 className="text-sm font-bold leading-tight">{l.title}</h3>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(l.path)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3.5 py-1.5 text-xs font-extrabold text-white shadow active:scale-95"
                    >
                      <Play className="h-3.5 w-3.5" /> {done ? 'Play again' : 'Play'}
                    </button>
                    {l.questId && (
                      <button
                        onClick={() => navigate(`/homework-quest/${l.questId}`)}
                        disabled={!done}
                        title={done ? undefined : 'Finish the lesson to unlock its homework quest'}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-orange-700 ring-2 ring-orange-200 active:scale-95 disabled:opacity-50"
                      >
                        {done ? <BookMarked className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} Homework quest
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function MyLessonsTab() {
  const { studentLevel } = useStudentLevel();
  const theme = useStudentHubTheme();
  const hubKey = studentLevel || 'playground';
  const hubLabel = HUB_LABEL[hubKey];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <HubBackButton label="Back to dashboard" />
      </div>
      <div>
        <h1 className={cn('text-3xl font-bold flex items-center gap-2', theme.accentText)}>
          <PlayCircle className="w-7 h-7" />
          My Lessons
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse your unlocked lessons and continue where you left off.
        </p>

        {/* Hub + level filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filtered
          </span>
          <Badge
            variant="outline"
            className={cn('text-xs border', theme.chipBg, theme.chipText, theme.panelBorder)}
          >
            {hubLabel}
          </Badge>
        </div>
      </div>
      {hubKey === 'playground' ? (
        <PlaygroundLessonList />
      ) : (
        <div
          className={cn(
            'rounded-2xl border bg-card/40 backdrop-blur-xl p-8 text-center text-muted-foreground',
            theme.panelBorder,
          )}
        >
          Your lesson library is loading. Lessons unlock as you progress along your learning path.
        </div>
      )}
    </div>
  );
}
