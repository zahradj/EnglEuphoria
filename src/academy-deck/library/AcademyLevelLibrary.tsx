import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AcademyDeckLesson } from '../lessonRegistry';
import { ACADEMY_LEVELS, groupAcademyLessons, type AcademyLevel } from './levels';

/**
 * The Academy library, organised like the Playground library: level tabs (A1 A2 B1 B2 C1), then the seasons of that level
 * (accordions), then the lessons. Used by the creator's Academy Library, the student's My Lessons, the classroom Lesson Library
 * and the teacher's library; each passes how a lesson card looks. Inherits text colour, so it sits on light and dark pages.
 */
export function AcademyLevelLibrary({ lessons, renderLesson, gridClassName = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' }: {
  lessons: AcademyDeckLesson[];
  renderLesson: (lesson: AcademyDeckLesson) => ReactNode;
  gridClassName?: string;
}) {
  const { t } = useTranslation();
  const groups = useMemo(() => groupAcademyLessons(lessons), [lessons]);
  const firstWithLessons = groups.find((g) => g.count > 0)?.level ?? 'A1';
  const [level, setLevel] = useState<AcademyLevel>(firstWithLessons);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const current = groups.find((g) => g.level === level) ?? groups[0];
  // a search that leaves the open level empty jumps to the first level that still has lessons
  useEffect(() => {
    if (current.count === 0 && groups.some((g) => g.count > 0)) setLevel(firstWithLessons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  // open the first season that has lessons when the level changes
  useEffect(() => {
    const first = current.seasons.find((s) => s.lessons.length > 0) ?? current.seasons[0];
    setOpen(new Set(first ? [first.no] : []));
  }, [current]);

  const toggle = (no: number) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(no)) next.delete(no);
    else next.add(no);
    return next;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Levels">
        {groups.map((g) => (
          <button
            key={g.level}
            role="tab"
            type="button"
            aria-selected={g.level === level}
            onClick={() => setLevel(g.level)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ring-1 ${g.level === level ? 'bg-violet-600 text-white ring-violet-600 shadow-md' : 'bg-transparent opacity-80 ring-current/25 hover:opacity-100'}`}
          >
            {g.level}
            <span className="ms-1.5 text-[11px] font-semibold opacity-70">· {g.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {current.seasons.map((s) => {
          const isOpen = open.has(s.no);
          return (
            <section key={s.no} className="overflow-hidden rounded-2xl ring-1 ring-current/15">
              <button
                type="button"
                onClick={() => toggle(s.no)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 bg-black/5 px-4 py-3 text-start transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-full bg-violet-600/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">{t('al.season', 'Season {{n}}', { n: s.no })}</span>
                  <span className="truncate text-sm font-semibold">{s.title}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs opacity-70">{s.lessons.length > 0 ? t('al.count', '{{n}} lessons', { n: s.lessons.length }) : t('al.soon', 'Coming soon')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                </span>
              </button>
              {isOpen && (
                s.lessons.length > 0
                  ? <div className={`${gridClassName} p-3`}>{s.lessons.map((l) => <div key={l.id}>{renderLesson(l)}</div>)}</div>
                  : <p className="p-4 text-sm opacity-70">{t('al.soonLong', 'The lessons of this season are being built.')}</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
