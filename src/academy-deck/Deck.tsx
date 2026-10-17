import type React from 'react';
// Academy Deck player. A lesson is a deck of slides; each slide is a full scene plate with ONE game on top.
// Reliable by design: the deck holds only the slide number, "solved" flags, the student's answers and the stamps earned. Every slide is
// wrapped in an error boundary (a broken game offers Try again / Skip, it never freezes the lesson). No timers, no ranking. Voices: recorded clips only (src/academy-deck/audio.ts), silent when missing.
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './deck.css';
import './scene.css';
import { DeckContext, type DeckCtx } from './ctx';
import { Icon } from './Icon';
import { Character, Plate } from './Stage';
import { LaneView } from './slides/lane';
import { BlendView, HearPickView, ReaderView } from './slides/reading';
import { RuleView } from './slides/rule';
import { BoardView } from './slides/board';
import { ExploreView } from './slides/explore';
import { SortView } from './slides/sort';
import { StoryView } from './slides/story';
import { DuelView, RhythmView, VaultView } from './slides/lock';
import { PassageView } from './slides/passage';
import { LobbyView, HubMark } from './slides/lobby';
import { levelLine, rankOf, xpOf } from './hub';
import { ReadQView } from './slides/readq';
import { BossView, WordleView, RpgView, QuizView, TripleView, GlitchView, VerbDrawView, ClozeView } from './slides/games';
import { ForgeView, StreakView } from './slides/forge';
import { LessonClock } from './LessonClock';
import { playSfx } from './sfx';
import { loadBank, saveLessonMistakes, type BankEntry } from './mistakeBank';
import { applyLane, laneOf, LANE_LABEL } from './lanes';
import { BadgeView, BriefView, DialView, TitleView } from './slides/intro';
import { HuntView, ShadowView } from './slides/homework';
import { ModelView, TeachView } from './slides/teach';
import { CardView, WrapView } from './slides/card';
import { FindWrongView, SpellView } from './slides/letters';
import { LockersView, NumTrainView, PadlockView } from './slides/numbers';
import { BorderView, MemoryView } from './slides/passport';
import { NumWallView } from './slides/numwall';
import { MatchView } from './slides/match';
import { CountUpView } from './slides/countup';
import { BePickView, BuildView, FactCheckView, WriteView } from './slides/pattern';
import { ConvoView, FadeView, PhoneChatView, SayView, WhoSaidView } from './slides/talk';
import { audioBaseFor, hasClip, loadManifest, playLine, stopLine } from './audio';
import { openLines, slideLines } from './spoken';
import { partsFor, SAY_IT_KINDS, type DeckScript, type Slide, type Stats, type Vars } from './types';

class Guard extends Component<{ children: ReactNode; onSkip: () => void; id: string }, { err: string | null; n: number }> {
  state = { err: null as string | null, n: 0 };
  static getDerivedStateFromError(e: unknown) {
    return { err: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  }
  componentDidUpdate(prev: { id: string }) {
    if (prev.id !== this.props.id && this.state.err) this.setState({ err: null });
  }
  render() {
    if (!this.state.err) return <div key={this.state.n} className="ad-slidehost">{this.props.children}</div>;
    return (
      <section className="ad-panel" role="alert">
        <h2 className="ad-prompt">This game hit a snag</h2>
        <p className="ad-hint-line">Your progress is safe. Try again or skip this slide. <code>{this.state.err}</code></p>
        <div className="ad-row">
          <button type="button" className="ad-btn" onClick={() => this.setState({ err: null, n: this.state.n + 1 })}>Try again</button>
          <button type="button" className="ad-btn ad-btn-primary" onClick={this.props.onSkip}>Skip this slide ▸</button>
        </div>
      </section>
    );
  }
}

/** 1 to 3 stars from first-try accuracy so far (honest, never zero: the student finished the part). */
function clearedStars(s: Stats): number {
  const t = s.right + s.wrong;
  const r = t === 0 ? 1 : s.right / t;
  return r >= 0.85 ? 3 : r >= 0.6 ? 2 : 1;
}

/** The teaching ladder shown to the student: watch it done (I do), practise together (we do), your turn (you do), create (you make it yours). */
const STAGE_LABEL: Record<string, string> = { review: 'Warm-up', context: 'Watch and listen', model: 'Watch and learn', rule: 'The rule', controlled: 'Practise together', free: 'Your turn', produce: 'Make it yours' };

const SKILL: Record<string, string> = { say: 'Speaking', fade: 'Speaking', passage: 'Reading', readq: 'Reading', hearpick: 'Listening', story: 'Listening', model: 'Listening', write: 'Writing', build: 'Writing', boss: 'Game', wordle: 'Game', rpg: 'Game', quiz: 'Game', triple: 'Game', glitch: 'Game', board: 'Game', verbdraw: 'Game', cloze: 'Reading', sort: 'Game', memory: 'Game', match: 'Game', forge: 'Game', streak: 'Game', explore: 'Game', hunt: 'Game', vault: 'Game', duel: 'Game', rhythm: 'Game' };
const skillOf = (kind: string): string => SKILL[kind] ?? '';

/** A short human label for a slide (what the student was doing), for the Mistake Bank. */
function slideLabel(s: Slide): string {
  const t = (s as { prompt?: string; title?: string; heading?: string }).prompt ?? (s as { title?: string }).title ?? (s as { heading?: string }).heading ?? s.id;
  const one = t.replace(/\s+/g, ' ').trim();
  const first = one.split(/(?<=[.!?])\s/)[0];
  return (first.length > 8 ? first : one).slice(0, 90);
}

/** Comfort settings (voice, sounds, calm mode) are the student's own: remembered on this device so a reload does not undo them. Fails soft. */
const PREFS_KEY = 'academy-deck-prefs-v1';
function prefOf(k: 'voice' | 'sfx' | 'calm'): boolean | undefined {
  try {
    const v = (JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? '{}') as Record<string, unknown>)[k];
    return typeof v === 'boolean' ? v : undefined;
  } catch {
    return undefined;
  }
}
function savePrefs(p: { voice: boolean; sfx: boolean; calm: boolean }) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch { /* blocked storage: nothing is remembered, nothing breaks */ }
}

