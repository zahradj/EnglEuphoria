import type React from 'react';
// Academy Deck player. A lesson is a deck of slides; each slide is a full scene plate with ONE game on top.
// Reliable by design: the deck holds only the slide number, "solved" flags, the student's answers and the stamps earned. Every slide is
// wrapped in an error boundary (a broken game offers Try again / Skip, it never freezes the lesson). No timers, no ranking, no voices yet.
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './deck.css';
import { DeckContext, type DeckCtx } from './ctx';
import { Icon } from './Icon';
import { Character, Plate } from './Stage';
import { BadgeView, BriefView, DialView, TitleView } from './slides/intro';
import { HuntView, ShadowView } from './slides/homework';
import { ModelView, TeachView } from './slides/teach';
import { CardView, WrapView } from './slides/card';
import { FindWrongView, SpellView } from './slides/letters';
import { LockersView, NumTrainView, PadlockView } from './slides/numbers';
import { BorderView, MemoryView } from './slides/passport';
import { ConvoView, FadeView, PhoneChatView, SayView, WhoSaidView } from './slides/talk';
import { PARTS, type DeckScript, type Slide, type Stats, type Vars } from './types';

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

function SlideView({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case 'title': return <TitleView slide={slide} />;
    case 'brief': return <BriefView slide={slide} />;
    case 'badge': return <BadgeView slide={slide} />;
    case 'dial': return <DialView slide={slide} />;
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
    case 'phonechat': return <PhoneChatView slide={slide} />;
    case 'fade': return <FadeView slide={slide} />;
    case 'card': return <CardView slide={slide} />;
    case 'say': return <SayView slide={slide} />;
    case 'wrap': return <WrapView slide={slide} />;
  }
}

export interface DeckProps {
  script: DeckScript;
  artBase?: string;
  /** teacher view: every slide can be opened from the strip */
  teacher?: boolean;
  /** live classroom: controlled slide index (the teacher moves the class) */
  slide?: number;
  onSlide?: (index: number) => void;
  onFinish?: (result: { vars: Vars; stats: Stats; stamps: string[] }) => void;
  /** homework quest mode: no part title cards, the strip label is `label`, and every solved slide reports its wrong tries */
  homework?: { label: string };
  onSlideDone?: (slide: Slide, result: { wrong: number }) => void;
}

