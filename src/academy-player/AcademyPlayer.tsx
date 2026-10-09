// Academy lesson player — host component. Academy-only; imports React, framer-motion and files in this folder.
// Pictures: real art when `artBase` is set and loads, otherwise clearly-labelled placeholders. Stills hold still: only opacity
// cross-fades are used (owner rule: no zoom, pan, parallax or scale loops on any picture). Voice: recorded clips only, never TTS.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './academy-player.css';
import { Backdrop, Sprite } from './art';
import { accuracy, backlog, initState, interpolateBeat, step, type PlayerEvent, type PlayerState } from './engine';
import { BuildBlock, ChatStory, ChoiceBlock, ComicPanels, DialogueBox, FlashDeck, FormBlock, MatchBlock, ProfileBlock, RecordBlock, RewardBurst, RunStrip, SortBlock, TicksBlock, TitleCard } from './parts';
import type { CastName, SceneScript } from './scriptTypes';
import { playVoice, stopVoice } from './voice';

export type PlayerSignal = { type: 'minute' | 'hint' | 'finish'; rev: number };

export interface AcademyPlayerProps {
  script: SceneScript;
  theme?: 'explorer' | 'studio';
  /** base URL of real art, e.g. "/academy-art". Omit to use placeholders. */
  artBase?: string;
  seed?: number;
  /** skip the "tap to start" gate (tests, previews) */
  autoStart?: boolean;
  /** called for teacher-visible signals ("I need a minute", hint use, finish) */
  onSignal?: (s: PlayerSignal) => void;
}

function usePrefersReduced() {
  const [r, setR] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return r;
}

