import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { FamilyPackList, type FamilyLearner } from './FamilyPackList';

interface Props {
  learners: FamilyLearner[];
  /** Unused lessons per child. */
  credits: Record<string, number>;
  /** The child whose "Buy lessons" button was pressed. */
  focusId?: string | null;
}

/**
 * Always at the top of the family dashboard: pick a child, see their lessons and the packs
 * (ordinary and family), buy. Does not wait for anything to load before it shows.
 */
export function FamilyLessonsPanel({ learners, credits, focusId }: Props) {
  const [selectedId, setSelectedId] = useState<string>(learners[0]?.studentId ?? '');

  useEffect(() => {
    if (focusId && learners.some((l) => l.studentId === focusId)) setSelectedId(focusId);
  }, [focusId, learners]);
  useEffect(() => {
    if (!learners.some((l) => l.studentId === selectedId)) setSelectedId(learners[0]?.studentId ?? '');
  }, [learners, selectedId]);

  const learner = learners.find((l) => l.studentId === selectedId);
  if (!learner) return null;
  const left = credits[learner.studentId];

  return (
    <section id="family-lessons" className="fd-surface grid gap-4 p-5" aria-labelledby="family-lessons-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="family-lessons-title" className="flex items-center gap-2 text-lg font-bold">
            <Coins className="h-5 w-5" aria-hidden /> Buy lessons for your family
          </h2>
          <p className="text-sm" style={{ color: 'var(--fd-ink-soft)' }}>
            Choose a child, then a pack. The lessons go to that child.
          </p>
        </div>
        {learners.length > 1 && (
          <label className="grid gap-1 text-sm font-medium" htmlFor="family-lessons-child">
            For
            <select
              id="family-lessons-child"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {learners.map((l) => (
                <option key={l.studentId} value={l.studentId}>{l.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      {left !== undefined && (
        <p className="text-sm font-semibold">
          {learner.name} has <span className="fd-num">{left}</span> {left === 1 ? 'lesson' : 'lessons'} left.
        </p>
      )}
      <FamilyPackList key={learner.studentId} learner={learner} />
    </section>
  );
}
