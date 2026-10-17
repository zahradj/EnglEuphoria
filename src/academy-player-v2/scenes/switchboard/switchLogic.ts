// Pure logic of the Timeline Switchboard (borrows Baba Is You's rule blocks): a time marker decides the ZONE of the timeline, the zone decides the verb form,
// and the sentence strip rewrites itself. No React here (unit-tested).
//   point = a finished moment in the left band  -> past simple   ("I saw a whale last summer.")
//   cloud = "sometime up to now", touching NOW  -> have + participle ("I have never seen a whale.")
export type Zone = 'point' | 'cloud';
export type EventTone = 'sea' | 'city' | 'field' | 'tower' | 'camp' | 'hill';
export interface SwitchEvent { verbBase: string; object: string; tone?: EventTone }
export interface SwitchForms { past: string; participle: string }
export interface SwitchMarker { text: string; zone: Zone }
interface LevelBase { hint: string; /** the markers offered on the tray (texts); default: all */ choices?: string[] }
export interface ForwardLevel extends LevelBase { mode: 'forward'; goalSentence: string; event: SwitchEvent; marker: SwitchMarker; forms: SwitchForms }
export interface ReverseLevel extends LevelBase { mode: 'reverse'; /** the finished sentence the student reads, without a time marker */ goalSentence: string; event: SwitchEvent; marker: SwitchMarker; alsoOk?: string[]; forms: SwitchForms }
export interface FreeLevel extends LevelBase { mode: 'free'; /** sentences to build */ count: number; events: { event: SwitchEvent; forms: SwitchForms }[] }
export type SwitchLevel = ForwardLevel | ReverseLevel | FreeLevel;

/** every marker block the game knows, with its zone and where it sits in the sentence */
export const MARKERS: Record<string, { zone: Zone; place: 'end' | 'question' | 'mid' | 'tail' }> = {
  yesterday: { zone: 'point', place: 'end' },
  'last summer': { zone: 'point', place: 'end' },
  'in 2019': { zone: 'point', place: 'end' },
  'two years ago': { zone: 'point', place: 'end' },
  ever: { zone: 'cloud', place: 'question' },
  never: { zone: 'cloud', place: 'mid' },
  'so far': { zone: 'cloud', place: 'tail' },
  just: { zone: 'cloud', place: 'mid' },
};
export const ALL_MARKERS = Object.keys(MARKERS);
export const zoneOf = (marker: string): Zone => MARKERS[marker]?.zone ?? 'point';
/** the form the zone asks for */
export const formFor = (zone: Zone): 'past' | 'participle' => (zone === 'point' ? 'past' : 'participle');

/** where a marker sits on the timeline, as % of its width: dated ones snap to a point in the band, up-to-now ones pulse onto the cloud */
export const POSITIONS: Record<string, number> = {
  'in 2019': 11, 'two years ago': 24, 'last summer': 34, yesterday: 43,
  ever: 56, never: 62, 'so far': 68, just: 75,
};

export interface Token { text: string; kind: 'text' | 'marker' | 'verb' | 'slot-marker' | 'slot-verb' }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** the live sentence strip: `marker` null = not placed yet, `verb` null = the verb block is not in yet */
export function strip(ev: SwitchEvent, forms: SwitchForms, marker: string | null, verb: string | null): Token[] {
  const slotM: Token = { text: '…', kind: 'slot-marker' };
  const slotV: Token = { text: verb ?? '…', kind: verb ? 'verb' : 'slot-verb' };
  const obj: Token = { text: ev.object, kind: 'text' };
  if (!marker) return [{ text: 'I', kind: 'text' }, { ...slotV, text: '…', kind: 'slot-verb' }, obj, slotM];
  const m = MARKERS[marker];
  const mt: Token = { text: marker, kind: 'marker' };
  if (!m || m.zone === 'point') return [{ text: 'I', kind: 'text' }, slotV, obj, mt];
  const have = (t: string): Token => ({ text: t, kind: 'text' });
  if (m.place === 'question') return [have('Have you'), mt, slotV, obj];
  if (m.place === 'tail') return [have('I have'), slotV, obj, mt];
  return [have('I have'), mt, slotV, obj];
}
export const stripText = (tokens: Token[], marker: string | null): string => {
  const base = tokens.map((t) => t.text).join(' ');
  const end = marker && MARKERS[marker]?.place === 'question' ? '?' : '.';
  return cap(base) + end;
};
/** the finished sentence for a marker and the form it needs */
export function sentenceOf(ev: SwitchEvent, forms: SwitchForms, marker: string): string {
  const z = zoneOf(marker);
  return stripText(strip(ev, forms, marker, z === 'point' ? forms.past : forms.participle), marker);
}

