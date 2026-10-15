/* Playground lesson checklist (owner, 2026-10-15: "each lesson should have a checklist … after the lesson, the report
 * should have the checklist"). Every Playground lesson (Pre-A1 `lep1-rich` and the A1/A2 worlds) gets its checklist
 * from its own pages — nothing is written by hand, so a new lesson has one the day it is built.
 *
 * - In a live class the STUDENT's player saves one row per activity in `quiz_responses` (session = the class's
 *   classroom_sessions.id, slide_id = the page id, skill_tag = `pg:<kind>`, is_correct = the activity was won,
 *   selected_option_id = `w<n>` = wrong tries). See useLessonActivityLog.
 * - After the class the teacher's report (LessonWrapUpDialog) reads those rows, shows the checklist, lets the teacher
 *   change any line, and gives the lesson (or the unit test) a verdict: nailed it / almost there / needs more practice.
 *
 * Playground only (hub separation). Pure functions here; the registries are imported lazily by the report. */
import { getSceneLesson, getSceneLessonMeta } from './sceneLessonRegistry';
import { getWelcomeTownLesson } from './welcomeTownLessonRegistry';
import { isWelcomeTownFamilyFormat } from './sceneLessonFormats';

export const PG_TAG_PREFIX = 'pg:';
export const pgSkillTag = (kind: string) => `${PG_TAG_PREFIX}${kind}`;
export const wrongTag = (wrong: number) => `w${Math.max(0, Math.round(wrong))}`;

/** Pages that are the lesson's frame, not something the student does (title, songs, models, rewards, breaks). */
const NOT_CHECKED = new Set([
  'title-card', 'cinematic', 'finale', 'song', 'sticker-reward', 'home-mission', 'tpr-actions', 'pet-pal', 'meet',
  'meet-group', 'listen-repeat-cards', 'sound-model', 'numbers-learn', 'feelings', 'color-model', 'shape-model',
  'toy-model', 'he-she-model', 'story-video',
]);

export type ChecklistPart = 'warm-up' | 'words' | 'games' | 'reading' | 'phonics' | 'speaking';
/** `page` = 1-based page number in the lesson (so the report can tell lines the class never reached). */
export interface ChecklistItem { id: string; kind: string; label: string; part: ChecklistPart; page: number }
export interface LessonChecklist {
  contentFormat: string; unitNumber: number; lessonNumber: number;
  title: string; objective: string;
  /** The unit's last test (A1 Lesson 7 Boss Test) or review lesson — the verdict is the unit result. */
  isUnitTest: boolean;
  items: ChecklistItem[];
}

const PART_OF: Record<string, ChecklistPart> = {
  'recall-warmup': 'warm-up', 'feelings-runner': 'warm-up',
  'picture-match': 'words', 'drag-match': 'words', 'listen-match': 'words', echo: 'speaking', 'vocab-spot': 'words',
  reader: 'reading', flipbook: 'reading', 'tick-cross': 'reading', 'true-false': 'reading', 'story-order': 'reading', 'read-do': 'reading',
  'sentence-build': 'reading',
  'sound-sort': 'phonics', 'sound-blend': 'phonics', 'tongue-twister': 'phonics', 'word-build': 'phonics', 'sound-fish': 'phonics',
  'sound-mole': 'phonics', 'sound-pop': 'phonics', 'letter-game': 'phonics', 'letter-match': 'phonics', 'letter-blocks': 'phonics',
  'letter-bubbles': 'phonics', 'first-sound': 'phonics', trace: 'phonics', 'brick-crush': 'phonics', 'letter-monsters': 'phonics',
  'join-stage': 'speaking', roleplay: 'speaking', 'voice-stage': 'speaking', 'he-she-say': 'speaking', 'spin-wheel': 'speaking',
  'chat-chain': 'speaking',
};

