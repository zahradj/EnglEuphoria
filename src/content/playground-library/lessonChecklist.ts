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
export interface ChecklistItem { id: string; kind: string; label: string; game: string; part: ChecklistPart; page: number }
export interface LessonChecklist {
  contentFormat: string; unitNumber: number; lessonNumber: number;
  title: string; objective: string;
  /** The unit's last test (A1 Lesson 7 Boss Test) or review lesson — the verdict is the unit result. */
  isUnitTest: boolean;
  /** Every activity page (what the student's screen saves). */
  items: ChecklistItem[];
  /** What the report shows (owner, 2026-10-15: "only the core points of the lesson that the student got to finish or
   *  do", no repeated lines): the lesson's skills, each made of the activity pages that practise it. */
  points: CorePoint[];
}

/** One core point of the lesson, e.g. "Knows the letter M (sound and shape)". `pages` = the activity page ids in it. */
export interface CorePoint { id: string; label: string; part: ChecklistPart; pages: string[]; firstPage: number }

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
  letter?: string; word?: string; line?: string; teacher?: string; targets?: { letter?: string; label?: string }[];
  rounds?: { word?: string; letter?: string; sound?: string; sentence?: string; statement?: string }[];
  items?: { word?: string; label?: string; letter?: string }[]; pairs?: { label?: string }[]; cards?: { word?: string }[];
  monsters?: { letter?: string }[]; letters?: string[]; targetLetter?: string; frames?: unknown[]; pages?: unknown[];
  turns?: { who?: string; line?: string }[]; script?: { line?: string }[]; focus?: string;
};

/** A short list of the page's words: "bee, tree, sheep". */
function listOf(xs: (string | undefined)[], n = 3): string {
  const u = Array.from(new Set(xs.filter((x): x is string => !!x && x.trim().length > 0).map((x) => x.trim())));
  return u.length > n ? `${u.slice(0, n).join(', ')}…` : u.join(', ');
}
const q = (t: string) => `“${t.replace(/[“”"]/g, '')}”`;

/** What the student DID on this page, as a report line (owner, 2026-10-15: "the student traced the letter M, the
 *  student recognised the letter M"). Built from the page's own content; null = use the game name. */