export function Deck({ script, artBase, teacher = false, slide: controlled, onSlide, onFinish, homework, onSlideDone }: DeckProps) {
  const [own, setOwn] = useState(0);
  const index = Math.min(controlled ?? own, script.slides.length - 1);
  const go = useCallback((i: number) => {
    const n = Math.max(0, Math.min(script.slides.length - 1, i));
    if (controlled === undefined) setOwn(n);
    onSlide?.(n);
  }, [controlled, onSlide, script.slides.length]);
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [vars, setVarsState] = useState<Vars>({ num: '4-2-7', numw: 'four, two, seven' });
  const [stamps, setStamps] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ right: 0, wrong: 0, hints: 0, skipped: [] });
  const [tiers, setTiers] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [minute, setMinute] = useState(false);
  const [menu, setMenu] = useState(false);
  const [burst, setBurst] = useState(0);
  const [chat, setChat] = useState(false);
  const [mood, setMood] = useState<'happy' | 'concerned' | null>(null);
  const moodTimer = useRef<number>();
  const react = useCallback((m: 'happy' | 'concerned') => {
    setMood(m);
    window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood(null), 1400);
  }, []);
  const [partCard, setPartCard] = useState<number | null>(homework ? null : 0);
  const shownParts = useRef<Set<number>>(new Set());
  const [calm, setCalm] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const cur = script.slides[index];
  const curId = useRef(cur.id);
  curId.current = cur.id;
  const wrongBySlide = useRef<Record<string, number>>({});
  const slideRef = useRef<Slide>(cur);
  slideRef.current = cur;
  const cbRef = useRef(onSlideDone);
  cbRef.current = onSlideDone;
  const done = useCallback(() => setSolved((s) => {
    if (s[curId.current]) return s;
    // report once per slide, outside the state updater's purity: schedule it
    const slideNow = slideRef.current;
    window.setTimeout(() => cbRef.current?.(slideNow, { wrong: wrongBySlide.current[slideNow.id] ?? 0 }), 0);
    return { ...s, [curId.current]: true };
  }), []);
  const setVars = useCallback((p: Vars) => setVarsState((v) => ({ ...v, ...p })), []);
  const award = useCallback((id: string) => setStamps((s) => (s.includes(id) ? s : [...s, id])), []);
  const right = useCallback(() => {
    setStats((s) => ({ ...s, right: s.right + 1 }));
    react('happy');
  }, [react]);
  const wrong = useCallback(() => {
    wrongBySlide.current[curId.current] = (wrongBySlide.current[curId.current] ?? 0) + 1;
    setStats((s) => ({ ...s, wrong: s.wrong + 1 }));
    react('concerned');
  }, [react]);
  const ctx: DeckCtx = useMemo(() => ({ artBase, vars, setVars, done, right, wrong, award, stamps, reduced: calm, seed: 1000 + index * 17 }), [artBase, vars, setVars, done, right, wrong, award, stamps, calm, index]);
  const isSolved = !!solved[cur.id];
  const last = index === script.slides.length - 1;
  // the cast chatter for a moment when a slide opens (no recorded clips yet; real timing will come from the audio)
  useEffect(() => {
    setChat(true);
    const t = window.setTimeout(() => setChat(false), 2400);
    return () => window.clearTimeout(t);
  }, [index]);
  useEffect(() => {
    setToast(null);
    setMenu(false);
  }, [index]);
  // a cinematic title card when a new part of the lesson starts (once per part; tap to skip, closes by itself)
  useEffect(() => {
    const part = cur.part;
    if (homework) {
      setPartCard(null);
      return;
    }
    if (shownParts.current.has(part)) return;
    shownParts.current.add(part);
    setPartCard(part);
    const t = window.setTimeout(() => setPartCard(null), 2200);
    return () => window.clearTimeout(t);
  }, [cur.part]);
  // a short sparkle burst on every correct answer (UI motion tied to success; none in Calm mode)
  useEffect(() => {
    if (stats.right > 0) setBurst((b) => b + 1);
  }, [stats.right]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key === 'ArrowRight' && isSolved && !last) go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [go, index, isSolved, last]);
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
    if (last) onFinish?.({ vars, stats, stamps });
    else go(index + 1);
  };
  const actorsVisible = cur.actors ?? [];
  const compact = cur.kind !== 'title' && cur.kind !== 'brief';
  // card placement (owner 2026-10-10): two characters -> card in the middle; one character -> card on the opposite side
  const only = actorsVisible.length === 1 ? actorsVisible[0].pos : null;
  const panelAt = only === 'left' ? 'right' : only === 'right' ? 'left' : 'center';
  return (
    <DeckContext.Provider value={ctx}>
      <div className="ad-root" style={artBase ? ({ ['--o-gem-empty' as string]: `url(${artBase}/objects/gem-empty.webp)`, ['--o-gem-full' as string]: `url(${artBase}/objects/gem-full.webp)`, ['--o-ribbon' as string]: `url(${artBase}/objects/ribbon.webp)`, ['--o-frame' as string]: `url(${artBase}/objects/frame.webp)` } as React.CSSProperties) : undefined} data-reduced={calm} data-kind={cur.kind} data-hw={!!homework} data-mood={mood ?? undefined} data-testid="deck">
        <Plate id={cur.bg} artBase={artBase} key={cur.bg} />
        <div className="ad-actors" aria-hidden={actorsVisible.length === 0}>
          {actorsVisible.map((a) => <Character key={`${a.who}-${mood ?? 'base'}`} actor={mood ? { ...a, expr: mood } : a} artBase={artBase} small={compact} speaking={chat && !calm && !mood && ['title', 'brief', 'whosaid', 'teach', 'model', 'convo', 'say', 'wrap'].includes(cur.kind)} />)}
        </div>
        <header className="ad-strip" aria-label="Slides">
          <span className="ad-lesson">{homework ? `${homework.label} · game ${index + 1} of ${script.slides.length}` : PARTS[cur.part]?.name}</span>
          <ol>
            {script.slides.map((s, i) => (
              <li key={s.id} data-part-start={i > 0 && s.part !== script.slides[i - 1].part}>
                <button type="button" className="ad-dot" data-now={i === index} data-done={!!solved[s.id]} disabled={!teacher && i > index && !solved[script.slides[i - 1]?.id]} aria-label={`Slide ${i + 1}${i === index ? ' (now)' : ''}`} aria-current={i === index} onClick={() => go(i)} />
              </li>
            ))}
          </ol>
          <span className="ad-count">{index + 1}/{script.slides.length}</span>
        </header>
        <main className="ad-main" data-panel={panelAt}>
          <Guard id={cur.id} onSkip={skip}>
            <SlideView key={cur.id} slide={cur} />
          </Guard>
          {toast && <div className="ad-toast" role="status"><Icon name="bulb" /> {toast}</div>}
        </main>
        {burst > 0 && !calm && (
          <div className="ad-burst" key={burst} aria-hidden="true">
            <b className="ad-plus">+1 ★</b>
            {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ['--a' as string]: `${i * 30}deg`, ['--d' as string]: `${70 + (i % 3) * 26}px` }}>{i % 2 ? '★' : '✦'}</span>)}
          </div>
        )}
        <nav className="ad-dock" aria-label="Lesson controls">
          <button type="button" className="ad-dockbtn" onClick={() => go(index - 1)} disabled={index === 0}>◀ Back</button>
          <button type="button" className="ad-dockbtn" onClick={hint}>{artBase ? <img className="ad-dockico" src={`${artBase}/objects/btn-hint.webp`} alt="" aria-hidden="true" /> : <Icon name="bulb" />} Hint</button>
          <button type="button" className="ad-dockbtn" onClick={() => setMinute(true)}>{artBase ? <img className="ad-dockico" src={`${artBase}/objects/btn-pause.webp`} alt="" aria-hidden="true" /> : <Icon name="pause" />} <span className="ad-long">I need a minute</span><span className="ad-short">Minute</span></button>
          <button type="button" className="ad-dockbtn" onClick={() => setMenu(!menu)} aria-expanded={menu}>{artBase ? <img className="ad-dockico" src={`${artBase}/objects/btn-gear.webp`} alt="" aria-hidden="true" /> : <Icon name="gear" />} More</button>
          <button type="button" className="ad-dockbtn ad-dock-next" onClick={next} disabled={!isSolved}>{last ? 'Finish ✓' : <>Next {artBase ? <img className="ad-dockico ad-nextico" src={`${artBase}/objects/btn-next.webp`} alt="" aria-hidden="true" /> : '▶'}</>}</button>
        </nav>
        {menu && (
          <div className="ad-menu" role="menu">
            <button type="button" role="menuitem" onClick={skip}><Icon name="skip" /> Skip this slide</button>
            <button type="button" role="menuitemcheckbox" aria-checked={calm} onClick={() => setCalm(!calm)}>{calm ? '✔ ' : ''}Calm mode (no animation)</button>
          </div>
        )}
        {partCard !== null && (
          <div className="ad-partcard" role="dialog" aria-label={`Part ${partCard + 1}: ${PARTS[partCard].name}`} onClick={() => setPartCard(null)}>
            <span className="ad-partcard-num" aria-hidden="true">{partCard + 1}</span>
            <span className="ad-partcard-kicker">Part {partCard + 1} of {PARTS.length} · {PARTS[partCard].minutes} min</span>
            <span className="ad-partcard-name">{PARTS[partCard].name}</span>
            <span className="ad-partcard-goal">{PARTS[partCard].goal}</span>
            <span className="ad-partcard-pips" aria-hidden="true">{PARTS.map((_, k) => <i key={k} data-on={k <= partCard} />)}</span>
            <span className="ad-partcard-tap">Tap to start</span>
          </div>
        )}
        {minute && (
          <div className="ad-minute" role="dialog" aria-label="Pause">
            <div>
              <h2><Icon name="pause" /> Take a minute</h2>
              <p>No problem. Breathe. Your place is saved.</p>
              <button type="button" className="ad-btn ad-btn-primary" onClick={() => setMinute(false)}>I’m ready ▸</button>
            </div>
          </div>
        )}
      </div>
    </DeckContext.Provider>
  );
}