const KIND_LABEL: Record<string, string> = {
  'recall-warmup': 'Remember? warm-up', 'picture-match': 'Read and Match', 'listen-match': 'Listen and Match', 'drag-match': 'Read and Drag',
  echo: 'Echo (say it like…)', reader: 'Story reading', 'tick-cross': 'Tick or Cross', 'true-false': 'Yes or No?', 'story-order': 'Story Order',
  'sound-blend': 'Blend & Read', 'tongue-twister': 'Tongue twister', 'word-build': 'Word Build', 'sound-sort': 'Sound Sort',
  'join-stage': 'Free talk', roleplay: 'Role-play', 'sentence-build': 'Sentence Build', 'buzzer-show': 'Buzzer Show', 'catch-sort': 'Catch & Sort',
  'tile-reveal': 'Picture Reveal', 'listen-tap': 'Listen and Tap', memory: 'Memory', 'spin-wheel': 'Spin the Wheel',
};

const pretty = (kind: string) => kind.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

type AnyScene = {
  id: string; kind: string; title?: string; prompt?: string; scene?: AnyScene;
  /** level-test (Pre-A1 Boss Test / Checkpoint / Final) */ sections?: { key: string; label: string }[]; speaking?: { key: string; label: string };
  /** hero-trials (A1 Boss Test) */ skills?: { key: string; label: string }[];
  letter?: string; word?: string; line?: string; teacher?: string; targets?: { letter?: string }[];
};

/** What this page is about, so two lines of the same game read differently ("Basket: H", "Basket: M"). */
function detailOf(sc: AnyScene): string {
  if (sc.letter) return sc.letter;
  const letters = (sc.targets ?? []).map((t) => t.letter).filter(Boolean);
  if (letters.length) return letters.join(' / ');
  if (sc.word) return sc.word;
  if (sc.line && sc.line.length <= 48) return sc.line;
  const first = (sc.teacher ?? '').split(/(?<=[.!?:])\s/)[0].replace(/^(Guided|Reading|Game|Present|Free|Practice|Signature game|You do|We do)[^:]*:\s*/i, '').trim();
  return first.length > 48 ? `${first.slice(0, 46).trimEnd()}…` : first;
}
/** Test pages are split into one line per part, id `<page id>#<part key>`. */
export const TEST_KINDS = new Set(['level-test', 'hero-trials']);
export const testLineId = (pageId: string, key: string) => `${pageId}#${key}`;