/** Lesson progress (slide, answers, stamps, stars) for a student working alone: kept on this device so a reload or a dropped connection does not restart the hour. Fails soft. */
const PROGRESS_KEY = 'academy-deck-progress-v1';
interface Saved { index: number; slideId: string; solved: Record<string, boolean>; vars: Vars; stamps: string[]; stats: Stats }
function loadProgress(lessonId: string, slideIds: string[]): Saved | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(`${PROGRESS_KEY}:${lessonId}`) ?? 'null') as Saved | null;
    // a lesson that was edited since (different slides) is not resumed: positions would not mean the same thing
    if (!v || typeof v.index !== 'number' || v.index < 1 || v.index >= slideIds.length || slideIds[v.index] !== v.slideId) return null;
    return v;
  } catch {
    return null;
  }
}
function saveProgress(lessonId: string, v: Saved | null) {
  try {
    if (v) window.localStorage.setItem(`${PROGRESS_KEY}:${lessonId}`, JSON.stringify(v));
    else window.localStorage.removeItem(`${PROGRESS_KEY}:${lessonId}`);
  } catch { /* blocked storage: nothing is remembered, nothing breaks */ }
}

function SlideView({ slide, script, onStart }: { slide: Slide; script: DeckScript; onStart: () => void }) {
  switch (slide.kind) {
    case 'title': return script.hub === false ? <TitleView slide={slide} /> : <LobbyView slide={slide} script={script} onStart={onStart} />;
    case 'brief': return <BriefView slide={slide} />;
    case 'badge': return <BadgeView slide={slide} />;
    case 'dial': return <DialView slide={slide} />;
    case 'lane': return <LaneView slide={slide} />;
    case 'blend': return <BlendView slide={slide} />;
    case 'hearpick': return <HearPickView slide={slide} />;
    case 'reader': return <ReaderView slide={slide} />;
    case 'rule': return <RuleView slide={slide} />;
    case 'explore': return <ExploreView slide={slide} />;
    case 'sort': return <SortView slide={slide} />;
    case 'story': return <StoryView slide={slide} />;
    case 'whosaid': return <WhoSaidView slide={slide} />;
    case 'hunt': return <HuntView slide={slide} />;
    case 'shadow': return <ShadowView slide={slide} />;
    case 'teach': return <TeachView slide={slide} />;
    case 'model': return <ModelView slide={slide} />;
    case 'lockers': return <LockersView slide={slide} />;
    case 'numtrain': return <NumTrainView slide={slide} />;
    case 'padlock': return <PadlockView slide={slide} />;
    case 'convo': return <ConvoView slide={slide} />;
    case 'spell': return <SpellView slide={slide} />;
    case 'findwrong': return <FindWrongView slide={slide} />;
    case 'border': return <BorderView slide={slide} />;
    case 'memory': return <MemoryView slide={slide} />;
    case 'numwall': return <NumWallView slide={slide} />;
    case 'match': return <MatchView slide={slide} />;
    case 'countup': return <CountUpView slide={slide} />;
    case 'bepick': return <BePickView slide={slide} />;
    case 'build': return <BuildView slide={slide} />;
    case 'factcheck': return <FactCheckView slide={slide} />;
    case 'write': return <WriteView slide={slide} />;
    case 'phonechat': return <PhoneChatView slide={slide} />;
    case 'fade': return <FadeView slide={slide} />;
    case 'card': return <CardView slide={slide} />;
    case 'say': return <SayView slide={slide} />;
    case 'vault': return <VaultView slide={slide} />;
    case 'rhythm': return <RhythmView slide={slide} />;
    case 'duel': return <DuelView slide={slide} />;
    case 'passage': return <PassageView slide={slide} />;
    case 'readq': return <ReadQView slide={slide} />;
    case 'boss': return <BossView slide={slide} />;
    case 'wordle': return <WordleView slide={slide} />;
    case 'rpg': return <RpgView slide={slide} />;
    case 'quiz': return <QuizView slide={slide} />;
    case 'triple': return <TripleView slide={slide} />;
    case 'glitch': return <GlitchView slide={slide} />;
    case 'board': return <BoardView slide={slide} />;
    case 'verbdraw': return <VerbDrawView slide={slide} />;
    case 'cloze': return <ClozeView slide={slide} />;
    case 'forge': return <ForgeView slide={slide} />;
    case 'streak': return <StreakView slide={slide} />;
    case 'wrap': return <WrapView slide={slide} />;
  }
}

