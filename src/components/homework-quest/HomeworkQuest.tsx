import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { HomeworkQuest as Quest, QuestLevel, QuestVoice, Box } from '@/content/homework-quests/types';
import { dressUpWrongLine } from '@/content/homework-quests/types';
import { speak, stopSpeaking, playLetterPhonic, unlockAudio } from '@/content/playground-library/unit1/audio';
import { soundLabel } from '@/content/playground-library/soundLabel';
import { QUEST_CSS } from './questStyles';
import { JungleTheme } from '@/components/student/kids/JungleTheme';

/**
 * Plays any Homework Quest (src/content/homework-quests). Voices are the
 * recorded character clips via unit1/audio.ts `speak()` — never the
 * browser's voice (CLAUDE.md "Voice").
 */

type LevelProps<K extends QuestLevel['kind']> = {
  level: Extract<QuestLevel, { kind: K }>;
  quest: Quest;
  say: (text: string, voice?: QuestVoice) => Promise<void>;
  praise: () => void;
  tryAgain: () => void;
  miss: () => void;
  star: (el: Element | null) => void;
  done: (misses: number) => void;
  setDots: (total: number, on: number) => void;
};

const shuffle = <T,>(a: readonly T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const starsFor = (m: number) => (m === 0 ? 3 : m <= 2 ? 2 : 1);
const pct = (b: Box): CSSProperties => ({ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` });
const isImg = (s: string) => s.startsWith('/') || s.startsWith('./') || s.startsWith('http');
const Icon = ({ s, size = '70%' }: { s: string; size?: string }) => (isImg(s) ? <img src={s} alt="" style={{ width: size }} draggable={false} /> : <>{s}</>);
const highlight = (text: string, focus?: string) => {
  if (!focus) return text;
  // `focus` may be one sound ('ch') or several ('l|w').
  const parts = text.split(new RegExp(`(${focus})`, 'gi'));
  const isFocus = new RegExp(`^(?:${focus})$`, 'i');
  return parts.map((p, i) => (p && isFocus.test(p) ? <b key={i}>{p}</b> : <span key={i}>{p}</span>));
};

/* ---------- tiny sound effects (synth tones, not speech) ---------- */
let actx: AudioContext | null = null;
function tone(f: number, d: number, type: OscillatorType = 'triangle', delay = 0, gain = 0.16) {
  try {
    actx = actx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t0 = actx.currentTime + delay, o = actx.createOscillator(), v = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(gain, t0 + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(v).connect(actx.destination); o.start(t0); o.stop(t0 + d + 0.02);
  } catch { /* noop */ }
}
const sfx = {
  right: () => { tone(660, 0.12); tone(990, 0.16, 'triangle', 0.08); tone(1320, 0.2, 'sine', 0.15, 0.12); },
  wrong: () => tone(300, 0.25, 'sawtooth', 0, 0.1),
  magic: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, 'triangle', i * 0.07, 0.14)),
  pop: () => { tone(420, 0.07, 'sine'); tone(880, 0.07, 'triangle', 0.04, 0.1); },
};

function shake(el: Element | null) { if (!el) return; el.classList.remove('hq-bad'); void (el as HTMLElement).offsetWidth; el.classList.add('hq-bad'); }

/* ---------- Pointer drag (reports what's under the pointer on drop) ---------- */
type DragHandlers = { onMove: (els: Element[]) => void; onDrop: (els: Element[], e: PointerEvent) => boolean };
/** A draggable element. Stable component + handler ref, so a parent
 *  re-render mid-drag (e.g. a drop-zone hover highlight) never resets it. */
function DragItem({ handlers, className, style, label, children }: { handlers: DragHandlers; className: string; style?: CSSProperties; label: string; children?: ReactNode }) {
  const h = useRef(handlers); h.current = handlers;
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let sx = 0, sy = 0, on = false;
    const under = (x: number, y: number) => { el.style.visibility = 'hidden'; const r = document.elementsFromPoint(x, y); el.style.visibility = ''; return r; };
    const down = (e: PointerEvent) => { on = true; sx = e.clientX; sy = e.clientY; el.setPointerCapture(e.pointerId); el.classList.add('hq-dragging'); sfx.pop(); };
    const move = (e: PointerEvent) => { if (!on) return; el.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) scale(1.1)`; h.current.onMove(under(e.clientX, e.clientY)); };
    const end = (e: PointerEvent) => { if (!on) return; on = false; el.classList.remove('hq-dragging'); const ok = h.current.onDrop(under(e.clientX, e.clientY), e); if (!ok) { el.style.transform = ''; shake(el); } };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', end); el.removeEventListener('pointercancel', end); };
  }, []);
  return <div ref={ref} className={className} style={style} role="img" aria-label={label}>{children}</div>;
}

/** The game screen's picture. It fills the free space without ever making the
 *  page scroll, and keeps the picture's shape so % hotspots stay exact.
 *  The picture holds still (CLAUDE.md: never zoom or pan a still picture). */
function Stage({ img, aspect = 1376 / 768, night, children, stageRef, className = '' }: { img: string; aspect?: number; night?: boolean; still?: boolean; children?: ReactNode; stageRef?: React.Ref<HTMLDivElement>; className?: string }) {
  const box = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const w = Math.min(W, H * aspect);
      setSize((o) => (o && Math.abs(o.w - w) < 1 ? o : { w, h: w / aspect }));
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);
  return (
    <div ref={box} className="hq-stagebox">
    <div ref={stageRef} className={`hq-stage ${className}`} style={size ? { width: size.w, height: size.h, ['--ar' as string]: String(aspect) } : { width: '100%', aspectRatio: String(aspect), ['--ar' as string]: String(aspect) }}>
      <div className="hq-art" style={{ backgroundImage: `url('${img}')` }} />
      {night && <div className="hq-night">{Array.from({ length: 16 }, (_, i) => <span key={i} className="hq-twinkle" style={{ left: `${(i * 37 + 5) % 100}%`, top: `${(i * 53 + 9) % 90}%`, animationDelay: `${(i * 170) % 2000}ms` }} />)}</div>}
      {children}
    </div>
    </div>
  );
}
function HearBtn({ onClick, label = '🔊 Hear it' }: { onClick: () => void; label?: string }) {
  return <button className="hq-hear" onClick={onClick}>{label}</button>;
}

/* =========================== Levels =========================== */