function canDo(kind: string, sc: AnyScene): string | null {
  const ws = (arr?: { word?: string; label?: string }[]) => listOf((arr ?? []).map((x) => x.word ?? x.label));
  const letters = (arr?: { letter?: string }[]) => listOf((arr ?? []).map((x) => x.letter?.toUpperCase()), 4);
  switch (kind) {
    case 'trace': return sc.letter ? `Traced the letter ${sc.letter.toUpperCase()}` : 'Traced the letters';
    case 'basket': return sc.letter ? `Recognised words that start with ${sc.letter.toUpperCase()}${ws(sc.items) ? ` (${ws(sc.items)})` : ''}` : null;
    case 'dash': return sc.targetLetter ? `Caught the words that start with ${sc.targetLetter.toUpperCase()}` : null;
    case 'sound-sort': case 'sound-pop': {
      const l = letters(sc.targets);
      if (!l) return null;
      return l.includes(',') ? `Heard the difference between the sounds ${l.replace(/, ([^,]*)$/, ' and $1')}` : `Heard the sound ${l} in words`;
    }
    case 'letter-monsters': { const l = letters(sc.monsters); return l ? `Matched words to their first sound (${l})` : null; }
    case 'brick-crush': return sc.letters?.length ? `Recognised the letters ${listOf(sc.letters.map((x) => x.toUpperCase()), 4)}` : null;
    case 'sound-fish': case 'trophy-chest': case 'first-sound': { const l = letters(sc.rounds); return l ? `Recognised the sound${l.includes(',') ? 's' : ''} ${l}` : null; }
    case 'sound-pick': { const l = listOf((sc.rounds ?? []).map((r) => r.sound)); return l ? `Heard the sound in a word (${l})` : null; }
    case 'sound-blend': { const w = ws(sc.rounds); return w ? `Blended and read the words ${w}` : 'Blended sounds into words'; }
    case 'word-build': { const w = ws(sc.rounds); return w ? `Built the words ${w}` : 'Built words from letters'; }
    case 'tongue-twister': return sc.line ? `Said the tongue twister ${q(sc.line)}` : null;
    case 'echo': return sc.word ? `Repeated ${q(sc.word)}` : null;
    case 'recall-warmup': { const w = ws(sc.items); return w ? `Remembered last lesson’s words (${w})` : 'Remembered last lesson’s words'; }
    case 'picture-match': { const w = ws(sc.items); return w ? `Read and matched ${w}` : 'Read and matched the new words'; }
    case 'listen-match': return 'Listened and matched the new words';
    case 'drag-match': return 'Read the sentences and matched them to the pictures';
    case 'memory': { const w = ws(sc.pairs); return w ? `Found the pairs (${w})` : 'Found the matching pairs'; }
    case 'spin-wheel': { const w = ws(sc.items); return w ? `Said the words on the wheel (${w})` : 'Said the words on the wheel'; }
    case 'vocab-spot': case 'listen-tap': { const w = ws(sc.items ?? sc.targets); return w ? `Found ${w} in the picture` : 'Found the words in the picture'; }
    case 'reader': case 'flipbook': return `Read the story${sc.title ? ` ${q(sc.title)}` : ''}`;
    case 'tick-cross': case 'true-false': return 'Understood the sentences (yes or no)';
    case 'story-order': return 'Put the story in order and retold it';
    case 'sentence-build': return 'Built sentences in the right order';
    case 'read-do': return 'Read instructions and did them';
    case 'join-stage': case 'roleplay': {
      const mine = (sc.turns ?? []).find((t) => t.who === 'student')?.line ?? sc.script?.[0]?.line;
      return mine ? `Spoke: ${q(mine.length > 60 ? `${mine.slice(0, 58).trimEnd()}…` : mine)}` : 'Took part in the conversation';
    }
    case 'voice-stage': case 'he-she-say': return 'Asked and answered out loud';
    default: return null;
  }
}

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
        out.push({ id: testLineId(raw.id, pt.key), kind, label: `Unit test — ${pt.label}`, game: 'Boss Test', part: pt.key === 'speaking' ? 'speaking' : 'games', page: i + 1 });
      }
      return;
    }
    const did = canDo(kind, inner);
    if (did) {
      let label = did;
      const same = out.filter((o) => o.label === label || o.label.startsWith(`${label} (`)).length;
      if (same) label = `${label} (${same + 1})`;
      out.push({ id: raw.id, kind, label, game: KIND_LABEL[kind] ?? pretty(kind), part: PART_OF[kind] ?? 'games', page: i + 1 });
      return;
    }
    const name = (raw.title || inner.title || raw.prompt || inner.prompt || detailOf(inner) || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
    const base = KIND_LABEL[kind] ?? pretty(kind);
    let label = name && name.toLowerCase() !== base.toLowerCase() && !name.toLowerCase().startsWith(base.toLowerCase()) ? `${base}: ${name}` : (name || base);
    const same = out.filter((o) => o.label === label || o.label.startsWith(`${label} (`)).length;
    if (same) label = `${label} (${same + 1})`;
    out.push({ id: raw.id, kind, label: `Played ${label}`, game: KIND_LABEL[kind] ?? pretty(kind), part: PART_OF[kind] ?? 'games', page: i + 1 });
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
    const items = checklistItems(l.scenes);
    return { contentFormat: fmt, unitNumber, lessonNumber, title: l.title, objective: l.objective, isUnitTest: lessonNumber === 7 || hasTest(l.scenes), items, points: corePoints(l.scenes, items) };
  }
  const scenes = getSceneLesson(unitNumber, lessonNumber);
  if (!scenes) return null;
  const meta = getSceneLessonMeta(unitNumber, lessonNumber);
  // Pre-A1: the unit's Boss Test (Lesson 7) and the Checkpoint / Final tests are one `level-test` page.
  const items = checklistItems(scenes);
  return { contentFormat: fmt, unitNumber, lessonNumber, title: meta?.title ?? `Unit ${unitNumber} · Lesson ${lessonNumber}`, objective: meta?.objective ?? '', isUnitTest: hasTest(scenes), items, points: corePoints(scenes, items) };
}

/** `unmarked` = nothing saved and the teacher has not ticked it yet (shown blank, left out of the result). */
export type ItemStatus = 'done' | 'help' | 'not-yet' | 'unmarked';
export interface ActivityRow { slide_id: string; is_correct: boolean | null; selected_option_id: string | null; skill_tag: string | null }

/** What the student's saved rows say about each line: won → done; tried with mistakes / not won → needed help;
 *  no row → unmarked (the teacher decides). `wrong` = wrong tries recorded. */