/** One line per thing the student does, in lesson order. */
export function checklistItems(scenes: readonly unknown[]): ChecklistItem[] {
  const out: ChecklistItem[] = [];
  (scenes as AnyScene[]).forEach((raw, i) => {
    if (!raw || typeof raw.id !== 'string') return;
    const inner = raw.kind === 'prea1' && raw.scene ? raw.scene : raw;
    const kind = inner.kind;
    if (NOT_CHECKED.has(kind)) return;
    if (kind === 'level-test' || kind === 'hero-trials') {
      const parts = kind === 'level-test' ? [...(inner.sections ?? []), ...(inner.speaking ? [inner.speaking] : [])] : inner.skills ?? [];
      for (const pt of parts) {
        out.push({ id: testLineId(raw.id, pt.key), kind, label: `Test: ${pt.label}`, part: pt.key === 'speaking' ? 'speaking' : 'games', page: i + 1 });
      }
      return;
    }
    const name = (raw.title || inner.title || raw.prompt || inner.prompt || detailOf(inner) || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
    const base = KIND_LABEL[kind] ?? pretty(kind);
    let label = name && name.toLowerCase() !== base.toLowerCase() && !name.toLowerCase().startsWith(base.toLowerCase()) ? `${base}: ${name}` : (name || base);
    const same = out.filter((o) => o.label === label || o.label.startsWith(`${label} (`)).length;
    if (same) label = `${label} (${same + 1})`;
    out.push({ id: raw.id, kind, label, part: PART_OF[kind] ?? 'games', page: i + 1 });
  });
  return out;
}

const hasTest = (scenes: readonly unknown[]) => (scenes as AnyScene[]).some((sc) => TEST_KINDS.has(sc?.kind === 'prea1' && sc.scene ? sc.scene.kind : sc?.kind));

/** The checklist of a Playground lesson, or null if the lesson is not one of ours. */
export function lessonChecklist(contentFormat: string | null | undefined, unitNumber: number, lessonNumber: number): LessonChecklist | null {
  const fmt = contentFormat || 'lep1-rich';
  if (isWelcomeTownFamilyFormat(fmt)) {
    const l = getWelcomeTownLesson(fmt, unitNumber, lessonNumber);
    if (!l) return null;
    return { contentFormat: fmt, unitNumber, lessonNumber, title: l.title, objective: l.objective, isUnitTest: lessonNumber === 7 || hasTest(l.scenes), items: checklistItems(l.scenes) };
  }
  const scenes = getSceneLesson(unitNumber, lessonNumber);
  if (!scenes) return null;
  const meta = getSceneLessonMeta(unitNumber, lessonNumber);
  // Pre-A1: the unit's Boss Test (Lesson 7) and the Checkpoint / Final tests are one `level-test` page.
  return { contentFormat: fmt, unitNumber, lessonNumber, title: meta?.title ?? `Unit ${unitNumber} · Lesson ${lessonNumber}`, objective: meta?.objective ?? '', isUnitTest: hasTest(scenes), items: checklistItems(scenes) };
}

export type ItemStatus = 'done' | 'help' | 'not-yet';
export interface ActivityRow { slide_id: string; is_correct: boolean | null; selected_option_id: string | null; skill_tag: string | null }

/** What the student's saved rows say about each line: won → done; tried with mistakes / not won → needed help;
 *  no row → not yet. `wrong` = wrong tries recorded. */
export function statusFromRows(items: ChecklistItem[], rows: ActivityRow[]): Record<string, { status: ItemStatus; wrong: number; recorded: boolean }> {
  const byId = new Map<string, ActivityRow>();
  for (const r of rows) if (r.skill_tag?.startsWith(PG_TAG_PREFIX) && !byId.has(r.slide_id)) byId.set(r.slide_id, r);
  const out: Record<string, { status: ItemStatus; wrong: number; recorded: boolean }> = {};
  for (const it of items) {
    const r = byId.get(it.id);
    const wrong = Number(/^w(\d+)$/.exec(r?.selected_option_id ?? '')?.[1] ?? 0);
    out[it.id] = !r ? { status: 'not-yet', wrong: 0, recorded: false }
      : { status: r.is_correct && wrong <= 2 ? 'done' : 'help', wrong, recorded: true };
  }
  return out;
}

export type Verdict = 'nailed' | 'almost' | 'practice';
export const VERDICTS: { key: Verdict; emoji: string; label: string }[] = [
  { key: 'nailed', emoji: '\u{1F3C6}', label: 'Nailed it' },
  { key: 'almost', emoji: '\u{1F44D}', label: 'Almost there' },
  { key: 'practice', emoji: '\u{1F501}', label: 'Needs more practice' },
];

/** Suggested verdict from the lines: done counts 1, needed help ½. ≥ 80 % nailed, ≥ 50 % almost, else practice
 *  (the A1 Boss Test pass mark is 4 of 5 = 80 %). The caller leaves out lines the class never reached. */
export function suggestVerdict(statuses: ItemStatus[]): Verdict | null {
  const n = statuses.length;
  if (!n) return null;
  const score = statuses.reduce((s, x) => s + (x === 'done' ? 1 : x === 'help' ? 0.5 : 0), 0) / n;
  return score >= 0.8 ? 'nailed' : score >= 0.5 ? 'almost' : 'practice';
}

/** A saved Playground test (playground_assessment_results, saved by the teacher at the end of the Boss Test): each part
 *  scored in stars out of 5 → 4-5 did it, 2-3 needed help, 0-1 not yet. Fills the `Test: …` lines. */
export function statusFromAssessment(items: ChecklistItem[], sections: { key: string; stars: number }[]): Record<string, ItemStatus> {
  const out: Record<string, ItemStatus> = {};
  for (const it of items) {
    const key = it.id.split('#')[1];
    const sec = key ? sections.find((x) => x.key === key) : undefined;
    if (sec) out[it.id] = sec.stars >= 4 ? 'done' : sec.stars >= 2 ? 'help' : 'not-yet';
  }
  return out;
}
