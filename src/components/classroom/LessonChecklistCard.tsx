import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ChecklistPart, ItemStatus, Verdict } from '@/content/playground-library/lessonChecklist';

/**
 * Playground lesson checklist in the end-of-class report (owner, 2026-10-15). Every Playground lesson has one, built
 * from its own pages (lessonChecklist.ts); the student's screen saved what they did in class (useLessonActivityLog),
 * so the lines come pre-ticked. The teacher can change any line and gives the lesson — or, on the unit's last lesson,
 * the unit test — a verdict: Nailed it / Almost there / Needs more practice.
 */
export interface ChecklistLine {
  id: string; label: string; game?: string; part: ChecklistPart; page: number; status: ItemStatus; wrong: number; recorded: boolean; reached: boolean;
  /** Page numbers of the activities that make up this point (the classroom pop-up highlights the point being worked on). */
  pageNos?: number[];
  /** Ticked by the teacher (in the classroom pop-up or the report): kept as is, never overwritten by saved rows. */
  byTeacher?: boolean;
}
export interface ChecklistValue {
  lesson: { contentFormat: string; unitNumber: number; lessonNumber: number; title: string; objective: string; isUnitTest: boolean };
  lines: ChecklistLine[];
  verdict: Verdict | null;
  /** True once the teacher changed a line or the verdict (so a re-load keeps their choice). */
  edited: boolean;
}

/** The teacher's ticks for one class, kept in this browser until the report is sent (the classroom pop-up and the
 *  report share them). */
const storeKey = (bookingId?: string) => (bookingId ? `pg-checklist:${bookingId}` : null);
export function loadChecklist(bookingId?: string): ChecklistValue | null {
  const k = storeKey(bookingId);
  if (!k) return null;
  try { const raw = window.localStorage.getItem(k); return raw ? (JSON.parse(raw) as ChecklistValue) : null; } catch { return null; }
}
export function clearChecklist(bookingId?: string) {
  const k = storeKey(bookingId);
  if (k) try { window.localStorage.removeItem(k); } catch { /* noop */ }
}
function saveChecklist(bookingId: string | undefined, v: ChecklistValue) {
  const k = storeKey(bookingId);
  if (!k) return;
  try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: the report still has the in-memory list */ }
}

export interface SceneLessonRef { contentFormat?: string; unitNumber: number; lessonNumber: number }

const STATUS: { key: ItemStatus; emoji: string; label: string }[] = [
  { key: 'done', emoji: '\u{2705}', label: 'Did it' },
  { key: 'help', emoji: '\u{1F7E1}', label: 'Needed help' },
  { key: 'not-yet', emoji: '\u{2B55}', label: 'Not yet' },
];

/** Lines that go into the family's "Let's practise" list: reached in class but not done alone. */
export function practiceLines(v: ChecklistValue | null): string[] {
  if (!v) return [];
  return v.lines.filter((l) => l.reached && (l.status === 'help' || l.status === 'not-yet')).map((l) => l.label).slice(0, 4);
}

interface Props {
  sceneLesson: SceneLessonRef;
  sessionId?: string;
  /** class_bookings.id — where a Boss Test result is saved (playground_assessment_results). */
  bookingId?: string;
  /** Last page the class reached (lines after it are "not reached", not "not yet"). */
  pagesReached?: number | null;
  accent: string;
  value: ChecklistValue | null;
  onChange: (v: ChecklistValue) => void;
  /** Classroom pop-up: the page the class is on now (its line is highlighted). */
  currentPage?: number | null;
  /** Heading override (the classroom pop-up says "Checklist — tick as you go"). */
  heading?: string;
}

