import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchLevelMap, type Hub, type LevelMapUnit } from '@/services/activeCoreLessonResolver';
import { getKnowledgeCheck } from '@/curriculum/knowledgeChecks';

export const UNITS_PER_LEVEL = 10;

export type UnitMark = 'known' | 'partly' | 'not_yet';
export type UnitMarks = Record<number, UnitMark>;

const MARK_LABEL: Record<UnitMark, string> = { known: 'Knows it', partly: 'Partly', not_yet: 'Not yet' };
const MARK_STYLE: Record<UnitMark, string> = {
  known: 'bg-emerald-500 text-white',
  partly: 'bg-amber-400 text-amber-950',
  not_yet: 'bg-muted-foreground/80 text-background',
};

/** First unit the student doesn't already know — where the path starts. */
export function startUnitFor(marks: UnitMarks): number {
  for (let u = 1; u <= UNITS_PER_LEVEL; u++) {
    if (marks[u] !== 'known') return u;
  }
  return UNITS_PER_LEVEL;
}

/** 3/3 = Knows it, 1–2 = Partly, 0 = Not yet. */
export function markForScore(correct: number, total: number): UnitMark {
  if (total > 0 && correct >= total) return 'known';
  return correct > 0 ? 'partly' : 'not_yet';
}

export function toLevelMapHub(hub: string | null | undefined): Hub {
  if (hub === 'professional' || hub === 'success') return 'success';
  if (hub === 'playground' || hub === 'kids') return 'playground';
  return 'academy';
}

interface Props {
  hub: Hub;
  level: string;
  marks: UnitMarks;
  onChange: (marks: UnitMarks) => void;
}

/**
 * The level's 10 units from the curriculum blueprint (built or not) with a
 * Knows it / Partly / Not yet mark per unit. The path starts at the first
 * unit that isn't "Knows it". Used in the trial picker and in level change
 * requests.
 */
export const UnitKnowledgeChecklist: React.FC<Props> = ({ hub, level, marks, onChange }) => {
  const [map, setMap] = useState<LevelMapUnit[] | null>(null);
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  // Ticked probes per unit (only for this dialog session; the mark is what's saved).
  const [ticks, setTicks] = useState<Record<number, boolean[]>>({});

  useEffect(() => {
    let cancelled = false;
    setMap(null);
    setTicks({});
    setOpenUnit(null);
    fetchLevelMap(hub, level).then((m) => {
      if (!cancelled) setMap(m);
    });
    return () => { cancelled = true; };
  }, [hub, level]);

  const start = startUnitFor(marks);
  const units = useMemo(() => {
    const byNumber = new Map((map ?? []).map((u) => [u.unitNumber, u]));
    return Array.from({ length: UNITS_PER_LEVEL }, (_, i) => byNumber.get(i + 1) ?? { unitNumber: i + 1, unitTitle: null, lessons: [] });
  }, [map]);
  const markFirst = (n: number) =>
    onChange(Object.fromEntries(Array.from({ length: UNITS_PER_LEVEL }, (_, i) => [i + 1, i < n ? 'known' : 'not_yet'])) as UnitMarks);

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">
        Go in order: open a unit's check, ask the 3 questions and tick what the student gets right without help
        (3 = Knows it, 1–2 = Partly, 0 = Not yet). Stop at the first unit that isn't “Knows it”.
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground mr-1">Quick:</span>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => markFirst(0)}>Start from Unit 1</Button>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => markFirst(5)}>Units 1–5 known</Button>
      </div>
      <div className="space-y-1.5">
        {!map ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading the {level} units…
          </div>
        ) : (
          units.map((u) => {
            const mark: UnitMark = marks[u.unitNumber] ?? 'not_yet';
            const built = u.lessons.filter((l) => l.published).length;
            const isStart = u.unitNumber === start;
            const check = getKnowledgeCheck(hub, level, u.unitNumber);
            const open = openUnit === u.unitNumber;
            const unitTicks = ticks[u.unitNumber] ?? [];
            return (
              <div
                key={u.unitNumber}
                className={`rounded-lg border p-2.5 ${isStart ? 'border-primary bg-primary/5' : 'border-border/60'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      Unit {u.unitNumber}{u.unitTitle ? ` · ${u.unitTitle}` : ''}
                      {isStart && <span className="ml-2 text-[10px] font-bold uppercase text-primary">Starts here</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">
                      {u.lessons.length ? u.lessons.map((l) => l.title).join(' · ') : 'Not planned yet'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {u.lessons.length ? (built === u.lessons.length ? 'All lessons built' : `${built} of ${u.lessons.length} lessons built`) : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex rounded-md border border-border/60 overflow-hidden">
                    {(['known', 'partly', 'not_yet'] as UnitMark[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => onChange({ ...marks, [u.unitNumber]: m })}
                        className={`px-2 py-1 text-[11px] font-semibold ${mark === m ? MARK_STYLE[m] : 'hover:bg-muted'}`}
                      >
                        {MARK_LABEL[m]}
                      </button>
                    ))}
                  </div>
                  {check && (
                    <button
                      type="button"
                      onClick={() => setOpenUnit(open ? null : u.unitNumber)}
                      className="text-[11px] font-semibold text-primary flex items-center gap-0.5"
                    >
                      {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      Check{unitTicks.some(Boolean) ? ` · ${unitTicks.filter(Boolean).length}/${check.probes.length}` : ''}
                    </button>
                  )}
                  </div>
                </div>
                {check && open && (
                  <div className="mt-2 rounded-md bg-muted/40 p-2 space-y-1.5">
                    <div className="text-[11px]">
                      <span className="font-semibold">Can do: </span>
                      {check.canDo.join(' · ')}
                    </div>
                    {check.probes.map((p, i) => (
                      <label key={i} className="flex items-start gap-2 text-[12px] cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={!!unitTicks[i]}
                          onChange={(e) => {
                            const next = check.probes.map((_, j) => (j === i ? e.target.checked : !!unitTicks[j]));
                            setTicks((prev) => ({ ...prev, [u.unitNumber]: next }));
                            onChange({ ...marks, [u.unitNumber]: markForScore(next.filter(Boolean).length, check.probes.length) });
                          }}
                        />
                        <span>
                          {p.ask}
                          <span className="block text-[11px] text-muted-foreground">✓ {p.expect}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UnitKnowledgeChecklist;
