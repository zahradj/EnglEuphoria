import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AcademyDeckLesson } from '../lessonRegistry';
import { groupAcademyLibrary } from './levels';

/**
 * The Academy library, organised like the Playground library: level tabs (A1 A2 B1 B2 C1), then the seasons of that level
 * (accordions), then the lessons. Used by the creator's Academy Library, the student's My Lessons, the classroom Lesson Library
 * and the teacher's library; each passes how a lesson card looks. Inherits text colour, so it sits on light and dark pages.
 * With `showSteps` (teachers and creators) the tabs are the ladder steps (Pre-A1, A1, A1 Upper, A2 …, see src/curriculum/academy/ladder.ts);
 * students see plain levels. Every season lists its lesson slots (the 8 episodes), so lessons that are not built yet are already planned in.
 */
export function AcademyLevelLibrary({ lessons, renderLesson, gridClassName = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3', showSteps = false }: {
  lessons: AcademyDeckLesson[];
  renderLesson: (lesson: AcademyDeckLesson) => ReactNode;
  gridClassName?: string;
  showSteps?: boolean;
}) {
  const { t } = useTranslation();
  const groups = useMemo(() => groupAcademyLibrary(lessons, showSteps), [lessons, showSteps]);
  // open the first step with lessons, preferring a regular level over Pre-A1 (most classes are A1 or above)
  const firstWithLessons = (groups.find((g) => g.count > 0 && g.stage !== 'pre') ?? groups.find((g) => g.count > 0) ?? groups[0]).id;
  const [level, setLevel] = useState<string>(firstWithLessons);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const current = groups.find((g) => g.id === level) ?? groups[0];
  const tabLabel = (g: (typeof groups)[number]) => (g.stage === 'upper' ? t('al.upper', '{{level}} Upper', { level: g.cefr }).replace('{{level}}', g.cefr) : g.label);
  // a search that leaves the open level empty jumps to the first level that still has lessons
  useEffect(() => {
    if (current.count === 0 && groups.some((g) => g.count > 0)) setLevel(firstWithLessons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  // open the first season that has lessons when the level changes
  useEffect(() => {
    const first = current.seasons.find((s) => s.lessons.length > 0) ?? current.seasons[0];
    setOpen(new Set(first ? [first.key] : []));
  }, [current]);

  const toggle = (key: string) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Levels">
        {groups.map((g) => (
          <button
            key={g.id}
            role="tab"
            type="button"
            aria-selected={g.id === level}
            onClick={() => setLevel(g.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ring-1 ${g.id === level ? 'bg-violet-600 text-white ring-violet-600 shadow-md' : 'bg-transparent opacity-80 ring-current/25 hover:opacity-100'}`}
          >
            {tabLabel(g)}
            <span className="ms-1.5 text-[11px] font-semibold opacity-70">· {g.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {current.seasons.map((s) => {
          const isOpen = open.has(s.key);
          const planned = s.slots.filter((x) => !x.built);
          return (
            <section key={s.key} className="overflow-hidden rounded-2xl ring-1 ring-current/15">
              <button
                type="button"
                onClick={() => toggle(s.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 bg-black/5 px-4 py-3 text-start transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-full bg-violet-600/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">{s.no !== null ? t('al.season', 'Season {{n}}', { n: s.no }) : t('al.planned', 'Planned')}</span>
                  <span className="truncate text-sm font-semibold">{s.title}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs opacity-70">{s.lessons.length > 0 ? t('al.count', '{{n}} lessons', { n: s.lessons.length }) : s.planned ? t('al.planned', 'Planned') : t('al.soon', 'Coming soon')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                </span>
              </button>
              {isOpen && (
                <>
                  {s.lessons.length > 0
                    ? <div className={`${gridClassName} p-3`}>{s.lessons.map((l) => <div key={l.id}>{renderLesson(l)}</div>)}</div>
                    : <p className="p-4 text-sm opacity-70">{s.planned ? t('al.plannedLong', 'The lessons of this season are being planned.') : t('al.soonLong', 'The lessons of this season are being built.')}</p>}
                  {planned.length > 0 && (
                    showSteps
                      ? (
                        <ul className="space-y-2 px-3 pb-3" aria-label={t('al.slots', 'Planned lessons')}>
                          {planned.map((x) => (
                            <li key={x.episode} data-slot="planned">
                              <details className="rounded-xl ring-1 ring-current/15">
                                <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">
                                  {t('al.episodeShort', 'E{{n}}', { n: x.episode }).replace('{{n}}', String(x.episode))} · {x.name}
                                  {x.plan && <span className="ms-2 text-xs font-normal opacity-70">{x.plan.objective}</span>}
                                </summary>
                                {x.plan && (
                                  <dl className="grid gap-x-3 gap-y-1 px-3 pb-3 text-xs sm:grid-cols-[8rem_1fr]">
                                    <dt className="font-bold opacity-70">{t('al.goal', 'Goal')}</dt><dd>{x.plan.objective}</dd>
                                    <dt className="font-bold opacity-70">{t('al.newLang', 'New language')}</dt><dd>{x.plan.newItems > 0 ? `${t('al.items', '{{n}} items', { n: x.plan.newItems }).replace('{{n}}', String(x.plan.newItems))} · ${x.plan.focus}` : t('al.noNew', 'None: only what you already know')}</dd>
                                    {x.plan.structures.length > 0 && (<><dt className="font-bold opacity-70">{t('al.pattern', 'Pattern')}</dt><dd>{x.plan.structures.join(', ')}</dd></>)}
                                    <dt className="font-bold opacity-70">{t('al.mission', 'Mission')}</dt><dd>{x.plan.mission}</dd>
                                    <dt className="font-bold opacity-70">{t('al.release', 'Release')}</dt><dd>{x.plan.release}</dd>
                                    <dt className="font-bold opacity-70">{t('al.clue', 'Clue unlocked by')}</dt><dd>{x.plan.clue}</dd>
                                  </dl>
                                )}
                              </details>
                            </li>
                          ))}
                        </ul>
                      )
                      : (
                        <ul className="flex flex-wrap gap-2 px-3 pb-3" aria-label={t('al.slots', 'Planned lessons')}>
                          {planned.map((x) => (
                            <li key={x.episode} className="rounded-full px-3 py-1 text-xs font-semibold opacity-70 ring-1 ring-current/20" data-slot="planned">
                              {t('al.episodeShort', 'E{{n}}', { n: x.episode }).replace('{{n}}', String(x.episode))} · {x.name}
                            </li>
                          ))}
                        </ul>
                      )
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
