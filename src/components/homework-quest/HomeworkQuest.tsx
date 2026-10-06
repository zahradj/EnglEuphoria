import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { HomeworkQuest as Quest, QuestLevel, QuestVoice, Box } from '@/content/homework-quests/types';
import { speak, stopSpeaking, playLetterPhonic, unlockAudio } from '@/content/playground-library/unit1/audio';
import { QUEST_CSS } from './questStyles';

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
const isImg = (s: string) => s.startsWith('/') || s.startsWith('http');
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
    actx = actx || new (window.AudioContext || (window as any).webkitAudioContext)();
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

function Stage({ img, aspect = 1376 / 768, night, children, still }: { img: string; aspect?: number; night?: boolean; still?: boolean; children?: ReactNode }) {
  return (
    <div className="hq-stage" style={{ aspectRatio: String(aspect), ['--ar' as string]: String(aspect) }}>
      <div className={`hq-art ${still ? 'still' : ''}`} style={{ backgroundImage: `url('${img}')` }} />
      {night && <div className="hq-night">{Array.from({ length: 16 }, (_, i) => <span key={i} className="hq-twinkle" style={{ left: `${(i * 37 + 5) % 100}%`, top: `${(i * 53 + 9) % 90}%`, animationDelay: `${(i * 170) % 2000}ms` }} />)}</div>}
      {children}
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
      <div ref={stageRef}>
        <Stage img={level.img} aspect={level.aspect}>
          {level.zones.map((z) => <div key={z.id} data-zone={z.id} className={`hq-zone ${hover === z.id ? 'hover' : ''}`} style={pct(z.box)} />)}
          {placed.map((p) => { const s = level.stickers.find((x) => x.item === p.item)!; return <img key={p.item} className="hq-placed" src={s.src} alt={s.item} style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${s.size}%` }} />; })}
          <HearBtn onClick={() => void say(level.intro)} />
        </Stage>
      </div>
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
      <Stage img={R.img}>
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

const MAP_PATH = [[12, 74], [24, 54], [36, 74], [48, 54], [60, 74], [74, 60], [86, 40], [70, 22], [48, 20], [26, 26], [12, 40], [90, 76]];

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
  const starRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => { try { localStorage.setItem(storeKey, JSON.stringify(S)); } catch { /* noop */ } }, [S, storeKey]);
  useEffect(() => () => stopSpeaking(), []);

  const say = useCallback((text: string, voice?: QuestVoice) => (soundOn && text ? speak(text, voice ?? quest.voice).catch(() => {}) : Promise.resolve()), [soundOn, quest.voice]);
  const praise = useCallback(() => { const l = quest.praise.lines; void say(l[Math.floor(Math.random() * l.length)], quest.praise.voice); }, [quest, say]);
  const tryAgain = useCallback(() => { void say(quest.praise.tryAgain, quest.praise.voice); }, [quest, say]);
  const miss = useCallback(() => { sfx.wrong(); setS((s) => ({ ...s, hearts: Math.max(1, s.hearts - 1) })); }, []);
  const star = useCallback((el: Element | null) => {
    const to = starRef.current?.getBoundingClientRect(); const r = el?.getBoundingClientRect();
    if (to && r) {
      const s = document.createElement('span'); s.className = 'hq-flystar'; s.textContent = '⭐';
      s.style.left = `${r.left + r.width / 2}px`; s.style.top = `${r.top + r.height / 2}px`; document.body.append(s);
      requestAnimationFrame(() => { s.style.transform = `translate(${to.left - r.left - r.width / 2}px, ${to.top - r.top - r.height / 2}px) scale(.7)`; s.style.opacity = '.2'; });
      window.setTimeout(() => s.remove(), 820);
    }
    window.setTimeout(() => setS((st) => ({ ...st, stars: st.stars + 1 })), 800);
  }, []);
  const setDots = useCallback((total: number, on: number) => setDotsState([total, on]), []);
  const unlocked = (i: number) => i === 0 || S.done[i - 1] !== undefined;
  const nextIdx = quest.levels.findIndex((_, i) => unlocked(i) && S.done[i] === undefined);

  const finishLevel = useCallback((idx: number) => (misses: number) => {
    const got = starsFor(misses);
    sfx.magic(); setToast(`Level complete! ${'⭐'.repeat(got)}`); window.setTimeout(() => setToast(null), 1900);
    setS((s) => {
      const n = { ...s, hearts: 3, done: { ...s.done, [idx]: Math.max(s.done[idx] ?? 0, got) } };
      if (Object.keys(n.done).length === quest.levels.length && onComplete) {
        onComplete({ questId: quest.id, stars: n.stars, levels: Object.fromEntries(quest.levels.map((l, i) => [l.name, n.done[i] ?? 0])) });
      }
      return n;
    });
    window.setTimeout(() => { stopSpeaking(); setView('map'); }, 1300);
  }, [quest, onComplete]);

  const level = typeof view === 'number' ? quest.levels[view] : null;
  const common = level && typeof view === 'number' ? { quest, say, praise, tryAgain, miss, star, done: finishLevel(view), setDots } : null;

  return (
    <div className={`hq ${quest.theme.night ? 'night' : 'day'}`} style={{ ['--hq-accent' as string]: quest.theme.accent, ['--hq-accent2' as string]: quest.theme.accent2 }} onPointerDown={() => unlockAudio()}>
      <style>{QUEST_CSS}</style>
      <div className="hq-wrap">
        <header className="hq-hud">
          <div className="hq-brand"><img src={quest.theme.guide} alt="" /><div><h1>{quest.title}</h1><small>{quest.subtitle}</small></div></div>
          <span className="hq-pill">{'❤️'.repeat(S.hearts)}{'🤍'.repeat(3 - S.hearts)}</span>
          <span ref={starRef} className="hq-pill gold">⭐ {S.stars}</span>
          <button className="hq-icon" aria-label={soundOn ? 'Sound on' : 'Sound off'} onClick={() => { setSoundOn((v) => !v); stopSpeaking(); }}>{soundOn ? '🔊' : '🔇'}</button>
          {onExit && <button className="hq-icon" aria-label="Close" onClick={onExit}>✕</button>}
        </header>

        {view === 'map' || !level || !common ? (
          <>
            <div className="hq-bar"><h2>The quest map</h2><span className="hq-pill">{Object.keys(S.done).length} / {quest.levels.length}</span></div>
            <Stage img={quest.theme.mapImg} night={quest.theme.night}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hq-path" aria-hidden="true">
                <polyline points={quest.levels.map((_, i) => MAP_PATH[i % MAP_PATH.length].join(',')).join(' ')} fill="none" stroke="var(--hq-accent)" strokeOpacity=".8" strokeDasharray="1.6 1.4" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
              </svg>
              {quest.levels.map((l, i) => {
                const [x, y] = MAP_PATH[i % MAP_PATH.length];
                const state = S.done[i] !== undefined ? 'done' : !unlocked(i) ? 'locked' : i === nextIdx ? 'next' : '';
                return (
                  <button key={i} className={`hq-node ${state}`} style={{ left: `${x}%`, top: `${y}%` }} aria-label={l.name}
                    onClick={() => { if (state === 'locked') { sfx.wrong(); setToast('Finish the level before this one first.'); window.setTimeout(() => setToast(null), 1700); return; } sfx.pop(); setView(i); }}>
                    <span className="gem">{state === 'locked' ? '🔒' : <Icon s={l.icon} />}</span>
                    <span className="lbl">{i + 1}. {l.name} {'⭐'.repeat(S.done[i] ?? 0)}</span>
                  </button>
                );
              })}
              {(() => { const [x, y] = MAP_PATH[(nextIdx === -1 ? quest.levels.length - 1 : nextIdx) % MAP_PATH.length]; return <img className="hq-char walker" src={quest.theme.walker} alt="" style={{ left: `${x}%`, top: `${y - 6}%` }} />; })()}
            </Stage>
            <div className="hq-bar center">
              {nextIdx !== -1 && <button className="hq-btn" onClick={() => { sfx.pop(); setView(nextIdx); }}>▶ Play {quest.levels[nextIdx].name}</button>}
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
            <LevelSwitch key={view} level={level} common={common} stars={S.stars} />
          </>
        )}
      </div>
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
    case 'picture-choice': return <PictureChoice level={level} {...common} />;
    case 'twister': return <Twister level={level} {...common} />;
    case 'reading': return <Reading level={level} {...common} />;
    case 'treasure': return <Treasure level={level} {...common} stars={stars} />;
  }
}