export function AcademyPlayer({ script, theme: themeProp = 'studio', artBase, seed = 1, autoStart = false, onSignal }: AcademyPlayerProps) {
  const [state, setState] = useState<PlayerState>(() => initState(script, seed));
  const [started, setStarted] = useState(autoStart);
  const [theme, setTheme] = useState(themeProp);
  const [scale, setScale] = useState(1);
  const osReduced = usePrefersReduced();
  const [reducedPref, setReducedPref] = useState<boolean | null>(null);
  const reduced = reducedPref ?? osReduced;
  const [muted, setMuted] = useState(false);
  const [resting, setResting] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [hintTier, setHintTier] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cardSeg, setCardSeg] = useState<number | null>(null);
  const shownSegs = useRef<Set<number>>(new Set());
  const [burst, setBurst] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const prevRight = useRef(0);

  const go = useCallback((e: PlayerEvent) => setState((s) => step(script, s, e)), [script]);
  const rawBeat = script.beats[state.beatIndex];
  const beat = useMemo(() => (rawBeat ? interpolateBeat(rawBeat, state.vars) : rawBeat), [rawBeat, state.vars]);
  useEffect(() => setHintTier(0), [state.beatIndex]);

  // recorded voice for dialogue lines (silent if no clip)
  useEffect(() => {
    if (!started || resting) return;
    if (beat?.t === 'say') void playVoice(beat.voice, { muted });
    return () => stopVoice();
  }, [beat, started, muted, resting]);

  useEffect(() => {
    if (state.finished) onSignal?.({ type: 'finish', rev: state.rev });
  }, [state.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // keyboard: Enter / Space / → next on dialogue; ← back; Esc closes overlays
  useEffect(() => {
    const on = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setCardSeg(null);
        setShowLog(false);
        setResting(false);
      }
      if (!started || resting) return;
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === 'BUTTON' || tag === 'INPUT') return;
      if ((ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') && beat?.t === 'say') {
        ev.preventDefault();
        go({ type: 'next' });
      }
      if (ev.key === 'ArrowLeft') go({ type: 'back' });
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [beat, go, started, resting]);

  const sprites = useMemo(() => {
    const out = Object.entries(state.stage.sprites).map(([who, s]) => ({ who: who as CastName, pos: s!.pos, expr: s!.expr }));
    if (beat?.t === 'say' && beat.who !== 'narrator' && beat.expr) {
      const sp = out.find((o) => o.who === beat.who);
      if (sp) sp.expr = beat.expr;
    }
    return out;
  }, [state.stage.sprites, beat]);
  const speaker = beat?.t === 'say' && beat.who !== 'narrator' ? beat.who : null;
  const fade = { duration: reduced ? 0 : 0.28 };
  const acc = accuracy(state);
  const right = state.answers.filter((a) => a.correct).length;

  // cinematic title card once per run-of-show part (never replayed when going Back)
  useEffect(() => {
    if (!started || shownSegs.current.has(state.stage.segment)) return;
    shownSegs.current.add(state.stage.segment);
    setCardSeg(state.stage.segment);
  }, [started, state.stage.segment]);
  useEffect(() => {
    if (cardSeg === null) return;
    const id = window.setTimeout(() => setCardSeg(null), reduced ? 700 : 1700);
    return () => window.clearTimeout(id);
  }, [cardSeg, reduced]);

  // the speaker's mouth moves while the line types out
  useEffect(() => {
    if (!started || beat?.t !== 'say') {
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const id = window.setTimeout(() => setSpeaking(false), Math.min(4500, beat.text.length * 30 + 250));
    return () => window.clearTimeout(id);
  }, [started, state.beatIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // star burst when a new correct answer arrives (success-dependent reward only)
  useEffect(() => {
    if (right > prevRight.current && !reduced) {
      setBurst((b) => b + 1);
      const id = window.setTimeout(() => setBurst(0), 700);
      prevRight.current = right;
      return () => window.clearTimeout(id);
    }
    prevRight.current = right;
  }, [right, reduced]);

  const showStageArt = beat?.t === 'say' || beat?.t === 'choice';

  return (
    <div className="ap-root" data-theme={theme} data-reduced={reduced} style={{ fontSize: `calc(var(--ap-font-size) * ${scale})` }} aria-label="Lesson player">
      <RunStrip title={script.title} segment={state.stage.segment} />

      <main className="ap-stage">
        <AnimatePresence initial={false}>
          {state.stage.bg && (
            <motion.div key={state.stage.bg.id} style={{ position: 'absolute', inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
              <Backdrop id={state.stage.bg.id} alt={state.stage.bg.alt} artBase={artBase} />
            </motion.div>
          )}
        </AnimatePresence>

        {showStageArt && (
          <div className="ap-sprites">
            <AnimatePresence initial={false}>
              {sprites.map((s) => (
                <motion.div key={s.who} className="ap-sprite" data-pos={s.pos} data-dim={speaker !== null && speaker !== s.who} initial={reduced ? { opacity: 0 } : { opacity: 0, x: s.pos === 'left' ? -36 : s.pos === 'right' ? 36 : 0, y: s.pos === 'center' ? 24 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0 }} transition={reduced ? fade : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  <Sprite who={s.who} expr={s.expr} artBase={artBase} speaking={speaking && speaker === s.who} animate={!reduced} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {beat?.t === 'say' && <DialogueBox key={state.beatIndex} beat={beat} reduced={reduced} onNext={() => go({ type: 'next' })} onReplay={() => void playVoice(beat.voice, { muted })} />}

        {beat?.t === 'choice' && (
          <ChoiceBlock key={state.beatIndex}
            prompt={beat.prompt}
            options={beat.options}
            hintTier={hintTier}
            onWrong={() => go({ type: 'answer', correct: false })}
            onRight={(i) => go({ type: 'choose', index: i })}
          />
        )}

        {beat?.t === 'chat' && (
          <ChatStory key={state.beatIndex}
            title={beat.title}
            messages={beat.messages}
            reply={beat.reply}
            hintTier={hintTier}
            onContinue={() => go({ type: 'next' })}
            onReplyWrong={() => go({ type: 'answer', correct: false })}
            onReplyRight={(i) => go({ type: 'choose', index: i })}
          />
        )}

        {beat?.t === 'panels' && <ComicPanels key={state.beatIndex} layout={beat.layout} panels={beat.panels} artBase={artBase} onContinue={() => go({ type: 'next' })} />}

        {beat?.t === 'flash' && (
          <FlashDeck key={state.beatIndex}
            title={beat.title}
            cards={beat.cards}
            seed={state.seed + state.beatIndex}
            onReplay={(v) => void playVoice(v, { muted })}
            onCheck={(correct) => go({ type: 'answer', correct })}
            onDone={() => go({ type: 'next' })}
          />
        )}

        {beat?.t === 'build' && (
          <BuildBlock key={state.beatIndex} prompt={beat.prompt} target={beat.target} extraTiles={beat.extraTiles} hint={beat.hint} hintTier={hintTier} seed={state.seed + state.beatIndex} onWrong={() => go({ type: 'answer', correct: false })} onDone={(first) => { if (first) go({ type: 'answer', correct: true }); go({ type: 'next' }); }} />
        )}

        {beat?.t === 'sort' && <SortBlock key={state.beatIndex} prompt={beat.prompt} cards={beat.cards} yes={beat.yes} no={beat.no} onDone={(known) => go({ type: 'fill', values: { [beat.key]: known } })} />}

        {beat?.t === 'match' && <MatchBlock key={state.beatIndex} prompt={beat.prompt} pairs={beat.pairs} seed={state.seed + state.beatIndex} onWrong={() => go({ type: 'answer', correct: false })} onRight={() => go({ type: 'answer', correct: true })} onDone={() => go({ type: 'next' })} />}

        {beat?.t === 'profile' && <ProfileBlock key={state.beatIndex} title={beat.title} prompt={beat.prompt} rows={beat.rows} hotspots={beat.hotspots} gloss={beat.gloss} onDone={() => go({ type: 'next' })} />}

        {beat?.t === 'form' && <FormBlock key={state.beatIndex} prompt={beat.prompt} fields={beat.fields} onDone={(values) => go({ type: 'fill', values })} />}

        {beat?.t === 'record' && <RecordBlock key={state.beatIndex} prompt={beat.prompt} model={beat.model} onContinue={() => go({ type: 'next' })} />}

        {beat?.t === 'ticks' && <TicksBlock key={state.beatIndex} prompt={beat.prompt} items={beat.items} onDone={() => go({ type: 'next' })} />}

        {beat?.t === 'end' && (
          <div className="ap-panel" style={{ justifyContent: 'center' }}>
            <div className="ap-end">
              <div className="ap-star" aria-hidden="true">★ ★ ★</div>
              <p className="ap-prompt">Lesson done!</p>
              {beat.summary && <p className="ap-feedback">{beat.summary}</p>}
              <p className="ap-chunk">
                {acc === null ? 'No questions this time.' : `${right} of ${state.answers.length} answers were right. Wrong tries count too — that is how we learn.`}
              </p>
              <button type="button" className="ap-btn ap-btn-primary" onClick={() => go({ type: 'restart' })}>Play again</button>
            </div>
          </div>
        )}

        {burst > 0 && <RewardBurst key={burst} />}

        {cardSeg !== null && <TitleCard index={cardSeg} onDone={() => setCardSeg(null)} />}

        {showLog && (
          <aside className="ap-backlog" aria-label="What they said">
            <div className="ap-row">
              <b>What they said</b>
              <button type="button" className="ap-btn" onClick={() => setShowLog(false)}>Close</button>
            </div>
            {backlog(script, state).map((l, i) => (
              <p key={i}><b>{l.who}:</b> {l.text}</p>
            ))}
            {backlog(script, state).length === 0 && <p className="ap-chunk">Nothing yet.</p>}
          </aside>
        )}

        {!started && (
          <div className="ap-overlay" role="dialog" aria-label="Start">
            <div className="ap-overlay-box">
              <p className="ap-prompt">Ready?</p>
              <p className="ap-chunk">This lesson uses recorded voices. If a sound is missing it stays quiet. You can slow down, replay, or take a minute at any time.</p>
              <button type="button" className="ap-btn ap-btn-primary" onClick={() => setStarted(true)}>Start ▸</button>
            </div>
          </div>
        )}

        {resting && (
          <div className="ap-overlay" role="dialog" aria-label="Taking a minute">
            <div className="ap-overlay-box">
              <p className="ap-prompt">Take your time.</p>
              <p className="ap-chunk">Your teacher knows you need a minute. Nothing is running.</p>
              <button type="button" className="ap-btn ap-btn-primary" onClick={() => setResting(false)}>I'm ready</button>
            </div>
          </div>
        )}
      </main>

      <nav className="ap-dock" aria-label="Comfort controls">
        <div className="ap-dock-group">
          <button type="button" className="ap-btn" disabled={hintTier >= 3 || !(beat?.t === 'choice' || beat?.t === 'chat' || beat?.t === 'build')} onClick={() => { setHintTier((h) => Math.min(3, h + 1)); onSignal?.({ type: 'hint', rev: state.rev }); }} aria-label="Hint"><span className="ap-ico" aria-hidden="true">💡</span>Hint</button>
          <button type="button" className="ap-btn" disabled={state.history.length === 0} onClick={() => go({ type: 'back' })} aria-label="Go back"><span className="ap-ico" aria-hidden="true">↶</span>Back</button>
          <button type="button" className="ap-btn" onClick={() => setShowLog(true)} aria-label="Show what they said"><span className="ap-ico" aria-hidden="true">☰</span>Lines</button>
          <button type="button" className="ap-btn" onClick={() => { setResting(true); stopVoice(); onSignal?.({ type: 'minute', rev: state.rev }); }} aria-label="I need a minute"><span className="ap-ico" aria-hidden="true">⏸</span>I need a minute</button>
          <button type="button" className="ap-btn" onClick={() => setSettingsOpen((o) => !o)} aria-expanded={settingsOpen} aria-label="Settings"><span className="ap-ico" aria-hidden="true">⚙</span>Settings</button>
        </div>
        {settingsOpen && (
          <div className="ap-settings" role="group" aria-label="Settings">
            <button type="button" className="ap-btn" onClick={() => setScale((s) => Math.max(0.9, +(s - 0.1).toFixed(1)))} aria-label="Smaller text">A− Smaller text</button>
            <button type="button" className="ap-btn" onClick={() => setScale((s) => Math.min(1.4, +(s + 0.1).toFixed(1)))} aria-label="Bigger text">A+ Bigger text</button>
            <button type="button" className="ap-btn" onClick={() => setTheme((t) => (t === 'studio' ? 'explorer' : 'studio'))} aria-label="Switch look">{theme === 'studio' ? '🌙 Studio look' : '☀ Explorer look'}</button>
            <button type="button" className="ap-btn" onClick={() => setReducedPref(!reduced)} aria-pressed={reduced} aria-label="Reduce motion">{reduced ? 'Motion: off' : 'Motion: on'}</button>
            <button type="button" className="ap-btn" onClick={() => setMuted((m) => !m)} aria-pressed={muted} aria-label="Mute sound">{muted ? '🔇 Sound off' : '🔈 Sound on'}</button>
          </div>
        )}
      </nav>
    </div>
  );
}

export default AcademyPlayer;