export interface PlaceVerdict { ok: boolean; why?: 'zone' | 'goal' | 'form'; expected?: Zone }
/** a marker is dropped on a zone; `goal` is the marker the level asks for (forward), `accepted` the markers a reverse level takes */
export function judgeMarker(marker: string, dropZone: Zone, goal?: string[]): PlaceVerdict {
  const z = zoneOf(marker);
  if (z !== dropZone) return { ok: false, why: 'zone', expected: z };
  if (goal && !goal.includes(marker)) return { ok: false, why: 'goal', expected: z };
  return { ok: true };
}
export function judgeVerb(zone: Zone, form: 'past' | 'participle'): PlaceVerdict {
  return formFor(zone) === form ? { ok: true } : { ok: false, why: 'form', expected: zone };
}
/** reverse: the event is dropped on a zone; the sentence decides */
export const judgeEvent = (level: ReverseLevel, dropZone: Zone): PlaceVerdict => (level.marker.zone === dropZone ? { ok: true } : { ok: false, why: 'zone', expected: level.marker.zone });

export function checkLevel(l: SwitchLevel, id: string): string[] {
  const p: string[] = [];
  const known = (m: string) => (MARKERS[m] ? true : (p.push(`${id}: unknown marker "${m}"`), false));
  if (!l.hint?.trim()) p.push(`${id}: a level needs a hint`);
  for (const c of l.choices ?? []) known(c);
  if (l.mode === 'free') {
    if (l.count < 2) p.push(`${id}: free play builds 2+ sentences`);
    if (l.events.length < 2) p.push(`${id}: free play needs 2+ events to choose from`);
    return p;
  }
  if (known(l.marker.text) && zoneOf(l.marker.text) !== l.marker.zone) p.push(`${id}: marker "${l.marker.text}" belongs in the ${zoneOf(l.marker.text)} zone, not ${l.marker.zone}`);
  if (l.choices && !l.choices.includes(l.marker.text)) p.push(`${id}: the right marker is not on the tray`);
  if (!l.goalSentence.trim()) p.push(`${id}: needs a goal sentence`);
  if (!l.forms.past || !l.forms.participle || l.forms.past === l.forms.participle) p.push(`${id}: the past and the participle must be two different forms (this game teaches the contrast)`);
  if (l.mode === 'forward') {
    if (!l.goalSentence.toLowerCase().includes(l.marker.text)) p.push(`${id}: the goal must name the marker "${l.marker.text}"`);
    if (l.choices && l.choices.filter((c) => zoneOf(c) !== l.marker.zone).length < 1) p.push(`${id}: the tray needs a marker from the other zone`);
  } else {
    if (l.choices && !l.choices.some((c) => zoneOf(c) !== l.marker.zone)) p.push(`${id}: the tray needs a decoy from the other zone`);
    for (const a of l.alsoOk ?? []) if (known(a) && zoneOf(a) !== l.marker.zone) p.push(`${id}: "${a}" is in the other zone`);
    const form = l.marker.zone === 'point' ? l.forms.past : l.forms.participle;
    if (!l.goalSentence.includes(form)) p.push(`${id}: the sentence the student reads must use "${form}"`);
    if (l.marker.zone === 'cloud' && !/\bhave\b/i.test(l.goalSentence)) p.push(`${id}: a cloud sentence needs "have"`);
    if (['ever', 'never'].includes(l.marker.text) || l.alsoOk?.some((a) => ['ever', 'never'].includes(a))) p.push(`${id}: "ever" and "never" change a positive sentence into a question or a negative; use just or so far in a reverse level`);
    if (l.choices?.some((c) => ['ever', 'never'].includes(c) && l.marker.zone === 'cloud')) p.push(`${id}: do not offer ever or never as a decoy for a positive cloud sentence (they would also be a fair answer)`);
  }
  return p;
}