function ScenePuzzle({ level, quest, say, praise, tryAgain, miss, star, done, setDots }: LevelProps<'scene-puzzle'>) {
  const order = useMemo(() => (level.numbered ? [...level.pieces] : shuffle(level.pieces)), [level]);
  const tray = useMemo(() => shuffle(level.pieces), [level]);
  const [i, setI] = useState(0);
  const [filled, setFilled] = useState<string[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const misses = useRef(0);
  const iRef = useRef(0); iRef.current = i;
  useEffect(() => { setDots(order.length, i); }, [i, order.length, setDots]);
  useEffect(() => { void say(level.intro).then(() => say(order[0].line)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handlersFor = (p: (typeof level.pieces)[number]): DragHandlers => ({
    onMove: (els) => setHover((els.find((e) => (e as HTMLElement).dataset?.slot) as HTMLElement | undefined)?.dataset.slot ?? null),
    onDrop: (els) => {
      setHover(null);
      const slot = els.find((e) => (e as HTMLElement).dataset?.slot) as HTMLElement | undefined;
      if (!slot) return false;
      const target = order[iRef.current];
      if (target && p.label === target.label && slot.dataset.slot === p.label) {
        sfx.magic(); star(slot); praise();
        setFilled((f) => [...f, p.label]);
        const next = iRef.current + 1; setI(next);
        if (next >= order.length) window.setTimeout(() => done(misses.current), 1600);
        else window.setTimeout(() => void say(order[next].line), 1300);
        return true;
      }
      misses.current++; miss(); tryAgain(); return false;
    },
  });
  const current = order[i];
  return (
    <>
      <Stage img={level.img} aspect={level.aspect} still>
        {level.pieces.map((p) => {
          const n = order.indexOf(p) + 1;
          return (
            <div key={p.label} data-slot={p.label} className={`hq-slot ${filled.includes(p.label) ? 'filled' : ''} ${hover === p.label ? 'hover' : ''} ${level.numbered && current?.label === p.label ? 'now' : ''}`} style={pct(p.box)}>
              {level.numbered ? <span className="hq-num">{n}</span> : '?'}
            </div>
          );
        })}
        <HearBtn label="🔊 Hear it again" onClick={() => current && void say(current.line)} />
      </Stage>
      <div className="hq-tray">{tray.filter((p) => !filled.includes(p.label)).map((p) => (
        <DragItem key={p.label} handlers={handlersFor(p)} className="hq-piece" label="A picture piece"
          style={{ backgroundImage: `url('${level.img}')`, backgroundSize: `${10000 / p.box.w}% ${10000 / p.box.h}%`, backgroundPosition: `${(p.box.x / (100 - p.box.w)) * 100}% ${(p.box.y / (100 - p.box.h)) * 100}%`, aspectRatio: String((p.box.w * level.aspect) / p.box.h) }} />
      ))}</div>
    </>
  );
}

function TapHotspot({ level, say, praise, tryAgain, miss, star, done, setDots }: LevelProps<'tap-hotspot'>) {
  const rounds = level.rounds;
  const [r, setR] = useState(0);
  const [right, setRight] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const misses = useRef(0);
  useEffect(() => { setDots(rounds.length, r); setRight(null); if (r < rounds.length) void (r === 0 ? say(level.intro).then(() => say(rounds[0].line)) : say(rounds[r].line)); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  const R = rounds[r];
  const tap = (label: string, el: HTMLElement) => {
    if (!R || right) return;
    if (label === R.target) { setRight(label); sfx.right(); star(el); praise(); window.setTimeout(() => { if (r + 1 >= rounds.length) done(misses.current); else setR(r + 1); }, 1500); }
    else { setWrong(label); window.setTimeout(() => setWrong(null), 450); misses.current++; miss(); tryAgain(); }
  };
  return (
    <>
      <Stage img={level.img} aspect={level.aspect}>
        {level.spots.map((s) => (
          <button key={s.label} aria-label={s.label} className={`hq-hot ${right === s.label ? 'right' : ''} ${wrong === s.label ? 'wrong' : ''}`} style={pct(s.box)} onClick={(e) => tap(s.label, e.currentTarget)} />
        ))}
        {right && level.marker && (() => { const s = level.spots.find((x) => x.label === right)!; return <img className="hq-char" src={level.marker} alt="" style={{ left: `${s.box.x + s.box.w / 2}%`, top: `${s.box.y + s.box.h - 2}%` }} />; })()}
        <HearBtn onClick={() => R && void say(R.line)} />
      </Stage>
      <p className="hq-foot">Listen only. There are no words to read on this level.</p>
    </>
  );
}

function StickerDrop({ level, say, tryAgain, miss, star, done, setDots }: LevelProps<'sticker-drop'>) {
  const tray = useMemo(() => shuffle(level.stickers), [level]);
  const [placed, setPlaced] = useState<{ item: string; x: number; y: number }[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const misses = useRef(0);
  useEffect(() => { setDots(level.stickers.length, placed.length); }, [placed.length, level.stickers.length, setDots]);
  useEffect(() => { void say(level.intro); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handlersFor = (s: (typeof level.stickers)[number]): DragHandlers => ({
    onMove: (els) => setHover((els.find((e) => (e as HTMLElement).dataset?.zone) as HTMLElement | undefined)?.dataset.zone ?? null),
    onDrop: (els, e) => {
      setHover(null);
      const z = els.find((el) => (el as HTMLElement).dataset?.zone) as HTMLElement | undefined;
      if (!z) return false;
      if (z.dataset.zone === s.zone) {
        const r = stageRef.current!.getBoundingClientRect();
        const p = { item: s.item, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
        sfx.right(); star(z); void say(s.line);
        setPlaced((pl) => { const n = [...pl, p]; if (n.length === level.stickers.length) window.setTimeout(() => done(misses.current), 2400); return n; });
        return true;
      }
      misses.current++; miss(); tryAgain(); return false;
    },
  });
  return (
    <>
      <>
        <Stage img={level.img} aspect={level.aspect} stageRef={stageRef}>
          {level.zones.map((z) => <div key={z.id} data-zone={z.id} className={`hq-zone ${hover === z.id ? 'hover' : ''}`} style={pct(z.box)} />)}
          {placed.map((p) => { const s = level.stickers.find((x) => x.item === p.item)!; return <img key={p.item} className="hq-placed" src={s.src} alt={s.item} style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${s.size}%` }} />; })}
          <HearBtn onClick={() => void say(level.intro)} />
        </Stage>
      </>
      <div className="hq-tray">{tray.filter((s) => !placed.some((p) => p.item === s.item)).map((s) => (
        <DragItem key={s.item} handlers={handlersFor(s)} className="hq-sticker" label={s.item}><img src={s.src} alt="" draggable={false} /></DragItem>
      ))}</div>
    </>
  );
}

function TrueFalse({ level, say, praise, tryAgain, miss, star, done, setDots }: LevelProps<'true-false'>) {
  const [r, setR] = useState(0);
  const [shown, setShown] = useState(false);
  const misses = useRef(0);
  const R = level.rounds[r];
  useEffect(() => { setDots(level.rounds.length, r); setShown(false); if (R) void (r === 0 ? say(level.intro).then(() => say(R.line)) : say(R.line)); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!R) return null;
  const pick = (v: boolean, el: HTMLElement) => {
    if (shown) return;
    if (v === R.isTrue) { setShown(true); sfx.right(); star(el); praise(); window.setTimeout(() => { if (r + 1 >= level.rounds.length) done(misses.current); else setR(r + 1); }, 1700); }
    else { shake(el); misses.current++; miss(); tryAgain(); }
  };
  return (
    <>
      <Stage img={R.img} aspect={R.aspect}>
        {R.sticker && <img className="hq-char" src={R.sticker.src} alt="" style={{ left: `${R.sticker.x}%`, top: `${R.sticker.y}%` }} />}
        <HearBtn onClick={() => void say(R.line)} />
        {shown && <div className="hq-caption">{R.line}</div>}
        <div className="hq-dock">
          <button className="hq-big t" onClick={(e) => pick(true, e.currentTarget)}>✅ True</button>
          <button className="hq-big f" onClick={(e) => pick(false, e.currentTarget)}>❌ False</button>
        </div>
      </Stage>
    </>
  );
}

function SentenceBuilder({ level, say, miss, star, done, setDots }: LevelProps<'sentence-builder'>) {
  const [r, setR] = useState(0);
  const R = level.rounds[r];
  const words = useMemo(() => R?.line.split(' ') ?? [], [R]);
  const bank = useMemo(() => shuffle([...words.map((w, i) => ({ w, i, id: `w${i}` })), ...(R?.extra ?? []).map((w, i) => ({ w, i: -1, id: `x${i}` }))]), [R, words]);
  const [pos, setPos] = useState(0);
  const [used, setUsed] = useState<string[]>([]);
  const misses = useRef(0);
  const builtRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { setDots(level.rounds.length, r); setPos(0); setUsed([]); if (R) void (r === 0 ? say(level.intro).then(() => say(R.line)) : say(R.line)); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!R) return null;
  const tap = (b: { w: string; i: number; id: string }, el: HTMLElement) => {
    if (b.i !== -1 && words[pos] === b.w) {
      sfx.pop(); setUsed((u) => [...u, b.id]); const n = pos + 1; setPos(n);
      if (n === words.length) { sfx.magic(); star(builtRef.current); void say(R.line); window.setTimeout(() => { if (r + 1 >= level.rounds.length) done(misses.current); else setR(r + 1); }, 2200); }
    } else { shake(el); misses.current++; miss(); }
  };
  return (
    <>
      <Stage img={R.img}>
        {R.sticker && <img className="hq-char" src={R.sticker.src} alt="" style={{ left: `${R.sticker.x}%`, top: `${R.sticker.y}%` }} />}
        <HearBtn onClick={() => void say(R.line)} />
        <div className="hq-dock hq-dock-words">
          <div ref={builtRef} className="hq-built">{pos === 0 ? <span className="ph">Tap the words in order…</span> : words.slice(0, pos).map((w, i) => <span key={i} className="hq-w">{w}</span>)}</div>
          <div className="hq-words">{bank.filter((b) => !used.includes(b.id)).map((b) => <button key={b.id} className="hq-w" onClick={(e) => tap(b, e.currentTarget)}>{b.w}</button>)}</div>
        </div>
      </Stage>
    </>
  );
}

function SoundChoice({ level, quest, say, miss, star, done, setDots }: LevelProps<'sound-choice'>) {
  const rounds = useMemo(() => shuffle(level.rounds), [level]);
  const voice = level.voice ?? quest.voice;
  const [r, setR] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [combo, setCombo] = useState(0);
  const misses = useRef(0);
  const R = rounds[r];
  useEffect(() => { setDots(rounds.length, r); setRevealed(false); if (R) void (r === 0 ? say(level.intro).then(() => say(R.word, voice)) : say(R.word, voice)); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!R) return null;
  const pick = (c: string, el: HTMLElement) => {
    if (revealed) return;
    if (level.phonics) void playLetterPhonic(c);
    if (c === R.answer) { setRevealed(true); sfx.magic(); star(el); setCombo((x) => x + 1); window.setTimeout(() => { if (r + 1 >= rounds.length) done(misses.current); else setR(r + 1); }, 1300); }
    else { shake(el); misses.current++; miss(); setCombo(0); void say(R.word, voice); }
  };
  return (
    <>
      <Stage img={level.img} night={quest.theme.night}>
        <HearBtn onClick={() => void say(R.word, voice)} />
        {combo >= 2 && <div className="hq-caption hq-corner">🔥 {combo} in a row!</div>}
        {revealed && <div className="hq-caption">{R.picture ? <img src={R.picture} alt="" style={{ height: '1.8em', verticalAlign: 'middle' }} /> : <span style={{ fontSize: '1.6em' }}>{R.emoji}</span>} <b>{highlight(R.word, R.answer)}</b></div>}
        <div className="hq-dock">{level.choices.map((c, i) => <button key={c} className={`hq-orb o${i % 3}`} onClick={(e) => pick(c, e.currentTarget)}>{c}</button>)}</div>
      </Stage>
    </>
  );
}

function SoundBlend({ level, quest, say, praise, tryAgain, miss, star, done, setDots }: LevelProps<'sound-blend'>) {
  const voice = level.voice ?? quest.voice;
  const [r, setR] = useState(0);
  const [lit, setLit] = useState<number[]>([]);
  const [blended, setBlended] = useState(false);
  const [ok, setOk] = useState(false);
  const misses = useRef(0);
  const R = level.rounds[r];
  const sounds = R ? (R.sounds ?? R.word.toLowerCase().split('')) : [];
  // Three pictures: this word + two others from the level, shuffled once per round.
  const opts = useMemo(() => (R ? shuffle([R, ...shuffle(level.rounds.filter((x) => x.word !== R.word)).slice(0, 2)]) : []), [R, level.rounds]);
  useEffect(() => { setDots(level.rounds.length, r); setLit([]); setBlended(false); setOk(false); if (r === 0) void say(level.intro); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!R) return null;
  const tapSound = (i: number) => { if (blended) return; void playLetterPhonic(sounds[i]); sfx.right(); setLit((l) => (l.includes(i) ? l : [...l, i])); };
  const blend = async () => {
    if (blended || lit.length < sounds.length) return;
    setBlended(true); sfx.magic();
    for (const s of sounds) { await playLetterPhonic(s); await new Promise((res) => window.setTimeout(res, 60)); }
    await say(R.word, voice);
  };
  const pick = (w: string, el: HTMLElement) => {
    if (!blended || ok) return;
    if (w === R.word) { setOk(true); sfx.right(); star(el); praise(); window.setTimeout(() => { if (r + 1 >= level.rounds.length) done(misses.current); else setR(r + 1); }, 1400); }
    else { shake(el); misses.current++; miss(); tryAgain(); void say(R.word, voice); }
  };
  return (
    <Stage img={level.img} night={quest.theme.night}>
      {blended && <HearBtn onClick={() => void say(R.word, voice)} />}
      <div className="hq-caption">{blended ? <b style={{ fontSize: '1.6em', letterSpacing: '.06em' }}>{R.word}</b> : lit.length < sounds.length ? 'Tap each sound!' : 'Now blend them!'}</div>
      <div className="hq-dock">
        {!blended ? (
          <>
            {sounds.map((s, i) => <button key={`${r}-${i}`} className={`hq-orb o${i % 3} ${lit.includes(i) ? 'hq-lit' : 'hq-dim'}`} onClick={() => tapSound(i)} aria-label={`Sound ${soundLabel(s)}`}>{soundLabel(s)}</button>)}
            <button className="hq-orb hq-blend" disabled={lit.length < sounds.length} onClick={() => void blend()}>🚂<br />Blend!</button>
          </>
        ) : opts.map((o) => (
          <button key={o.word} aria-label={o.word} className={`hq-card ${ok && o.word === R.word ? 'ok' : ''}`} onClick={(e) => pick(o.word, e.currentTarget)}>
            {o.picture ? <img src={o.picture} alt="" draggable={false} /> : <span className="em">{o.emoji}</span>}
          </button>
        ))}
      </div>
    </Stage>
  );
}

function PictureChoice({ level, say, praise, tryAgain, miss, star, done, setDots }: LevelProps<'picture-choice'>) {
  const [r, setR] = useState(0);
  const [ok, setOk] = useState<string | null>(null);
  const misses = useRef(0);
  const R = level.rounds[r];
  const opts = useMemo(() => (R ? shuffle(R.options) : []), [R]);
  useEffect(() => { setDots(level.rounds.length, r); setOk(null); if (R) void (r === 0 ? say(level.intro).then(() => say(R.line)) : say(R.line)); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!R) return null;
  const pick = (label: string, el: HTMLElement) => {
    if (ok) return;
    if (label === R.answer) { setOk(label); sfx.right(); star(el); praise(); window.setTimeout(() => { if (r + 1 >= level.rounds.length) done(misses.current); else setR(r + 1); }, 1500); }
    else { shake(el); misses.current++; miss(); tryAgain(); }
  };
  return (
    <>
      <Stage img={level.img}>
        <HearBtn onClick={() => void say(R.line)} />
        <div className="hq-dock">{opts.map((o) => (
          <button key={o.label} aria-label={o.label} className={`hq-card ${ok === o.label ? 'ok' : ''}`} onClick={(e) => pick(o.label, e.currentTarget)}>
            {o.src ? <img src={o.src} alt="" draggable={false} /> : <span className="em">{o.emoji}</span>}
          </button>
        ))}</div>
      </Stage>
    </>
  );
}

/* ---------- Dress Up (Unit 9 clothes) ----------
 * A friend stands in the hall and asks for one piece at a time, in their own recorded voice ("Put on my red
 * socks, please!"). The child taps it on the wardrobe rail: it lifts (anticipation), flies in an arc onto the
 * friend, the friend squashes under it, a short hit-stop, then a star burst + ring and the friend's happy hop
 * and reply. Each piece is a layer drawn for that friend's body, so they really wear it. A wrong piece wobbles
 * on its hanger and the friend tilts their head: "No, not the shoes! Listen again." (glow on the right one after
 * two tries). Between friends the dressed friend hops out and the next hops in; at the end it snows.
 * Game feel per .claude/skills/game-animation + the game-designer / game-development skills (12 principles). */
const DRESS_SPOT: Record<string, number> = { hat: 0.2, shirt: 0.6, dress: 0.62, pants: 0.78, socks: 0.9, shoes: 0.9 };
const railPos = (i: number) => ({ x: 75 + (i % 2) * 15, y: 24 + Math.floor(i / 2) * 25 });
const FRIEND = { x: 38, top: 14, h: 80 }; // friend box: centre x, top, height (% of the stage); square picture

function DressUp({ level, say, miss, star, done, setDots }: LevelProps<'dress-up'>) {
  const reduce = useReducedMotion();
  const [r, setR] = useState(0);
  const [worn, setWorn] = useState<string[][]>(() => level.friends.map(() => []));
  const [fly, setFly] = useState<{ id: string; src: string; from: { x: number; y: number }; to: { x: number; y: number } } | null>(null);
  const [mood, setMood] = useState<'idle' | 'happy' | 'hmm' | 'cheer'>('idle');
  const [wobble, setWobble] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [bursts, setBursts] = useState<{ k: number; x: number; y: number }[]>([]);
  const busy = useRef(false);
  const misses = useRef(0);
  const friendRef = useRef<HTMLDivElement | null>(null);
  const R = level.rounds[r];
  const finished = !R;
  const fi = R ? R.friend : level.rounds[level.rounds.length - 1].friend;
  const F = level.friends[fi];
  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, ms));
  // only what this friend can wear is on the rail (a boy has no dress piece, so no dress)
  const rail = level.wardrobe.filter((c) => c.id in F.layers);

  useEffect(() => {
    setDots(level.rounds.length, r); setTries(0); setMood('idle');
    if (!R) return;
    busy.current = false;
    const ask = () => say(R.line, F.who);
    void (r === 0 ? say(level.intro).then(ask) : wait(450).then(ask));
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const burst = (x: number, y: number) => { const k = Date.now(); setBursts((b) => [...b.slice(-2), { k, x, y }]); window.setTimeout(() => setBursts((b) => b.filter((q) => q.k !== k)), 1200); };

  const pick = async (id: string, i: number) => {
    if (!R || busy.current) return;
    const c = rail.find((w) => w.id === id);
    if (!c) return;
    if (id !== R.item) {
      misses.current++; miss(); setTries((t) => t + 1);
      setWobble(id); setMood('hmm');
      window.setTimeout(() => { setWobble(null); setMood('idle'); }, 700);
      void say(dressUpWrongLine(level.wrongLine, c.label), F.who);
      return;
    }
    busy.current = true; sfx.pop();
    const to = { x: FRIEND.x, y: FRIEND.top + (DRESS_SPOT[id] ?? 0.6) * FRIEND.h };
    if (!reduce) { setFly({ id, src: c.src, from: railPos(i), to }); await wait(560); setFly(null); }
    const clash = id === 'dress' ? ['shirt', 'pants'] : id === 'shirt' || id === 'pants' ? ['dress'] : []; // a dress replaces shirt + pants
    setWorn((w) => w.map((list, k) => (k === fi ? [...list.filter((x) => !clash.includes(x)), id] : list)));
    await wait(reduce ? 0 : 80); // hit-stop: the piece lands, the world holds for a beat
    sfx.right(); burst(to.x, to.y); star(friendRef.current); setMood('happy');
    await say(R.reply, F.who);
    const next = level.rounds[r + 1];
    if (!next) {
      setMood('cheer'); sfx.magic();
      await say(level.doneLine);
      await wait(600); done(misses.current); return;
    }
    if (next.friend !== fi) { setMood('cheer'); await wait(900); }
    setR(r + 1);
  };

  const layers = [...(worn[fi] ?? [])].sort((a, b) => (level.wardrobe.find((w) => w.id === a)?.z ?? 0) - (level.wardrobe.find((w) => w.id === b)?.z ?? 0));
  const moodAnim = reduce ? {} : mood === 'happy' ? { y: [0, -34, 0, -10, 0], scaleY: [1, 0.86, 1.08, 0.96, 1], scaleX: [1, 1.1, 0.95, 1.03, 1] }
    : mood === 'cheer' ? { y: [0, -40, 0, -40, 0], rotate: [0, -6, 0, 6, 0] }
    : mood === 'hmm' ? { rotate: [0, -7, 5, -3, 0] }
    : { scaleY: [1, 1.035, 1], scaleX: [1, 0.985, 1] };
  const moodTr = mood === 'idle' ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const } : { duration: mood === 'cheer' ? 1.1 : 0.7, ease: 'easeOut' as const };

  return (
    <Stage img={level.img}>
      {R && <HearBtn onClick={() => void say(R.line, F.who)} />}
      {R && <div className="hq-caption hq-corner hq-du-ask"><b>{F.name}:</b> “{R.line}”</div>}

      {/* the friend (hops out / in between friends), with a ground shadow */}
      <AnimatePresence mode="wait">
        <motion.div key={fi} className="hq-du-friend" style={{ left: `${FRIEND.x}%`, top: `${FRIEND.top}%`, height: `${FRIEND.h}%` }}
          initial={reduce ? { opacity: 0 } : { x: '70%', y: -30, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { x: '-80%', y: [0, -40, 0], opacity: 0, transition: { duration: 0.55, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
          <motion.div className="hq-du-shadow" animate={mood === 'happy' || mood === 'cheer' ? { scaleX: [1, 0.7, 1] } : { scaleX: 1 }} transition={{ duration: 0.7 }} />
          <motion.div ref={friendRef} className="hq-du-body" animate={moodAnim} transition={moodTr} style={{ transformOrigin: '50% 95%' }}>
            <img src={F.img} alt={F.name} draggable={false} />
            <AnimatePresence>
              {layers.map((id) => F.layers[id] && (
                <motion.img key={id} src={F.layers[id]} alt={id} draggable={false} className="hq-du-layer"
                  style={{ zIndex: level.wardrobe.find((w) => w.id === id)?.z ?? 1 }}
                  initial={reduce ? { opacity: 0 } : { scale: 1.08, opacity: 0, filter: 'brightness(1.6)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16 }} />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* the wardrobe rail: pieces bob on their hangers */}
      <div className={`hq-du-rail ${R && !busy.current ? 'ready' : ''}`}><span className="hq-du-rod" /></div>
      {rail.map((c, i) => {
          const p = railPos(i);
          const glow = R && tries >= 2 && c.id === R.item;
          const flying = fly?.id === c.id;
          return (
            <motion.button key={c.id} aria-label={c.label} className={`hq-du-piece ${glow ? 'glow' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: flying ? 0 : 1 }}
              onClick={() => { void pick(c.id, i); }}
              whileHover={reduce ? undefined : { scale: 1.08, rotate: -3 }} whileTap={reduce ? undefined : { scale: 0.88 }}
              animate={wobble === c.id ? { rotate: [0, -14, 12, -8, 5, 0] } : reduce ? {} : { y: [0, -6, 0], rotate: [0, 2, 0, -2, 0] }}
              transition={wobble === c.id ? { duration: 0.6 } : { duration: 2.4 + (i % 3) * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}>
              <img src={c.src} alt="" draggable={false} />
            </motion.button>
          );
        })}

      {/* the piece in flight: lift (anticipation) → arc → shrink onto the friend */}
      {fly && (
        <motion.img src={fly.src} alt="" className="hq-du-fly"
          initial={{ left: `${fly.from.x}%`, top: `${fly.from.y}%`, scale: 1, rotate: 0 }}
          animate={{ left: [`${fly.from.x}%`, `${fly.from.x + 1}%`, `${(fly.from.x + fly.to.x) / 2}%`, `${fly.to.x}%`],
            top: [`${fly.from.y}%`, `${fly.from.y + 3}%`, `${Math.max(20, Math.min(fly.from.y, fly.to.y) - 10)}%`, `${fly.to.y}%`],
            scale: [1, 0.9, 1.25, 0.7], rotate: [0, 6, -12, 0] }}
          transition={{ duration: 0.56, times: [0, 0.18, 0.6, 1], ease: ['easeOut', 'easeOut', 'easeIn'] }} />
      )}

      {/* star burst + ring on every right piece */}
      {bursts.map((b) => (
        <div key={b.k} className="hq-du-burst" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          <motion.span className="hq-du-ring" initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
          {!reduce && Array.from({ length: 14 }, (_, k) => {
            const a = (k / 14) * Math.PI * 2, d = 60 + (k % 3) * 22;
            return <motion.span key={k} className="hq-du-spark" initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: Math.cos(a) * d, y: [0, Math.sin(a) * d, Math.sin(a) * d + 40], scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.95, ease: 'easeOut' }}>{k % 2 ? '⭐' : '✨'}</motion.span>;
          })}
        </div>
      ))}

      {/* the end: it snows and the friend cheers */}
      {finished && !reduce && Array.from({ length: 28 }, (_, k) => (
        <motion.span key={k} className="hq-du-flake" style={{ left: `${(k * 37) % 100}%` }}
          initial={{ y: '-10%', opacity: 0 }} animate={{ y: '110%', x: [0, 14, -10, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3 + (k % 5) * 0.5, delay: (k % 7) * 0.2, ease: 'linear' }}>❄</motion.span>
      ))}
    </Stage>
  );
}

function Twister({ level, quest, say, miss, star, done, setDots }: LevelProps<'twister'>) {
  const words = useMemo(() => level.line.split(' '), [level.line]);
  const bank = useMemo(() => shuffle(words.map((w, i) => ({ w, i }))), [words]);
  const [pos, setPos] = useState(0);
  const [left, setLeft] = useState(level.seconds);
  const [phase, setPhase] = useState<'build' | 'say'>('build');
  const [fills, setFills] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const misses = useRef(0);
  const builtRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { setDots(2, phase === 'build' ? 0 : 1); }, [phase, setDots]);
  useEffect(() => {
    setPos(0); setLeft(level.seconds);
    let iv = 0;
    void say(level.intro).then(() => { iv = window.setInterval(() => setLeft((l) => l - 1), 1000); });
    return () => window.clearInterval(iv);
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (phase === 'build' && left <= 0) { sfx.wrong(); setAttempt((a) => a + 1); } }, [left, phase]);
  const tap = (b: { w: string; i: number }, el: HTMLElement) => {
    if (b.i === pos) {
      sfx.pop(); const n = pos + 1; setPos(n);
      if (n === words.length) { sfx.magic(); star(builtRef.current); setLeft(9999); void say(level.line).then(() => { setPhase('say'); void say(level.sayIt); }); }
    } else { shake(el); misses.current++; sfx.wrong(); }
  };
  const speeds = ['🐢 Slow', '🐇 Faster', '🚀 Magic speed!'];
  if (phase === 'say') {
    return (
      <>
        <Stage img={level.img} night={quest.theme.night}>
          <div className="hq-book" style={{ inset: '6% 6% auto 6%' }}><div className="hq-words">{words.map((w, i) => <span key={i} className="hq-w ink">{highlight(w, level.focus)}</span>)}</div></div>
          <div className="hq-dock hq-dock-words">
            <div className="hq-potions">{speeds.map((s, i) => <div key={s} className={`hq-potion ${i <= fills ? 'on' : ''}`}><div className="hq-flask" style={{ ['--fill' as string]: i < fills ? '100%' : '0%' }} />{s}</div>)}</div>
            <div className="hq-bar center">
              <button className="hq-btn ghost" onClick={() => void say(level.line)}>🔊 Hear it</button>
              <button className="hq-btn violet" disabled={fills >= 3} onClick={(e) => { sfx.right(); star(e.currentTarget); const n = fills + 1; setFills(n); if (n >= 3) window.setTimeout(() => done(misses.current), 900); }}>✨ I said it!</button>
            </div>
          </div>
        </Stage>
      </>
    );
  }
  return (
    <>
      <Stage img={level.img} night={quest.theme.night}>
        <HearBtn onClick={() => void say(level.line)} />
        <div className="hq-caption hq-corner">⏳ {Math.max(0, left > 999 ? 0 : left)}s</div>
        <div className="hq-dock hq-dock-words">
          <div ref={builtRef} className="hq-built">{pos === 0 ? <span className="ph">Tap the words in order…</span> : words.slice(0, pos).map((w, i) => <span key={i} className="hq-w">{highlight(w, level.focus)}</span>)}</div>
          <div className="hq-words">{bank.filter((b) => b.i >= pos).map((b) => <button key={`${attempt}-${b.i}`} className="hq-w" onClick={(e) => tap(b, e.currentTarget)}>{highlight(b.w, level.focus)}</button>)}</div>
        </div>
      </Stage>
    </>
  );
}

function Reading({ level, quest, say, praise, tryAgain, miss, star, done, setDots }: LevelProps<'reading'>) {
  const [q, setQ] = useState(-1);
  const [ok, setOk] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const misses = useRef(0);
  const total = level.questions.length;
  useEffect(() => { setDots(total + 1, q + 1); setOk(null); if (q === -1) void say(level.intro); else if (q < total) void say(level.questions[q].q); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  if (q === -1) {
    return (
      <>
        <Stage img={level.img} night={quest.theme.night}>
          <div className="hq-book">{level.sentences.map((s, i) => <p key={i}>{highlight(s, level.focus)}</p>)}</div>
          <button className="hq-hear bottom" disabled={reading} onClick={async () => { miss(); setReading(true); for (const s of level.sentences) await say(s); setReading(false); }}>🆘 Read it to me (−1 ❤️)</button>
        </Stage>
        <div className="hq-bar center"><button className="hq-btn" onClick={() => setQ(0)}>I read it →</button></div>
      </>
    );
  }
  const Q = level.questions[q];
  if (!Q) return null;
  const pick = (o: string, el: HTMLElement) => {
    if (ok) return;
    if (o === Q.answer) { setOk(o); sfx.right(); star(el); praise(); window.setTimeout(() => { if (q + 1 >= total) done(misses.current); else setQ(q + 1); }, 1300); }
    else { shake(el); misses.current++; miss(); tryAgain(); }
  };
  return (
    <>
      <Stage img={level.img} night={quest.theme.night}>
        <div className="hq-book"><p className="big">{Q.q}</p><p className="hint">The book is closed now. Answer from memory!</p></div>
        <HearBtn onClick={() => void say(Q.q)} />
        <div className="hq-dock hq-dock-opts">{Q.options.map((o) => <button key={o} className={`hq-opt ${ok === o ? 'ok' : ''}`} onClick={(e) => pick(o, e.currentTarget)}>{o}</button>)}</div>
      </Stage>
    </>
  );
}

function Treasure({ level, quest, say, star, setDots, stars }: LevelProps<'treasure'> & { stars: number }) {
  const [taps, setTaps] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { setDots(1, 0); void say(level.intro); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Stage img={level.img}>
      <button ref={ref} className={`hq-chest ${open ? 'open' : ''}`} aria-label="Open the treasure chest" style={{ ['--glow' as string]: String(Math.min(1, taps / 3)) }}
        onClick={() => {
          if (open) return;
          sfx.pop(); shake(ref.current); const n = taps + 1; setTaps(n);
          if (n >= 3) { setOpen(true); sfx.magic(); confetti(); star(ref.current); star(ref.current); star(ref.current); void say(level.win); }
        }}>
        <span className="glow" />
        <img src={open ? level.open : level.closed} alt="" draggable={false} />
        {open && Array.from({ length: 10 }, (_, k) => <span key={k} className="hq-coin" style={{ ['--dx' as string]: `${(Math.random() - 0.5) * 260}px`, ['--dy' as string]: `${-120 - Math.random() * 140}px`, animationDelay: `${k * 60}ms` }}>🪙</span>)}
      </button>
      <div className="hq-caption">{open ? `⭐ ${stars} stars · 🏅 ${quest.title} complete!` : taps === 0 ? 'Tap the chest 3 times!' : `${3 - taps} more!`}</div>
    </Stage>
  );
}

function confetti() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:97'; document.body.append(c);
  const x = c.getContext('2d')!; c.width = innerWidth; c.height = innerHeight;
  const cols = ['#f5c542', '#a78bfa', '#fe6a2f', '#34d399', '#fb7185'];
  const ps = Array.from({ length: 160 }, () => ({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - 0.5) * 14, vy: Math.random() * -14 - 4, r: Math.random() * 6 + 3, c: cols[Math.floor(Math.random() * 5)], a: Math.random() * 6 }));
  let t = 0; (function f() { x.clearRect(0, 0, c.width, c.height); ps.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += 0.2; x.fillStyle = p.c; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); }); if (++t < 150) requestAnimationFrame(f); else c.remove(); })();
}

/* =========================== Quest shell =========================== */

/** Level stops on the map: a zig-zag trail across the whole picture, left to right. */
function mapPath(n: number): number[][] {
  if (n <= 1) return [[50, 62]];
  return Array.from({ length: n }, (_, i) => [10 + (i * 80) / (n - 1), i % 2 ? 40 : 70]);
}

/* ---------- The quest map ----------
 * A living board-game map: the trail draws itself in and glows gold up to where the child has got, the stops
 * pop in one by one, the next stop pulses, and the walker hops along the trail in an arc and lands with a
 * squash. An illustrated map (`theme.map`: painted landmarks, one per level) can add falling snow / leaves.
 * Stills hold still (no pan or zoom); all motion is UI and particles (.claude/skills/game-animation). */
function smoothPath(pts: number[][]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) { // Catmull-Rom → cubic Bézier
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function QuestMap({ quest, done, nextIdx, walkerIdx, unlocked, onOpen, onLocked }: {
  quest: Quest; done: Record<number, number>; nextIdx: number; walkerIdx: number;
  unlocked: (i: number) => boolean; onOpen: (i: number) => void; onLocked: () => void;
}) {
  const reduce = useReducedMotion();
  const map = quest.theme.map;
  const n = quest.levels.length;
  const path = useMemo(() => (map && map.stops.length >= n ? map.stops.slice(0, n).map((p) => [...p]) : mapPath(n)), [map, n]);
  const reached = Math.max(0, Math.min(walkerIdx, n - 1));
  // an illustrated map follows its painted trail; otherwise the trail runs stop to stop
  const trail = map?.trail && map.trail.length >= 2 ? map.trail.map((p) => [...p]) : path;
  const upTo = (i: number) => { const [x, y] = path[i]; let best = 0, bd = Infinity; trail.forEach(([tx, ty], k) => { const dd = (tx - x) ** 2 + (ty - y) ** 2; if (dd < bd) { bd = dd; best = k; } }); return best; };
  const full = smoothPath(trail), lit = smoothPath(trail.slice(0, upTo(reached) + 1));
  // the walker hops from where it stood to the new stop
  const prev = useRef(reached);
  const from = path[prev.current] ?? path[0], to = path[reached] ?? path[0];
  useEffect(() => { prev.current = reached; }, [reached]);
  const hop = from !== to;
  return (
    <Stage img={map?.img ?? quest.theme.mapImg} night={quest.theme.night} className="hq-mapstage">
      {map?.ambient && !reduce && (
        <div className={`hq-ambient ${map.ambient}`} aria-hidden>
          {Array.from({ length: 26 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 3) % 100}%`, animationDelay: `${-((i * 0.53) % 7)}s`, animationDuration: `${6 + (i % 5)}s`, fontSize: `${10 + (i % 4) * 5}px` }}>{map.ambient === 'snow' ? '❄' : '🍂'}</i>)}
        </div>
      )}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hq-path" aria-hidden="true">
        {!map && <motion.path d={full} fill="none" className={map ? 'hq-trail-soft' : 'hq-trail'} stroke="#fff" strokeOpacity={map ? 0.55 : 0.95} strokeLinecap="round" strokeDasharray={map ? '1 2.2' : undefined}
          vectorEffect="non-scaling-stroke" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />}
        {reached > 0 && <motion.path d={lit} fill="none" className="hq-trail-lit" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }} />}
      </svg>
      {quest.levels.map((l, i) => {
        const [x, y] = path[i];
        const state = done[i] !== undefined ? 'done' : !unlocked(i) ? 'locked' : i === nextIdx ? 'next' : '';
        return (
          <button key={i} className={`hq-node ${state}`} style={{ left: `${x}%`, top: `${y}%` }} aria-label={l.name}
            onClick={() => { if (state === 'locked') { onLocked(); return; } onOpen(i); }}>
            <motion.span className="hq-pop" initial={reduce ? false : { scale: 0, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.25 + i * 0.13 }} whileHover={reduce ? undefined : { scale: 1.08 }} whileTap={reduce ? undefined : { scale: 0.92 }}>
              {state === 'next' && <span className="hq-ping" aria-hidden />}
              <span className="gem">{state === 'locked' ? '🔒' : <Icon s={l.icon} />}<i className="num">{i + 1}</i></span>
              {state === 'next' && <span className="play">▶ PLAY</span>}
              <span className="lbl">{l.name}</span>
              <span className="got">{[0, 1, 2].map((k) => <b key={k} className={k < (done[i] ?? 0) ? 'on' : ''}>★</b>)}</span>
            </motion.span>
          </button>
        );
      })}
      <motion.img key={`w${reached}`} className="hq-char walker hq-walk" src={quest.theme.walker} alt="" style={{ transformOrigin: '50% 100%' }}
        initial={hop && !reduce ? { left: `${from[0]}%`, top: `${from[1] - 7}%` } : { left: `${to[0]}%`, top: `${to[1] - 7}%` }}
        animate={hop && !reduce
          ? { left: [`${from[0]}%`, `${(from[0] + to[0]) / 2}%`, `${to[0]}%`], top: [`${from[1] - 7}%`, `${Math.min(from[1], to[1]) - 22}%`, `${to[1] - 7}%`], scaleY: [1, 1.08, 0.8, 1.1, 1], scaleX: [1, 0.94, 1.2, 0.94, 1] }
          : { left: `${to[0]}%`, top: `${to[1] - 7}%`, y: [0, -6, 0] }}
        transition={hop && !reduce
          ? { left: { duration: 0.75, times: [0, 0.5, 1], ease: 'easeInOut' }, top: { duration: 0.75, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] }, scaleY: { duration: 1.05, times: [0, 0.3, 0.72, 0.86, 1] }, scaleX: { duration: 1.05, times: [0, 0.3, 0.72, 0.86, 1] } }
          : { y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }} />
    </Stage>
  );
}

export interface QuestResult { questId: string; stars: number; levels: Record<string, number> }

export default function HomeworkQuest({ quest, onComplete, onExit }: { quest: Quest; onComplete?: (r: QuestResult) => void; onExit?: () => void }) {
  const storeKey = `hq:${quest.id}`;
  const [S, setS] = useState<{ stars: number; done: Record<number, number>; hearts: number }>(() => {
    try { const v = JSON.parse(localStorage.getItem(storeKey) || 'null'); if (v) return { hearts: 3, ...v }; } catch { /* noop */ }
    return { stars: 0, done: {}, hearts: 3 };
  });
  const [view, setView] = useState<number | 'map'>('map');
  const [dots, setDotsState] = useState<[number, number]>([0, 0]);
  const [toast, setToast] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  // Video-game layer: level splash, level-complete screen, answer streak, walker hop.
  const [splash, setSplash] = useState<number | null>(null);
  const [win, setWin] = useState<{ idx: number; got: number } | null>(null);
  const [combo, setCombo] = useState(0);
  const starRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => { try { localStorage.setItem(storeKey, JSON.stringify(S)); } catch { /* noop */ } }, [S, storeKey]);
  useEffect(() => () => stopSpeaking(), []);

  const say = useCallback((text: string, voice?: QuestVoice) => (soundOn && text ? speak(text, voice ?? quest.voice).catch(() => {}) : Promise.resolve()), [soundOn, quest.voice]);
  const praise = useCallback(() => { const l = quest.praise.lines; void say(l[Math.floor(Math.random() * l.length)], quest.praise.voice); }, [quest, say]);
  const tryAgain = useCallback(() => { void say(quest.praise.tryAgain, quest.praise.voice); }, [quest, say]);
  const miss = useCallback(() => { sfx.wrong(); setCombo(0); setS((s) => ({ ...s, hearts: Math.max(1, s.hearts - 1) })); }, []);
  const star = useCallback((el: Element | null) => {
    const to = starRef.current?.getBoundingClientRect(); const r = el?.getBoundingClientRect();
    if (to && r) {
      const s = document.createElement('span'); s.className = 'hq-flystar'; s.textContent = '⭐';
      s.style.left = `${r.left + r.width / 2}px`; s.style.top = `${r.top + r.height / 2}px`; document.body.append(s);
      requestAnimationFrame(() => { s.style.transform = `translate(${to.left - r.left - r.width / 2}px, ${to.top - r.top - r.height / 2}px) scale(.7)`; s.style.opacity = '.2'; });
      window.setTimeout(() => s.remove(), 820);
    }
    setCombo((c) => c + 1);
    window.setTimeout(() => setS((st) => ({ ...st, stars: st.stars + 1 })), 800);
  }, []);
  const setDots = useCallback((total: number, on: number) => setDotsState([total, on]), []);
  const unlocked = (i: number) => i === 0 || S.done[i - 1] !== undefined;
  const nextIdx = quest.levels.findIndex((_, i) => unlocked(i) && S.done[i] === undefined);
  const lastIdx = quest.levels.length - 1;
  // The walker stands on the level just played, then hops to the next one.
  const [walkerIdx, setWalkerIdx] = useState(nextIdx === -1 ? lastIdx : nextIdx);
  useEffect(() => {
    if (view !== 'map') return;
    const t = window.setTimeout(() => setWalkerIdx(nextIdx === -1 ? lastIdx : nextIdx), 450);
    return () => window.clearTimeout(t);
  }, [view, nextIdx, lastIdx]);
  const openLevel = useCallback((i: number) => { sfx.pop(); setCombo(0); setView(i); setSplash(i); window.setTimeout(() => setSplash((x) => (x === i ? null : x)), 1700); }, []);

  const finishLevel = useCallback((idx: number) => (misses: number) => {
    const got = starsFor(misses);
    sfx.magic(); confetti(); setWin({ idx, got }); setWalkerIdx(idx);
    [0, 1, 2].slice(0, got).forEach((k) => window.setTimeout(() => tone(880 + k * 220, 0.18, 'triangle'), 450 + k * 350));
    setS((s) => {
      const n = { ...s, hearts: 3, done: { ...s.done, [idx]: Math.max(s.done[idx] ?? 0, got) } };
      if (Object.keys(n.done).length === quest.levels.length && onComplete) {
        onComplete({ questId: quest.id, stars: n.stars, levels: Object.fromEntries(quest.levels.map((l, i) => [l.name, n.done[i] ?? 0])) });
      }
      return n;
    });
    window.setTimeout(() => { setWin((w) => (w && w.idx === idx ? null : w)); stopSpeaking(); setView('map'); }, 2800);
  }, [quest, onComplete]);

  const level = typeof view === 'number' ? quest.levels[view] : null;
  const common = level && typeof view === 'number' ? { quest, say, praise, tryAgain, miss, star, done: finishLevel(view), setDots } : null;

  return (
    <div className={`hq ${quest.theme.night ? 'night' : 'day'}`} style={{ ['--hq-accent' as string]: quest.theme.accent, ['--hq-accent2' as string]: quest.theme.accent2, ['--hq-world' as string]: `url('${quest.theme.mapImg}')` }} onPointerDown={() => unlockAudio()}>
      <style>{QUEST_CSS}</style>
      {/* The homework forest, behind every quest (same backdrop as the Homework Forest on the dashboard). */}
      <div className="hq-forest" aria-hidden><JungleTheme /></div>
      <div className="hq-wrap">
        <header className="hq-hud">
          <div className="hq-brand"><img src={quest.theme.guide} alt="" /><div><h1>{quest.title}</h1><small>{quest.subtitle}</small></div></div>
          <span className="hq-pill">{'❤️'.repeat(S.hearts)}{'🤍'.repeat(3 - S.hearts)}</span>
          {combo >= 2 && <span key={combo} className="hq-pill hq-combo">🔥 {combo}</span>}
          <span ref={starRef} className="hq-pill gold">⭐ {S.stars}</span>
          <button className="hq-icon" aria-label={soundOn ? 'Sound on' : 'Sound off'} onClick={() => { setSoundOn((v) => !v); stopSpeaking(); }}>{soundOn ? '🔊' : '🔇'}</button>
          {onExit && <button className="hq-icon" aria-label="Close" onClick={onExit}>✕</button>}
        </header>

        {view === 'map' || !level || !common ? (
          <>
            <div className="hq-bar"><h2>🗺 The quest map</h2><span className="hq-pill">{Object.keys(S.done).length} / {quest.levels.length}</span></div>
            <div className="hq-play">
            <QuestMap quest={quest} done={S.done} nextIdx={nextIdx} walkerIdx={walkerIdx} unlocked={unlocked}
              onOpen={openLevel} onLocked={() => { sfx.wrong(); setToast('Finish the level before this one first.'); window.setTimeout(() => setToast(null), 1700); }} />
            </div>
            <div className="hq-bar center">
              {nextIdx !== -1 && <button className="hq-btn hq-go" onClick={() => openLevel(nextIdx)}>▶ Play level {nextIdx + 1}: {quest.levels[nextIdx].name}</button>}
              {nextIdx === -1 && <span className="hq-pill gold">🏆 Quest complete!</span>}
              <button className="hq-btn ghost" onClick={() => setS({ stars: 0, done: {}, hearts: 3 })}>↺ Start over</button>
            </div>
          </>
        ) : (
          <>
            <div className="hq-bar">
              <h2>{level.name}</h2>
              <span className="hq-dots">{Array.from({ length: dots[0] }, (_, i) => <i key={i} className={i < dots[1] ? 'on' : ''} />)}</span>
              <button className="hq-btn ghost" onClick={() => { stopSpeaking(); setView('map'); }}>🗺 Map</button>
            </div>
            <div className="hq-play"><LevelSwitch key={view} level={level} common={common} stars={S.stars} /></div>
          </>
        )}
      </div>
      {splash !== null && quest.levels[splash] && (
        <button className="hq-splash" onClick={() => setSplash(null)} aria-label="Start the level">
          <span className="hq-splash-card">
            <span className="lv">LEVEL {splash + 1}</span>
            <span className="ic"><Icon s={quest.levels[splash].icon} size="80%" /></span>
            <span className="nm">{quest.levels[splash].name}</span>
            <span className="go">GO!</span>
          </span>
        </button>
      )}
      {win && (
        <button className="hq-splash win" onClick={() => { setWin(null); stopSpeaking(); setView('map'); }} aria-label="Back to the map">
          <span className="hq-splash-card">
            <span className="lv">LEVEL COMPLETE!</span>
            <span className="stars">{[0, 1, 2].map((k) => <b key={k} className={k < win.got ? 'on' : ''} style={{ animationDelay: `${0.35 + k * 0.35}s` }}>★</b>)}</span>
            <span className="nm">{quest.levels[win.idx]?.name}</span>
            <span className="go small">Tap to go on ▶</span>
          </span>
        </button>
      )}
      {toast && <div className="hq-toast" role="status">{toast}</div>}
    </div>
  );
}

function LevelSwitch({ level, common, stars }: { level: QuestLevel; common: Omit<LevelProps<'treasure'>, 'level'>; stars: number }) {
  switch (level.kind) {
    case 'scene-puzzle': return <ScenePuzzle level={level} {...common} />;
    case 'tap-hotspot': return <TapHotspot level={level} {...common} />;
    case 'sticker-drop': return <StickerDrop level={level} {...common} />;
    case 'true-false': return <TrueFalse level={level} {...common} />;
    case 'sentence-builder': return <SentenceBuilder level={level} {...common} />;
    case 'sound-choice': return <SoundChoice level={level} {...common} />;
    case 'sound-blend': return <SoundBlend level={level} {...common} />;
    case 'picture-choice': return <PictureChoice level={level} {...common} />;
    case 'twister': return <Twister level={level} {...common} />;
    case 'reading': return <Reading level={level} {...common} />;
    case 'dress-up': return <DressUp level={level} {...common} />;
    case 'treasure': return <Treasure level={level} {...common} stars={stars} />;
  }
}
