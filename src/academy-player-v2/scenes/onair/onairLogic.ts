// On Air (pure logic): the data model of the live-radio dialogue game and its checks. No React here, so it is tested without a screen.
// The guest is the game state: how the host's lines land moves the guest's warmth, and the warmth is shown as the guest's FACE (a mood), never as a number or a bar.
import type { CastName, SceneBase } from '../../types';

export type CardKind = 'react' | 'ask' | 'share' | 'flat';
export type GuestMood = 'neutral' | 'curious' | 'happy' | 'surprised' | 'thinking';

/** a host card: what the student can say; `fit` 2 = lands well, 1 = fine, 0 = a dead end (the guest answers in one word) */
export interface OnAirOption { kind: CardKind; text: string; reply: string; fit: 0 | 1 | 2; note: string }
export interface Exchange { guest: string; options: OnAirOption[] }

/** a follow-up question the host can put to a claim; `tell` marks an answer that gives the lie away (the notepad never highlights it) */
export interface Probe { q: string; a: string; tell?: boolean }
export interface Claim { id: string; text: string; probes: Probe[] }

export interface OnAirScene extends SceneBase {
  kind: 'onair';
  /** show: react / ask / share dialogue; twotruths: the host catches the false experience */
  look: 'show' | 'twotruths';
  title: string;
  guest: CastName;
  /** the producer who briefs the host and models every card (recorded voice) */
  producer: CastName;
  intro: string;
  /** show */
  exchanges?: Exchange[];
  /** twotruths */
  claims?: Claim[];
  lieId?: string;
  /** twotruths: the host needs this many answers on the notepad before pinning the lie (default 3) */
  minProbes?: number;
  /** twotruths: why the lie is the lie (shown when it is caught) and the frame the student says: {n} and {why} */
  why?: string;
  /** twotruths: the full sentence shown when the lie is caught (default: `why`) */
  explain?: string;
  sayFrame?: string;
  /** story flag set when the show went well (show: warmth >= flagAt) or the lie was caught (twotruths) */
  flag?: string;
  flagAt?: number;
}

/** the guest's mood after a host line */
export const moodAfter = (fit: 0 | 1 | 2): GuestMood => (fit === 2 ? 'happy' : fit === 1 ? 'curious' : 'neutral');

/** warmth of the whole show: the points of the chosen cards */
export const warmthOf = (picks: (OnAirOption | undefined)[]) => picks.reduce((a, o) => a + (o?.fit ?? 0), 0);
export const maxWarmth = (s: OnAirScene) => (s.exchanges ?? []).length * 2;

/** the halo strength 0..1 around the guest (it grows as the talk warms up) */
export const halo = (warmth: number, max: number) => (max <= 0 ? 0 : Math.max(0, Math.min(1, warmth / max)));

export const CARD_KINDS: CardKind[] = ['react', 'ask', 'share', 'flat'];

export function validateOnAir(s: OnAirScene): string[] {
  const p: string[] = [];
  if (s.look !== 'show' && s.look !== 'twotruths') return [`${s.id}: onair look must be show or twotruths`];
  if (!s.intro?.trim()) p.push(`${s.id}: onair needs the producer's intro`);
  if (s.look === 'show') {
    const ex = s.exchanges ?? [];
    if (ex.length < 3) p.push(`${s.id}: the show needs 3+ exchanges`);
    ex.forEach((e, i) => {
      if (e.options.length !== 3) p.push(`${s.id}: exchange ${i + 1} needs exactly 3 host cards`);
      if (!e.options.some((o) => o.fit === 2)) p.push(`${s.id}: exchange ${i + 1} has no card that lands well`);
      if (e.options.filter((o) => o.fit === 2).length > 2) p.push(`${s.id}: exchange ${i + 1} should not make every card the best one`);
      if (!e.options.some((o) => o.fit === 0 || o.kind === 'flat')) p.push(`${s.id}: exchange ${i + 1} needs a dead-end card so the student can hear the difference`);
      e.options.forEach((o) => {
        if (!CARD_KINDS.includes(o.kind)) p.push(`${s.id}: card kind ${o.kind}`);
        if ((o.kind === 'flat') !== (o.fit === 0)) p.push(`${s.id}: a "flat" card is exactly the fit-0 card ("${o.text}")`);
        if (!o.reply?.trim() || !o.note?.trim()) p.push(`${s.id}: card "${o.text}" needs a reply and a note`);
      });
      // a good line must earn a fuller answer than a dead-end one (that is the whole lesson of the game)
      const flat = e.options.find((o) => o.fit === 0); const best = e.options.find((o) => o.fit === 2);
      if (flat && best && flat.reply.split(/\s+/).length >= best.reply.split(/\s+/).length) p.push(`${s.id}: exchange ${i + 1}: the dead-end answer must be shorter than the best one`);
    });
    const kinds = new Set(ex.flatMap((e) => e.options.filter((o) => o.fit === 2).map((o) => o.kind)));
    if (kinds.size < 2) p.push(`${s.id}: the best cards should include at least two kinds (react, ask, share)`);
    if (s.flag && (s.flagAt === undefined || s.flagAt < 1 || s.flagAt > maxWarmth(s))) p.push(`${s.id}: flagAt must be 1..${maxWarmth(s)}`);
  } else {
    const cl = s.claims ?? [];
    if (cl.length !== 3) p.push(`${s.id}: two truths and a lie needs exactly 3 claims`);
    if (!cl.some((c) => c.id === s.lieId)) p.push(`${s.id}: lieId is not one of the claims`);
    cl.forEach((c) => {
      if ((c.probes?.length ?? 0) < 2) p.push(`${s.id}: claim ${c.id} needs 2+ follow-up questions`);
      const tells = c.probes?.filter((x) => x.tell).length ?? 0;
      if (c.id === s.lieId && tells < 1) p.push(`${s.id}: the lie needs at least one answer that gives it away`);
      if (c.id !== s.lieId && tells > 0) p.push(`${s.id}: a true claim (${c.id}) must not give itself away`);
    });
    if (!s.why?.trim()) p.push(`${s.id}: say why the lie is the lie`);
    if (!s.sayFrame?.includes('{n}')) p.push(`${s.id}: the say frame needs {n}`);
    if ((s.minProbes ?? 3) > cl.reduce((a, c) => a + (c.probes?.length ?? 0), 0)) p.push(`${s.id}: minProbes is more than the questions available`);
  }
  return p;
}

/** every line the recorded voices must have: the producer (intro, every card as a model), the guest (lines, replies, answers) */
export function onAirSpoken(s: OnAirScene): { who: string; text: string }[] {
  const out: { who: string; text: string }[] = [{ who: s.producer, text: s.intro }];
  if (s.look === 'show') {
    for (const e of s.exchanges ?? []) {
      out.push({ who: s.guest, text: e.guest });
      for (const o of e.options) { out.push({ who: s.producer, text: o.text }); out.push({ who: s.guest, text: o.reply }); }
    }
  } else {
    for (const c of s.claims ?? []) { out.push({ who: s.guest, text: c.text }); for (const x of c.probes) { out.push({ who: s.producer, text: x.q }); out.push({ who: s.guest, text: x.a }); } }
  }
  return out;
}