export function LessonChecklistCard({ sceneLesson, sessionId, bookingId, pagesReached, accent, value, onChange: onChangeRaw, currentPage, heading }: Props) {
  const onChange = (v: ChecklistValue) => { saveChecklist(bookingId, v); onChangeRaw(v); };
  const [loading, setLoading] = useState(!value);
  const [missing, setMissing] = useState(false);
  const [mod, setMod] = useState<typeof import('@/content/playground-library/lessonChecklist') | null>(null);
  const [showUnreached, setShowUnreached] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const m = await import('@/content/playground-library/lessonChecklist');
      if (cancelled) return;
      setMod(m);
      const list = m.lessonChecklist(sceneLesson.contentFormat, sceneLesson.unitNumber, sceneLesson.lessonNumber);
      if (!list) { setMissing(true); setLoading(false); return; }
      // The teacher's earlier ticks for this class (pop-up in the classroom, or the report opened before).
      const prior = value ?? loadChecklist(bookingId);
      const samePrior = prior && prior.lesson.contentFormat === list.contentFormat && prior.lesson.unitNumber === list.unitNumber && prior.lesson.lessonNumber === list.lessonNumber ? prior : null;
      const teacherLines = new Map((samePrior?.lines ?? []).filter((l) => l.byTeacher).map((l) => [l.id, l]));
      let rows: { slide_id: string; is_correct: boolean | null; selected_option_id: string | null; skill_tag: string | null }[] = [];
      if (sessionId) {
        const { data } = await supabase.from('quiz_responses').select('slide_id, is_correct, selected_option_id, skill_tag')
          .eq('session_id', sessionId).like('skill_tag', `${m.PG_TAG_PREFIX}%`);
        rows = (data ?? []) as typeof rows;
      }
      // Test parts (Boss Test / Checkpoint): the teacher's saved result, scored in stars per part.
      let testStatus: Record<string, ItemStatus> = {};
      if (bookingId && list.items.some((it) => m.TEST_KINDS.has(it.kind))) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from('playground_assessment_results').select('sections, created_at')
          .eq('booking_id', bookingId).order('created_at', { ascending: false }).limit(1);
        const sections = (data?.[0]?.sections ?? []) as { key: string; stars: number }[];
        testStatus = m.statusFromAssessment(list.items, sections);
      }
      if (cancelled) return;
      const st = m.statusFromRows(list.items, rows);
      for (const [id, status] of Object.entries(testStatus)) st[id] = { status, wrong: 0, recorded: true };
      const lastPage = pagesReached && pagesReached > 0 ? pagesReached : Number.POSITIVE_INFINITY;
      // One line per core point of the lesson (owner: "only the core points … that the student got to finish or do").
      const pageNo = new Map(list.items.map((it) => [it.id, it.page]));
      const lines: ChecklistLine[] = list.points.map((pt) => {
        const mine = teacherLines.get(pt.id);
        const ps = m.pointStatus(pt.pages, st);
        const pageNos = Array.from(new Set(pt.pages.map((id) => pageNo.get(id) ?? 0))).sort((a, b) => a - b);
        return {
          id: pt.id, label: pt.label, part: pt.part, page: pt.firstPage, pageNos, ...ps,
          // A point the student worked on (or the teacher ticked) is always "reached", whatever the page counter says.
          reached: pt.firstPage <= lastPage || ps.recorded || !!mine,
          ...(mine ? { status: mine.status, byTeacher: true } : {}),
        };
      });
      // Suggest a result only when there is something to go on (saved rows); otherwise the teacher decides.
      const verdict = samePrior?.edited ? samePrior.verdict
        : lines.some((l) => l.recorded || l.byTeacher) ? m.suggestVerdict(lines.filter((l) => l.reached).map((l) => l.status)) : null;
      onChange({ lesson: { contentFormat: list.contentFormat, unitNumber: list.unitNumber, lessonNumber: list.lessonNumber, title: list.title, objective: list.objective, isUnitTest: list.isUnitTest }, lines, verdict, edited: !!samePrior?.edited });
      setLoading(false);
    })().catch(() => { if (!cancelled) { setMissing(true); setLoading(false); } });
    return () => { cancelled = true; };
    // Load once per lesson/session; value is the output, not an input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneLesson.contentFormat, sceneLesson.unitNumber, sceneLesson.lessonNumber, sessionId, bookingId, pagesReached]);

  const reached = useMemo(() => value?.lines.filter((l) => l.reached) ?? [], [value]);
  const unreached = useMemo(() => value?.lines.filter((l) => !l.reached) ?? [], [value]);
  const counts = useMemo(() => ({
    done: reached.filter((l) => l.status === 'done').length,
    help: reached.filter((l) => l.status === 'help').length,
    notYet: reached.filter((l) => l.status === 'not-yet').length,
    open: reached.filter((l) => l.status === 'unmarked').length,
  }), [reached]);
  const auto = reached.filter((l) => l.recorded).length;

  if (missing) return null;
  if (loading || !value || !mod) {
    return (
      <section className="flex items-center gap-2 rounded-2xl border border-border p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading the lesson checklist…
      </section>
    );
  }

  const setLine = (id: string, status: ItemStatus) => {
    const lines = value.lines.map((l) => (l.id === id ? { ...l, status, reached: true, byTeacher: true } : l));
    const suggested = mod.suggestVerdict(lines.filter((l) => l.reached).map((l) => l.status));
    // (once the teacher ticks lines, the suggestion follows their ticks)
    onChange({ ...value, lines, verdict: value.edited ? value.verdict : suggested, edited: value.edited });
  };
  const setVerdict = (verdict: Verdict) => onChange({ ...value, verdict, edited: true });

  const isNow = (l: ChecklistLine) => !!currentPage && (l.pageNos ?? [l.page]).includes(currentPage);
  const row = (l: ChecklistLine) => (
    <div key={l.id} data-now={isNow(l) || undefined}
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border py-1.5 pl-3 pr-1.5 ${isNow(l) ? 'border-2 bg-background shadow-md' : 'border-border'}`}
      style={isNow(l) ? { borderColor: accent } : undefined}>
      <span className="min-w-0 flex-1 text-sm font-bold">
        {isNow(l) && <span className="me-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white" style={{ background: accent }}>NOW</span>}
        {l.label}
        {l.recorded && <span className="ms-2 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:text-sky-300">from class{l.wrong ? ` · ${l.wrong} wrong ${l.wrong === 1 ? 'try' : 'tries'}` : ''}</span>}
      </span>
      <span className="flex gap-1">
        {STATUS.map((s) => {
          const on = l.status === s.key;
          return (
            <button key={s.key} type="button" aria-pressed={on} aria-label={`${l.label}: ${s.label}`} onClick={() => setLine(l.id, s.key)}
              className={`grid min-h-[40px] min-w-[58px] place-items-center rounded-lg border-2 px-1 text-[10px] font-extrabold ${on ? 'text-foreground' : 'border-border text-muted-foreground opacity-70'}`}
              style={on ? { borderColor: accent, background: `${accent}1A` } : undefined}>
              <span className="text-base leading-none">{s.emoji}</span>{s.label}
            </button>
          );
        })}
      </span>
    </div>
  );

  return (
    <section className="grid gap-3 rounded-2xl border-2 p-4" style={{ borderColor: accent, background: `${accent}0D` }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold">{heading ?? (value.lesson.isUnitTest ? 'Unit test checklist' : 'Lesson checklist')}</h3>
          <p className="text-xs text-muted-foreground">
            {value.lesson.contentFormat === 'lep1-rich' ? 'Pre-A1' : value.lesson.contentFormat.includes('a2') ? 'A2' : 'A1'} · Unit {value.lesson.unitNumber} · Lesson {value.lesson.lessonNumber} — {value.lesson.title}
          </p>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold shadow-sm">
          ✅ {counts.done} · 🟡 {counts.help} · ⭕ {counts.notYet}{counts.open ? ` · ${counts.open} to tick` : ''}
        </span>
      </div>
      {value.lesson.objective && <p className="rounded-xl bg-background/70 px-3 py-2 text-sm"><b>Goal:</b> {value.lesson.objective}</p>}
      <p className="-mt-1 text-xs text-muted-foreground">
        {auto > 0 ? `${auto} line${auto === 1 ? '' : 's'} filled in from what the student did in class. ` : 'Nothing was saved from the student’s screen — tick what they did. '}
        Tap to change any line.
      </p>
      <div className="grid gap-1.5">{reached.map(row)}</div>
      {unreached.length > 0 && (
        <div className="grid gap-1.5">
          <button type="button" onClick={() => setShowUnreached((x) => !x)} className="justify-self-start text-xs font-extrabold text-muted-foreground underline">
            {showUnreached ? 'Hide' : 'Show'} {unreached.length} point{unreached.length === 1 ? '' : 's'} the class didn’t reach
          </button>
          {showUnreached && unreached.map(row)}
        </div>
      )}
      <div className="grid gap-1.5">
        <div className="text-sm font-extrabold">{value.lesson.isUnitTest ? `Unit ${value.lesson.unitNumber} result` : 'Today’s result'}</div>
        <div className="flex flex-wrap gap-1.5">
          {mod.VERDICTS.map((v) => {
            const on = value.verdict === v.key;
            return (
              <button key={v.key} type="button" aria-pressed={on} onClick={() => setVerdict(v.key)}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 px-3 text-sm font-extrabold ${on ? 'text-foreground' : 'border-border text-muted-foreground'}`}
                style={on ? { borderColor: accent, background: `${accent}22` } : undefined}>
                <span className="text-lg">{v.emoji}</span>{v.label}
              </button>
            );
          })}
        </div>
        {!value.edited && value.verdict && <p className="text-xs text-muted-foreground">Suggested from the checklist — tap to change.</p>}
      </div>
    </section>
  );
}