export function statusFromRows(items: ChecklistItem[], rows: ActivityRow[]): Record<string, { status: ItemStatus; wrong: number; recorded: boolean }> {
  const byId = new Map<string, ActivityRow>();
  for (const r of rows) if (r.skill_tag?.startsWith(PG_TAG_PREFIX) && !byId.has(r.slide_id)) byId.set(r.slide_id, r);
  const out: Record<string, { status: ItemStatus; wrong: number; recorded: boolean }> = {};
  for (const it of items) {
    const r = byId.get(it.id);
    const wrong = Number(/^w(\d+)$/.exec(r?.selected_option_id ?? '')?.[1] ?? 0);
    out[it.id] = !r ? { status: 'unmarked', wrong: 0, recorded: false }
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
export function suggestVerdict(all: ItemStatus[]): Verdict | null {
  const statuses = all.filter((x) => x !== 'unmarked');
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

/* ---------------------------------------------------------------------------------------------------------------
 * Core points: the lesson's skills, not its pages. Each activity page counts towards the point(s) it practises:
 * a letter (trace, basket, sound games), the new words, the key phrases (echo, talk), the story, blending, the tongue
 * twister, the lesson language in its games, last lesson's words, and each part of a unit test.
 * ------------------------------------------------------------------------------------------------------------- */
const LETTER_KINDS = new Set(['trace', 'basket', 'dash', 'sound-fish', 'trophy-chest', 'first-sound', 'brick-crush', 'letter-monsters',
  'sound-sort', 'sound-pop', 'sound-mole', 'letter-game', 'letter-match', 'letter-blocks', 'letter-bubbles', 'sound-pick']);
const WORD_KINDS = new Set(['picture-match', 'listen-match', 'drag-match', 'vocab-spot', 'listen-tap', 'memory', 'spin-wheel', 'shadow-match', 'odd-one-out', 'mystery-bag', 'rapid-recall', 'train-recall', 'lift-flap']);
const SPEAK_KINDS = new Set(['echo', 'join-stage', 'roleplay', 'voice-stage', 'he-she-say', 'chat-chain', 'secret-card']);
const READ_KINDS = new Set(['reader', 'flipbook', 'tick-cross', 'true-false', 'story-order', 'read-do', 'sentence-build']);
const BLEND_KINDS = new Set(['sound-blend', 'word-build']);

function lettersOf(kind: string, sc: AnyScene): string[] {
  const up = (x?: string) => (x ? x.toUpperCase() : undefined);
  const raw = [up(sc.letter), up(sc.targetLetter), ...(sc.targets ?? []).map((t) => up(t.letter)), ...(sc.monsters ?? []).map((m) => up(m.letter)),
    ...(kind === 'brick-crush' ? (sc.letters ?? []).map(up) : []),
    ...(['sound-fish', 'trophy-chest', 'first-sound'].includes(kind) ? (sc.rounds ?? []).map((r) => up(r.letter)) : [])];
  return Array.from(new Set(raw.filter((x): x is string => !!x && x.length <= 3)));
}

export function corePoints(scenes: readonly unknown[], items: ChecklistItem[]): CorePoint[] {
  const byId = new Map<string, AnyScene>();
  (scenes as AnyScene[]).forEach((raw) => { if (raw?.id) byId.set(raw.id, raw.kind === 'prea1' && raw.scene ? raw.scene : raw); });
  const points = new Map<string, CorePoint & { words: string[]; phrases: string[]; traced: boolean; title?: string }>();
  const add = (key: string, part: ChecklistPart, it: ChecklistItem, extra?: { words?: string[]; phrases?: string[]; traced?: boolean; title?: string }) => {
    let p = points.get(key);
    if (!p) { p = { id: key, label: '', part, pages: [], firstPage: it.page, words: [], phrases: [], traced: false }; points.set(key, p); }
    if (!p.pages.includes(it.id)) p.pages.push(it.id);
    p.words.push(...(extra?.words ?? [])); p.phrases.push(...(extra?.phrases ?? []));
    if (extra?.traced) p.traced = true;
    if (extra?.title && !p.title) p.title = extra.title;
  };
  for (const it of items) {
    const pageId = it.id.split('#')[0];
    const sc = byId.get(pageId);
    if (!sc) continue;
    const kind = it.kind;
    if (TEST_KINDS.has(kind)) { add(`test:${it.id}`, it.part, it); continue; }
    if (kind === 'recall-warmup') { add('recall', 'warm-up', it); continue; }
    if (LETTER_KINDS.has(kind)) {
      const ls = lettersOf(kind, sc);
      if (ls.length) { for (const l of ls) add(`letter:${l}`, 'phonics', it, { traced: kind === 'trace' }); continue; }
    }
    if (BLEND_KINDS.has(kind)) { add('blend', 'phonics', it, { words: (sc.rounds ?? []).map((r) => r.word ?? '') }); continue; }
    if (kind === 'tongue-twister') { add('twister', 'phonics', it, { phrases: sc.line ? [sc.line] : [] }); continue; }
    if (WORD_KINDS.has(kind)) { add('words', 'words', it, { words: [...(sc.items ?? []).map((x) => x.word ?? x.label ?? ''), ...(sc.pairs ?? []).map((x) => x.label ?? '')] }); continue; }
    if (SPEAK_KINDS.has(kind)) { add('speak', 'speaking', it, { phrases: kind === 'echo' && sc.word ? [sc.word] : [] }); continue; }
    if (READ_KINDS.has(kind)) { add('read', 'reading', it, { title: kind === 'reader' || kind === 'flipbook' ? sc.title : undefined }); continue; }
    add('games', 'games', it);
  }
  const out: CorePoint[] = [];
  for (const p of points.values()) {
    let label = '';
    if (p.id.startsWith('test:')) label = items.find((x) => x.id === p.id.slice(5))?.label ?? 'Unit test';
    else if (p.id.startsWith('letter:')) {
      const l = p.id.slice(7);
      label = l.length > 1 ? `Knows the sound ${q(l.toLowerCase())} (${l})`
        : p.traced ? `Knows the letter ${l}: says its sound and writes it` : `Knows the sound of the letter ${l}`;
    }
    else if (p.id === 'recall') label = 'Remembers last lesson’s words';
    else if (p.id === 'words') { const w = listOf(p.words, 5); label = w ? `Knows the new words (${w})` : 'Knows the new words'; }
    else if (p.id === 'speak') { const ph = listOf(p.phrases, 3); label = ph ? `Says the key phrases (${ph})` : 'Speaks with the lesson language'; }
    else if (p.id === 'read') label = `Reads and understands the story${p.title ? ` ${q(p.title)}` : ''}`;
    else if (p.id === 'blend') { const w = listOf(p.words, 4); label = w ? `Blends sounds to read words (${w})` : 'Blends sounds to read words'; }
    else if (p.id === 'twister') label = p.phrases[0] ? `Says the tongue twister ${q(p.phrases[0])}` : 'Says the tongue twister';
    else label = 'Uses today’s language in the lesson games';
    out.push({ id: p.id, label, part: p.part, pages: p.pages, firstPage: p.firstPage });
  }
  // A review lesson practises many letters: one line for all of them keeps the list short.
  const letterPts = out.filter((p) => p.id.startsWith('letter:'));
  if (letterPts.length > 3) {
    const merged: CorePoint = {
      id: 'letters', label: `Knows the sounds of the letters ${letterPts.map((p) => p.id.slice(7)).join(', ')}`, part: 'phonics',
      pages: Array.from(new Set(letterPts.flatMap((p) => p.pages))), firstPage: Math.min(...letterPts.map((p) => p.firstPage)),
    };
    out.splice(0, out.length, ...out.filter((p) => !p.id.startsWith('letter:')), merged);
  }
  const ORDER: ChecklistPart[] = ['warm-up', 'words', 'phonics', 'games', 'reading', 'speaking'];
  return out.sort((a, b) => (ORDER.indexOf(a.part) - ORDER.indexOf(b.part)) || (a.firstPage - b.firstPage));
}

/** A point's status from its pages: every saved page won → done; any page tried and not won → needed help; nothing
 *  saved → unmarked. */
export function pointStatus(pages: string[], st: Record<string, { status: ItemStatus; wrong: number; recorded: boolean }>): { status: ItemStatus; wrong: number; recorded: boolean } {
  const rec = pages.map((id) => st[id]).filter((x) => x?.recorded);
  if (!rec.length) return { status: 'unmarked', wrong: 0, recorded: false };
  const wrong = rec.reduce((a, x) => a + x.wrong, 0);
  const anyNotYet = rec.some((x) => x.status === 'not-yet');
  const allDone = rec.every((x) => x.status === 'done');
  return { status: allDone ? 'done' : anyNotYet && rec.length === 1 ? 'not-yet' : 'help', wrong, recorded: true };
}