export interface DeckProps {
  script: DeckScript;
  artBase?: string;
  /** recorded voice clips folder (default: 'academy-audio' beside the art folder) */
  audioBase?: string;
  /** teacher view: every slide can be opened from the strip */
  teacher?: boolean;
  /** review/preview: "Next" works on any slide, solved or not */
  freeNext?: boolean;
  /** live classroom: controlled slide index (the teacher moves the class) */
  slide?: number;
  /** first slide when the deck keeps its own position (e.g. a teacher re-joining a class) */
  start?: number;
  /** inside the live classroom stage: fills its frame instead of the whole window */
  embedded?: boolean;
  /** student in a live class: the teacher moves the lesson, so Back / Next / the slide strip do not navigate */
  follow?: boolean;
  onSlide?: (index: number) => void;
  onFinish?: (result: { vars: Vars; stats: Stats; stamps: string[] }) => void;
  /** homework quest mode: no part title cards, the strip label is `label`, and every solved slide reports its wrong tries */
  homework?: { label: string };
  onSlideDone?: (slide: Slide, result: { wrong: number }) => void;
  /** every wrong try on a slide (the live classroom keeps what the student tried but did not finish) */
  onSlideWrong?: (slide: Slide, wrongSoFar: number) => void;
}

export function Deck({ script, artBase, audioBase, teacher = false, freeNext = false, slide: controlled, start, embedded = false, follow = false, onSlide, onFinish, homework, onSlideDone, onSlideWrong }: DeckProps) {
  const [own, setOwn] = useState(start ?? 0);
  const index = Math.min(controlled ?? own, script.slides.length - 1);
  const go = useCallback((i: number) => {
    const n = Math.max(0, Math.min(script.slides.length - 1, i));
    if (controlled === undefined) setOwn(n);
    onSlide?.(n);
  }, [controlled, onSlide, script.slides.length]);
  // a student working alone (not a teacher preview, a live class or homework) can pick the lesson up where they left off
  const keepsProgress = controlled === undefined && !embedded && !follow && !teacher && !freeNext && !homework;
  const [resume, setResume] = useState<Saved | null>(() => (keepsProgress && typeof window !== 'undefined' ? loadProgress(script.lessonId, script.slides.map((x) => x.id)) : null));
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [vars, setVarsState] = useState<Vars>({ num: '427', numw: 'four hundred twenty-seven' });
  const [stamps, setStamps] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ right: 0, wrong: 0, hints: 0, skipped: [], spoken: 0 });
  const [tiers, setTiers] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [minute, setMinute] = useState(false);
  const [bank, setBank] = useState<BankEntry[] | null>(null);
  const [menu, setMenu] = useState(false);
  const [burst, setBurst] = useState<{ n: number; x: number; y: number } | null>(null);
  // game feel (adapted from the Playground's approach, rebuilt for teens in Academy files only): the burst flies from where the student tapped,
  // a wrong answer gives the play area a soft shake, a new rank shows a LEVEL UP banner, and streaks earn small achievement badges
  const lastPt = useRef({ x: 50, y: 46 });
  const [shake, setShake] = useState(false);
  const [levelUp, setLevelUp] = useState<{ n: number; name: string } | null>(null);
  const [achv, setAchv] = useState<{ id: number; text: string } | null>(null);
  const prevRank = useRef(1);
  const achvId = useRef(0);
  const [chat, setChat] = useState(false);
  const [mood, setMood] = useState<'happy' | 'concerned' | null>(null);
  const moodTimer = useRef<number>();
  const react = useCallback((m: 'happy' | 'concerned') => {
    setMood(m);
    window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood(null), 1400);
  }, []);
  const [partCard, setPartCard] = useState<number | null>(null);
  const [partLeaving, setPartLeaving] = useState(false);
  const closePart = useCallback(() => {
    // fade out instead of vanishing: a hard cut looked like a glitch
    setPartLeaving(true);
    window.setTimeout(() => {
      setPartCard(null);
      setPartLeaving(false);
    }, 320);
  }, []);
  const shownParts = useRef<Set<number>>(new Set());
  const [calm, setCalm] = useState(() => prefOf('calm') ?? (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const parts = partsFor(script);
  const hubInfo = levelLine(script);
  const xp = xpOf(stats.right, stats.spoken ?? 0);
  const rank = rankOf(xp);
  const lane = laneOf(vars);
  const cur = applyLane(script.slides[index], lane);
  // ---- recorded voices (silent when a clip or the clip list is missing; never the browser voice)
  const base = audioBaseFor(artBase, audioBase);
  const [voiceOn, setVoiceOn] = useState(() => prefOf('voice') ?? true);
  const [sfxOn, setSfxOn] = useState(() => prefOf('sfx') ?? true);
  const sfxRef = useRef(true);
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [prevBg, setPrevBg] = useState<string | null>(null);
  const voiceRef = useRef(true);
  voiceRef.current = voiceOn;
  sfxRef.current = sfxOn && !calm;
  const [clipsReady, setClipsReady] = useState(false);
  // sound is allowed once the person has used the page (a tap on the Join button counts), not only a tap inside the lesson
  const alreadyActive = () => typeof navigator !== 'undefined' && !!(navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
  const [unlocked, setUnlocked] = useState(alreadyActive);
  const unlockedRef = useRef(alreadyActive());
  const [speakingWho, setSpeakingWho] = useState<string | null>(null);
  const seq = useRef(0);
  useEffect(() => {
    let live = true;
    setClipsReady(false);
    void loadManifest(base).then(() => live && setClipsReady(true));
    return () => {
      live = false;
    };
  }, [base]);
  // browsers only allow sound after a tap or key press: the first one unlocks the voices
  useEffect(() => {
    const unlock = () => {
      unlockedRef.current = true;
      setUnlocked(true);
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('click', unlock, true);
    return () => {
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
  }, []);
  const speak = useCallback(async (who: string, text: string) => {
    if (!voiceRef.current || !unlockedRef.current) return false;
    return playLine(who, text, { base, onStart: () => setSpeakingWho(who), onEnd: () => setSpeakingWho((w) => (w === who ? null : w)) });
  }, [base]);
  const speakSeq = useCallback(async (lines: { who: string; text: string }[]) => {
    const mine = ++seq.current;
    for (const l of lines) {
      if (mine !== seq.current) return;
      await speak(l.who, l.text);
    }
  }, [speak]);
  const canHear = useCallback((who: string, text: string) => hasClip(base, who, text), [base]);
  // a new slide, or Voice off: whatever is playing stops
  useEffect(() => () => {
    seq.current += 1;
    stopLine();
    setSpeakingWho(null);
  }, [index]);
  useEffect(() => {
    if (!voiceOn) {
      seq.current += 1;
      stopLine();
      setSpeakingWho(null);
    }
  }, [voiceOn]);
  // a student who follows the teacher may not tap inside the lesson: unlock as soon as the page has been used
  useEffect(() => {
    if (!unlockedRef.current && alreadyActive()) { unlockedRef.current = true; setUnlocked(true); }
  }, [index]);
  // the slide's own spoken lines (greeting, mission, wrap...) once the voices are unlocked
  useEffect(() => {
    if (!unlocked || !voiceOn || !clipsReady) return;
    const lines = openLines(cur);
    if (lines.length) void speakSeq(lines);
  }, [index, unlocked, voiceOn, clipsReady]); // eslint-disable-line react-hooks/exhaustive-deps
  const slideHasClip = clipsReady && slideLines(cur).some((l) => hasClip(base, l.who, l.text));
  const curId = useRef(cur.id);
  curId.current = cur.id;
  const wrongBySlide = useRef<Record<string, number>>({});
  const slideRef = useRef<Slide>(cur);
  slideRef.current = cur;
  const cbRef = useRef(onSlideDone);
  cbRef.current = onSlideDone;
  const wrongCb = useRef(onSlideWrong);
  wrongCb.current = onSlideWrong;
  const done = useCallback(() => setSolved((s) => {
    if (s[curId.current]) return s;
    // report once per slide, outside the state updater's purity: schedule it
    const slideNow = slideRef.current;
    window.setTimeout(() => cbRef.current?.(slideNow, { wrong: wrongBySlide.current[slideNow.id] ?? 0 }), 0);
    playSfx('done', sfxRef.current);
    return { ...s, [curId.current]: true };
  }), []);
  const setVars = useCallback((p: Vars) => setVarsState((v) => ({ ...v, ...p })), []);
  const award = useCallback((id: string) => setStamps((s) => (s.includes(id) ? s : [...s, id])), []);
  const right = useCallback(() => {
    setStats((s) => ({ ...s, right: s.right + 1 }));
    comboRef.current += 1;
    setCombo(comboRef.current);
    playSfx(comboRef.current % 5 === 0 ? 'combo' : 'right', sfxRef.current);
    react('happy');
  }, [react]);
  const sayIt = useCallback(() => {
    setStats((s) => ({ ...s, spoken: (s.spoken ?? 0) + 1 }));
    playSfx('right', sfxRef.current);
  }, []);
  const wrong = useCallback(() => {
    wrongBySlide.current[curId.current] = (wrongBySlide.current[curId.current] ?? 0) + 1;
    wrongCb.current?.(slideRef.current, wrongBySlide.current[curId.current]);
    setStats((s) => ({ ...s, wrong: s.wrong + 1 }));
    comboRef.current = 0;
    setCombo(0);
    playSfx('wrong', sfxRef.current);
    react('concerned');
    setShake(true);
    window.setTimeout(() => setShake(false), 460);
  }, [react]);
  const mistakes = useMemo(() => Object.entries(wrongBySlide.current).filter(([, n]) => n > 0).map(([id, n]) => ({ id, label: slideLabel(script.slides.find((x) => x.id === id) ?? script.slides[0]), wrong: n })).sort((a, b) => b.wrong - a.wrong), [stats.wrong, script.slides]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (keepsProgress && mistakes.length) saveLessonMistakes(script.lessonId, mistakes); }, [mistakes]); // eslint-disable-line react-hooks/exhaustive-deps
  const ctx: DeckCtx = useMemo(() => ({ artBase, vars, setVars, done, right, wrong, award, stamps, reduced: calm, seed: 1000 + index * 17, voice: voiceOn, clipsReady, canHear, speak, speakSeq, mistakes, lessonId: script.lessonId }), [script.lessonId, artBase, vars, setVars, done, right, wrong, award, stamps, calm, index, voiceOn, clipsReady, canHear, speak, speakSeq, mistakes]);
  const keys = useMemo(() => script.slides.filter((x) => x.kind === 'vault' && solved[x.id]).map((x) => (x as { lock: number }).lock), [script.slides, solved]);
  const lockNames = script.locks;
  const isSolved = !!solved[cur.id];
  const last = index === script.slides.length - 1;
  // a lock opens: a soft click and chime (none in Calm mode or with Sounds off)
  const keyCount = useRef(0);
  useEffect(() => {
    if (keys.length > keyCount.current) playSfx('key', sfxRef.current);
    keyCount.current = keys.length;
  }, [keys.length]);
  // the cast chatter for a moment when a slide opens: only for slides with NO recorded clip (a real clip drives the mouth itself)
  useEffect(() => {
    setChat(true);
    const t = window.setTimeout(() => setChat(false), 2400);
    return () => window.clearTimeout(t);
  }, [index]);
  useEffect(() => {
    setToast(null);
    setMenu(false);
  }, [index]);
  // the scene changes with a soft cross-fade (the old plate fades out under the new one), none in Calm mode
  const lastBg = useRef(cur.bg);
  useEffect(() => {
    if (lastBg.current === cur.bg) return;
    setPrevBg(lastBg.current);
    lastBg.current = cur.bg;
    const t = window.setTimeout(() => setPrevBg(null), 560);
    return () => window.clearTimeout(t);
  }, [cur.bg]);
  // a cinematic title card when a new part of the lesson starts (once per part; tap to skip, closes by itself)
  useEffect(() => {
    const part = cur.part;
    if (homework) {
      setPartCard(null);
      return;
    }
    if (shownParts.current.has(part)) return;
    shownParts.current.add(part);
    // the title card is the intro of the lesson: no part card on top of it (it made the first page slide in and vanish)
    if (cur.kind === 'title' && script.slides[0] === cur) return;
    setPartLeaving(false);
    setPartCard(part);
    const t = window.setTimeout(() => closePart(), 2200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.part]);
  // a short sparkle burst on every correct answer (UI motion tied to success; none in Calm mode)
  useEffect(() => {
    if (stats.right > 0) setBurst((b) => ({ n: (b?.n ?? 0) + 1, x: lastPt.current.x, y: lastPt.current.y }));
  }, [stats.right]);
  // LEVEL UP when the rank changes (a short banner, tap-through, no blocking)
  useEffect(() => {
    if (rank.n > prevRank.current) {
      setLevelUp({ n: rank.n, name: rank.name });
      playSfx('combo', sfxRef.current);
      const t = window.setTimeout(() => setLevelUp(null), 2600);
      prevRank.current = rank.n;
      return () => window.clearTimeout(t);
    }
    prevRank.current = rank.n;
  }, [rank.n]); // eslint-disable-line react-hooks/exhaustive-deps
  // streak achievements: small badges at 3, 5 and 10 right answers in a row
  useEffect(() => {
    const text = combo === 3 ? 'On a roll · ×3' : combo === 5 ? 'Hot streak · ×5' : combo === 10 ? 'Unstoppable · ×10' : null;
    if (!text) return;
    const id = ++achvId.current;
    setAchv({ id, text });
    const t = window.setTimeout(() => setAchv((a) => (a && a.id === id ? null : a)), 2300);
    return () => window.clearTimeout(t);
  }, [combo]);
  useEffect(() => {
    if (!keepsProgress || resume) return;
    saveProgress(script.lessonId, index >= 1 ? { index, slideId: script.slides[index].id, solved, vars, stamps, stats } : null);
  }, [index, solved, vars, stamps, stats]); // eslint-disable-line react-hooks/exhaustive-deps
  const continueLesson = () => {
    if (!resume) return;
    setSolved(resume.solved);
    setVarsState(resume.vars);
    setStamps(resume.stamps);
    setStats(resume.stats);
    for (let k = 0; k <= script.slides[resume.index].part; k++) shownParts.current.add(k);
    go(resume.index);
    setResume(null);
  };
  const startOver = () => {
    saveProgress(script.lessonId, null);
    setResume(null);
  };
  const touchedPrefs = useRef(false);
  useEffect(() => {
    // only after the student changes a setting (the first render must not freeze the OS "reduce motion" default into storage)
    if (touchedPrefs.current) savePrefs({ voice: voiceOn, sfx: sfxOn, calm });
    touchedPrefs.current = true;
  }, [voiceOn, sfxOn, calm]);
  // the next scene's picture is fetched ahead of time, so the cross-fade never waits on the network
  useEffect(() => {
    if (!artBase || typeof Image === 'undefined') return;
    for (const s of script.slides.slice(index + 1, index + 3)) {
      if (s.bg && s.bg !== cur.bg) new Image().src = `${artBase}/bg/${s.bg}.webp`;
    }
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  // Escape closes the pause card and the part title card (keyboard users could not dismiss them before)
  useEffect(() => {
    if (!minute && !bank && partCard === null && !menu) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (bank) setBank(null);
      else if (minute) setMinute(false);
      else if (partCard !== null) closePart();
      else setMenu(false);
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [minute, bank, partCard, menu, closePart]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (follow) return;
      if (e.key === 'ArrowRight' && isSolved && !last) go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [go, index, isSolved, last, follow]);
  const hint = () => {
    const tier = (tiers[cur.id] ?? 0) + 1;
    setTiers({ ...tiers, [cur.id]: tier });
    setStats((s) => ({ ...s, hints: s.hints + 1 }));
    const h = cur.hints;
    setToast(h ? (tier >= 2 && h[1] ? h[1] : h[0]) : 'Look at the picture and read the words slowly. You can do it!');
  };
  const skip = () => {
    setStats((s) => (s.skipped.includes(cur.id) ? s : { ...s, skipped: [...s.skipped, cur.id] }));
    setSolved((s) => ({ ...s, [cur.id]: true }));
    if (!last) go(index + 1);
  };
  const next = () => {
    if (last) { saveProgress(script.lessonId, null); onFinish?.({ vars, stats, stamps }); }
    else go(index + 1);
  };
  const actorsVisible = cur.actors ?? [];
  const compact = cur.kind !== 'title' && cur.kind !== 'brief';
  // card placement (owner 2026-10-10): two characters -> card in the middle; one character -> card on the opposite side
  const only = actorsVisible.length === 1 ? actorsVisible[0].pos : null;
  const panelAt = only === 'left' ? 'right' : only === 'right' ? 'left' : 'center';
  return (
    <DeckContext.Provider value={ctx}>
      <div className="ad-root" dir="ltr" data-calm={calm || undefined} data-embedded={embedded || undefined} data-follow={follow || undefined} style={artBase ? ({ ['--o-gem-empty' as string]: `url(${artBase}/objects/gem-empty.webp)`, ['--o-gem-full' as string]: `url(${artBase}/objects/gem-full.webp)`, ['--o-ribbon' as string]: `url(${artBase}/objects/ribbon.webp)`, ['--o-frame' as string]: `url(${artBase}/objects/frame.webp)`, ['--o-star' as string]: `url(${artBase}/objects/star.webp)`, ['--o-stamp' as string]: `url(${artBase}/objects/stamp.webp)`, ['--o-ticket' as string]: `url(${artBase}/objects/ticket.webp)`, ['--o-pill-violet' as string]: `url(${artBase}/objects/pill-violet.webp)`, ['--o-pill-blue' as string]: `url(${artBase}/objects/pill-blue.webp)`, ['--o-pill-orange' as string]: `url(${artBase}/objects/pill-orange.webp)` } as React.CSSProperties) : undefined} data-reduced={calm} data-theme={script.theme ?? 'scene'} data-kind={cur.kind} data-part={cur.part} data-stage={cur.stage} data-skill={skillOf(cur.kind) || undefined} data-lock={lockNames ? (cur.lock ?? 0) : undefined} data-hw={!!homework} data-mood={mood ?? undefined} data-testid="deck" onPointerDownCapture={(e) => { const r = e.currentTarget.getBoundingClientRect(); if (r.width > 0 && r.height > 0) lastPt.current = { x: Math.min(92, Math.max(8, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(88, Math.max(12, ((e.clientY - r.top) / r.height) * 100)) }; }}>
        {prevBg && prevBg !== cur.bg && !calm && <Plate id={prevBg} artBase={artBase} key={`out-${prevBg}`} phase="out" />}
        <Plate id={cur.bg} artBase={artBase} key={cur.bg} phase={prevBg && prevBg !== cur.bg && !calm ? 'in' : undefined} />
        <div className="ad-actors" aria-hidden={actorsVisible.length === 0}>
          {actorsVisible.map((a) => <Character key={`${a.who}-${mood ?? 'base'}`} actor={mood ? { ...a, expr: mood } : a} artBase={artBase} small={compact} speaking={!calm && !mood && (speakingWho === a.who || (chat && !(voiceOn && slideHasClip) && ['title', 'brief', 'whosaid', 'teach', 'model', 'convo', 'say', 'wrap'].includes(cur.kind)))} />)}
        </div>
        {!homework && (
          <div className="ad-segs" role="progressbar" aria-label={`Lesson parts: part ${cur.part + 1} of ${parts.length}, ${parts[cur.part]?.name ?? ''}`} aria-valuemin={0} aria-valuemax={parts.length} aria-valuenow={cur.part + 1}>
            {parts.map((pt, k) => {
              const idx = script.slides.map((x, i) => (x.part === k ? i : -1)).filter((i) => i >= 0);
              const first = idx[0] ?? 0;
              const n = idx.length || 1;
              const frac = k < cur.part ? 1 : k > cur.part ? 0 : Math.min(1, (index - first + (isSolved ? 1 : 0)) / n);
              return <span key={pt.name} className="ad-seg" data-state={k < cur.part ? 'done' : k === cur.part ? 'now' : 'todo'} title={`${k + 1} · ${pt.name} · ${pt.minutes} min`} style={{ flexGrow: Math.max(1, pt.minutes), ['--f' as string]: `${Math.round(frac * 100)}%` }}><i /></span>;
            })}
          </div>
        )}
        <header className="ad-strip" aria-label="Slides">
          {!homework && (
            <span className="ad-brand" aria-label="EnglEuphoria Academy"><HubMark size={24} /><span><b>Academy</b><small>{hubInfo.level}{hubInfo.season ? ` · S${hubInfo.season} · E${hubInfo.episode}` : ''}</small></span></span>
          )}
          <span className="ad-lesson">{homework ? `${homework.label} · game ${index + 1} of ${script.slides.length}` : <><i className="ad-lesson-n">{cur.part + 1}</i>{parts[cur.part]?.name}</>}</span>
          <ol>
            {script.slides.map((s, i) => (
              <li key={s.id} data-part-start={i > 0 && s.part !== script.slides[i - 1].part} data-optional={(teacher && s.optional) || undefined}>
                <button type="button" className="ad-dot" data-now={i === index} data-done={!!solved[s.id]} disabled={follow || (!teacher && i > index && !solved[script.slides[i - 1]?.id])} aria-label={`Slide ${i + 1}${i === index ? ' (now)' : ''}`} aria-current={i === index} onClick={() => go(i)} />
              </li>
            ))}
          </ol>
          {lockNames && !homework && (
            <ul className="ad-keys" aria-label={`Keys: ${keys.length} of ${lockNames.length}`}>
              {lockNames.map((nm, k) => <li key={nm} className="ad-keyslot" data-on={keys.includes(k + 1)} data-now={cur.lock === k + 1} title={`Lock ${k + 1}: ${nm}`}><Icon name={keys.includes(k + 1) ? 'key' : 'lock'} /></li>)}
            </ul>
          )}
          {!homework && cur.stage && <span className="ad-stagechip" data-s={cur.stage}>{STAGE_LABEL[cur.stage]}</span>}
          {!homework && (
            <span className="ad-rank" role="status" aria-label={`Level ${rank.n}, ${rank.name}, ${xp} XP`}>
              <span className="ad-rank-name">Lv {rank.n} · {rank.name}</span>
              <span className="ad-rank-bar"><i style={{ width: `${Math.round((rank.into / rank.span) * 100)}%` }} /></span>
            </span>
          )}
          {!homework && combo >= 2 && (
            <span className="ad-flame" key={combo} data-hot={combo >= 5 || undefined} role="status" aria-label={`Streak ${combo}`}>
              <svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 1c1 6 8 9 8 18a8 8 0 0 1-16 0c0-4 2-6 3-8 1 3 2 4 3 4-1-5 0-9 2-14z" /></svg>
              <b>×{combo}</b>
            </span>
          )}
          <span className="ad-count">{index + 1}/{script.slides.length}</span>
        </header>
        {!homework && (stats.spoken ?? 0) > 0 && (
          <div className="ad-say-tally" role="status" aria-label={`Spoken aloud: ${stats.spoken}`}><Icon name="chat" /> {stats.spoken}</div>
        )}
        {!homework && stats.right > 0 && (
          <div className="ad-xp" role="status" aria-label={`${stats.right * 10} XP${combo >= 3 ? `, combo ${combo}` : ''}`}>
            <span className="ad-xp-num" key={stats.right}>{stats.right * 10} XP</span>
            {combo >= 3 && <span className="ad-xp-combo" key={`c${combo}`}>×{combo}</span>}
          </div>
        )}
        <main className="ad-main" data-panel={panelAt} data-shake={shake || undefined}>
          <Guard id={cur.id} onSkip={skip}>
            <SlideView key={cur.id} slide={cur} script={script} onStart={() => go(index + 1)} />
          </Guard>
          {toast && <div className="ad-toast" role="status"><Icon name="bulb" /> {toast}</div>}
        </main>
        {burst && !calm && (
          <div className="ad-burst" key={burst.n} aria-hidden="true" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
            <i className="ad-ring" />
            <b className="ad-plus">+10 XP</b>
            {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ['--a' as string]: `${i * 30}deg`, ['--d' as string]: `${70 + (i % 3) * 26}px` }}>{i % 2 ? '◆' : '✦'}</span>)}
          </div>
        )}
        {levelUp && (
          <div className="ad-levelup" role="status" aria-label={`Level up: Level ${levelUp.n}, ${levelUp.name}`}>
            <span className="ad-levelup-rays" aria-hidden="true" />
            <span className="ad-levelup-kicker">LEVEL UP</span>
            <b>Lv {levelUp.n} · {levelUp.name}</b>
          </div>
        )}
        {achv && (
          <div className="ad-achv" key={achv.id} role="status"><Icon name="star" /> {achv.text}</div>
        )}
        {embedded && !unlocked && voiceOn && (
          <button type="button" className="ad-sound-note" onClick={() => { unlockedRef.current = true; setUnlocked(true); }}>🔊 Tap to hear the lesson</button>
        )}
        <nav className="ad-dock" aria-label="Lesson controls">
          {!follow && <button type="button" className="ad-dockbtn" onClick={() => go(index - 1)} disabled={index === 0}>◀ Back</button>}
          {!homework && SAY_IT_KINDS.includes(cur.kind) && (<button type="button" className="ad-dockbtn ad-dock-say" onClick={sayIt} aria-label="Say it aloud, then tap"><Icon name="chat" /> Say it ✓</button>)}
          <div className="ad-tools">
          <button type="button" className="ad-dockbtn" onClick={hint}>{artBase ? <img className="ad-dockico" src={`${artBase}/objects/btn-hint.webp`} alt="" aria-hidden="true" /> : <Icon name="bulb" />} Hint</button>
          {!embedded && <button type="button" className="ad-dockbtn" onClick={() => setMinute(true)}>{artBase ? <img className="ad-dockico" src={`${artBase}/objects/btn-pause.webp`} alt="" aria-hidden="true" /> : <Icon name="pause" />} <span className="ad-long">I need a minute</span><span className="ad-short">Minute</span></button>}
          {!embedded && <button type="button" className="ad-dockbtn" onClick={() => setMenu(!menu)} aria-expanded={menu}>{artBase ? <img className="ad-dockico" src={`${artBase}/objects/btn-gear.webp`} alt="" aria-hidden="true" /> : <Icon name="gear" />} <span className="ad-long">More</span></button>}
          </div>
          {teacher && !follow && !homework && script.clock && <LessonClock script={script} part={cur.part} />}
          {!follow && (<button type="button" className="ad-dockbtn ad-dock-next" onClick={next} disabled={!isSolved && !freeNext}>{last ? 'Finish ✓' : <>Next {artBase ? <img className="ad-dockico ad-nextico" src={`${artBase}/objects/btn-next.webp`} alt="" aria-hidden="true" /> : '▶'}</>}</button>)}
        </nav>
        {menu && (
          <div className="ad-menu" role="menu">
            {script.slides.some((x) => x.lanes) && (
              <>
                <button type="button" role="menuitem" disabled={lane === 'start'} onClick={() => setVars({ lane: lane === 'stretch' ? 'core' : 'start' })}>Easier ({LANE_LABEL[lane === 'stretch' ? 'core' : 'start'].student})</button>
                <button type="button" role="menuitem" disabled={lane === 'stretch'} onClick={() => setVars({ lane: lane === 'start' ? 'core' : 'stretch' })}>Harder ({LANE_LABEL[lane === 'start' ? 'core' : 'stretch'].student})</button>
              </>
            )}
            <button type="button" role="menuitem" onClick={() => { setBank(loadBank()); setMenu(false); }}><Icon name="note" /> Mistake Bank</button>
            <button type="button" role="menuitem" onClick={skip}><Icon name="skip" /> Skip this slide</button>
            <button type="button" role="menuitemcheckbox" aria-checked={voiceOn} onClick={() => setVoiceOn(!voiceOn)}>{voiceOn ? '✔ ' : ''}Voice {voiceOn ? 'on' : 'off'}</button>
            <button type="button" role="menuitemcheckbox" aria-checked={sfxOn} onClick={() => setSfxOn(!sfxOn)}>{sfxOn ? '✔ ' : ''}Sounds {sfxOn ? 'on' : 'off'}</button>
            <button type="button" role="menuitemcheckbox" aria-checked={calm} onClick={() => setCalm(!calm)}>{calm ? '✔ ' : ''}Calm mode (no animation)</button>
          </div>
        )}
        {partCard !== null && (
          <div className="ad-partcard" data-leaving={partLeaving || undefined} role="dialog" aria-label={`Part ${partCard + 1}: ${parts[partCard].name}`} onClick={closePart}>
            {artBase && (() => { const plate = script.slides.find((x) => x.part === partCard)?.bg; return plate ? <img className="ad-partcard-plate" src={`${artBase}/bg/${plate}.webp`} alt="" aria-hidden="true" draggable={false} onError={(e) => { e.currentTarget.hidden = true; }} /> : null; })()}
            {partCard > 0 && <span className="ad-partcard-clear" role="status"><b>Part {partCard} cleared</b><span aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} data-on={k < clearedStars(stats)} />)}</span></span>}
            <span className="ad-partcard-num" aria-hidden="true">{partCard + 1}</span>
            <span className="ad-partcard-kicker">Part {partCard + 1} of {parts.length} · {parts[partCard].minutes} min</span>
            <span className="ad-partcard-name">{parts[partCard].name}</span>
            <span className="ad-partcard-goal">{script.partGoals?.[partCard] ?? parts[partCard].goal}</span>
            <span className="ad-partcard-pips" aria-hidden="true">{parts.map((_, k) => <i key={k} data-on={k <= partCard} />)}</span>
            <span className="ad-partcard-tap">Tap to start</span>
          </div>
        )}
        {bank && (
          <div className="ad-minute ad-bank" role="dialog" aria-label="Mistake Bank">
            <div>
              <h2><Icon name="note" /> Mistake Bank</h2>
              {bank.length === 0 ? <p>Nothing here yet. When something takes more than one try, it is saved here so you can look back at it.</p> : (
                <ul className="ad-bank-list">
                  {bank.map((e) => <li key={`${e.lesson}-${e.slide}`}><span>{e.label}</span><b>×{e.wrong}</b><small>{e.lesson} · {e.on}</small></li>)}
                </ul>
              )}
              <button type="button" className="ad-btn ad-btn-primary" autoFocus onClick={() => setBank(null)}>Close</button>
            </div>
          </div>
        )}
        {resume && (
          <div className="ad-minute" role="dialog" aria-label="Continue the lesson">
            <div>
              <h2>Welcome back</h2>
              <p>You were on slide {resume.index + 1} of {script.slides.length}. Pick up where you left off?</p>
              <div className="ad-row">
                <button type="button" className="ad-btn ad-btn-primary" autoFocus onClick={continueLesson}>Continue ▸</button>
                <button type="button" className="ad-btn" onClick={startOver}>Start over</button>
              </div>
            </div>
          </div>
        )}
        {minute && (
          <div className="ad-minute" role="dialog" aria-label="Pause">
            <div>
              <h2><Icon name="pause" /> Take a minute</h2>
              <p>No problem. Breathe. Your place is saved.</p>
              <button type="button" className="ad-btn ad-btn-primary" autoFocus onClick={() => setMinute(false)}>I’m ready ▸</button>
            </div>
          </div>
        )}
      </div>
    </DeckContext.Provider>
  );
}
