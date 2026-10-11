import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Dress-Up Studio (Pre-A1 Unit 9 Lesson 6 "Dress Up Game", unit review signature) ----------
 * A friend stands in the playroom dress-up corner. LISTEN rounds: the friend asks for a piece AND a colour
 * ("A blue hat, please!"); the child taps the piece on the rail, then the paint pot: the piece swoops onto the
 * friend in that colour (anticipation, arc, hit-stop, sparkle) and the friend thanks them. FREE round: the child
 * dresses the friend any way they like, presses 📸 and the friend says what they are wearing, piece by piece —
 * the child hears their own choices in English ("I'm wearing … a purple hat! … yellow pants!").
 * Clothes are the fitted dress-up layers (/lep1/dressup/<who>/<piece>.png) recoloured (grey + colour in their shape), so they
 * sit on the body. Boys never get a dress (CLAUDE.md, 2026-10-11): a piece without a layer for that friend is
 * not on the rail. Sources (mechanic only): Toca Boca / Lingokids dress-up, Cambridge Pre A1 Starters
 * "listen and colour", the classroom "dress the paper doll" game. Better: two things to listen for (piece +
 * colour), then free creation that is described back in full sentences. Game feel: .claude/skills/game-animation. */

type Studio = Extract<Scene, { kind: 'dress-studio' }>;
type Piece = Studio['pieces'][number];
type Color = Studio['colors'][number];
const Z: Record<string, number> = { socks: 1, pants: 2, shoes: 3, shirt: 4, dress: 4, hat: 5 };
const layer = (who: string, p: string) => `/lep1/dressup/${who}/${p}.png`;
/** A piece in any colour: the layer turned light grey, with the colour multiplied on top in the piece's exact
 *  shape (CSS mask), so outlines and shading stay and yellow is really yellow (a hue shift of red gives brown). */
/** How much to brighten each grey layer so its body is near white before the colour goes on (0.95 / its lightness). */
const LIFT: Record<string, number> = { hat: 2.0, shirt: 2.8, pants: 3.0, socks: 2.3, shoes: 1.0, dress: 1.2 };
function Tinted({ src, hex, lift = 1.45, className = '', style }: { src: string; hex: string; lift?: number; className?: string; style?: CSSProperties }) {
  return (
    <span className={`absolute inset-0 ${className}`} style={style}>
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" style={{ filter: `grayscale(1) brightness(${lift})` }} />
      <span className="absolute inset-0" style={{ background: hex, mixBlendMode: 'multiply', WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
    </span>
  );
}
const HAS: Record<string, string[]> = { pip: ['hat', 'shirt', 'pants', 'socks', 'shoes'], leo: ['hat', 'shirt', 'pants', 'socks', 'shoes'], mia: ['hat', 'shirt', 'pants', 'socks', 'shoes', 'dress'] };
export const studioWrongLine = 'Oops! Listen again.';
export const studioWearing = "I'm wearing…";
/** "a blue hat!" / "red socks!" — one recorded phrase per piece and colour. */
export const studioPhrase = (p: Piece, c: Color) => `${p.plural ? '' : 'a '}${c.word} ${p.word}!`;
const FRIEND = { x: 30, y: 56 };
const potX = (i: number, n: number) => 52 + (i * 40) / Math.max(1, n - 1);

export function DressStudioScene({ scene, onWin, onNext, sync }: { scene: Studio; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, worn: {} as Record<string, number>, photo: false, gemDone: false });
  const { round, worn, photo, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const free = round >= total;
  const friend = r ? r.friend : scene.free.friend;
  const rail = useMemo(() => scene.pieces.filter((p) => HAS[friend]?.includes(p.id)), [scene.pieces, friend]);
  const busy = useRef(false);
  const [sel, setSel] = useState<string | null>(null);
  const [fly, setFly] = useState<{ piece: string; color: number; key: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState(0);
  const [hop, setHop] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  // a new friend starts undressed
  const prevFriend = useRef(friend);
  useEffect(() => {
    if (prevFriend.current !== friend) { prevFriend.current = friend; setState((s) => ({ ...s, worn: {} })); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friend]);

  useEffect(() => {
    busy.current = false; setSel(null); setMisses(0);
    const line = r ? r.line : scene.free.line;
    const t = window.setTimeout(() => cueSpeak(line, friend), 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const put = async (pieceId: string, ci: number) => {
    setFly({ piece: pieceId, color: ci, key: Date.now() }); sfx.whoop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 520));
    setFly(null);
    setState((s) => ({ ...s, worn: { ...s.worn, [pieceId]: ci, ...(pieceId === 'dress' ? { shirt: -1, pants: -1 } : pieceId === 'shirt' || pieceId === 'pants' ? { dress: -1 } : {}) } }));
    sfx.pop(); await new Promise((res) => window.setTimeout(res, reduce ? 0 : 90)); // hit-stop
    sfx.match(); fire(FRIEND.x, FRIEND.y, 'sparkle'); setHop((h) => h + 1);
  };

  const pickColor = async (ci: number) => {
    if (busy.current) return;
    if (!sel) { sfx.click(); return; } // choose a piece first (the rail glows)
    busy.current = true;
    const pieceId = sel; setSel(null);
    if (r) {
      if (pieceId !== scene.pieces[r.piece].id || ci !== r.color) {
        sfx.wrong(); shake(); setMisses((m) => m + 1);
        await sayWithin(studioWrongLine, friend, 2000);
        busy.current = false; return;
      }
      await put(pieceId, ci);
      await sayWithin(r.reply, friend, 3200);
      setState((s) => ({ ...s, round: s.round + 1 }));
      return;
    }
    await put(pieceId, ci);
    busy.current = false;
  };

  const takePhoto = async () => {
    if (busy.current || photo) return;
    busy.current = true;
    setFlash((f) => f + 1); sfx.ring(); fire(FRIEND.x, FRIEND.y - 10, 'stars');
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 400));
    await sayWithin(studioWearing, friend, 1800);
    const on = scene.pieces.filter((p) => (worn[p.id] ?? -1) >= 0).sort((a, b) => (Z[b.id] ?? 0) - (Z[a.id] ?? 0));
    for (const p of on) { fire(FRIEND.x, FRIEND.y + (3 - (Z[p.id] ?? 3)) * 10, 'sparkle'); await sayWithin(studioPhrase(p, scene.colors[worn[p.id]]), friend, 2200); }
    fire(50, 40, 'confetti'); sfx.gem();
    if (!gemDone) onWin(true);
    setState((s) => ({ ...s, photo: true, gemDone: true }));
    void sayWithin(scene.doneLine, scene.who, 3500);
  };

  const wornCount = Object.values(worn).filter((v) => v >= 0).length;
  const glowPiece = r && misses >= 2 ? scene.pieces[r.piece].id : null;
  const glowColor = r && misses >= 2 && sel === scene.pieces[r.piece].id ? r.color : -1;
  const outfit = scene.pieces.filter((p) => (worn[p.id] ?? -1) >= 0 && HAS[friend]?.includes(p.id)).sort((a, b) => (Z[a.id] ?? 2) - (Z[b.id] ?? 2));

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {photo && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3.1*var(--svw,1vw)), 5.2vh), 2.6rem)' }}>
          {r ? `“${r.line}”` : photo ? scene.doneLine : `“${scene.free.line}”`}
        </span>
      </div>
      {!photo && <button onClick={() => cueSpeak(r ? r.line : scene.free.line, friend)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* the friend, wearing what the child chose */}
      <div className="absolute z-20" style={{ left: `${FRIEND.x}%`, top: `${FRIEND.y}%`, height: 'min(72vh, 46vw)', aspectRatio: '1 / 1', translate: '-50% -50%' }}>
        <span className="absolute bottom-[3%] left-1/2 h-[6%] w-[46%] rounded-[50%] bg-black/25 blur-sm" style={{ translate: '-50% 0' }} />
        <motion.div key={hop} className="absolute inset-0" style={{ transformOrigin: '50% 92%' }}
          animate={reduce ? {} : hop ? { y: ['0%', '-6%', '0%'], scaleY: [1, 1.05, 0.95, 1], scaleX: [1, 0.96, 1.04, 1] } : { y: ['0%', '-1.2%', '0%'] }}
          transition={hop ? { duration: 0.5 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
          <img src={CAST[friend].img} alt={CAST[friend].name} draggable={false} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
          <AnimatePresence>
            {outfit.map((p) => (
              <motion.span key={`${friend}-${p.id}-${worn[p.id]}`} className="absolute inset-0" aria-label={p.word}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Tinted src={layer(friend, p.id)} hex={scene.colors[worn[p.id]].hex} lift={LIFT[p.id]} />
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* the clothes rail */}
      <div className="absolute z-20 flex gap-2 rounded-3xl bg-white/80 p-2 shadow-xl" style={{ left: '72%', top: '30%', translate: '-50% -50%' }}>
        {rail.map((p, i) => {
          const on = sel === p.id;
          const glow = glowPiece === p.id || (!sel && !free && misses >= 2 && glowPiece === p.id);
          return (
            <motion.button key={p.id} onClick={() => { if (busy.current) return; sfx.click(); setSel(on ? null : p.id); }} aria-label={p.word}
              className={`relative flex flex-col items-center rounded-2xl px-1 pt-1 ${on ? 'bg-yellow-200 ring-4 ring-yellow-400' : 'bg-white'}`}
              animate={reduce ? {} : on ? { y: -10, scale: 1.12 } : glow ? { y: [0, -8, 0] } : { y: [0, -2, 0], scale: 1 }}
              transition={on ? { type: 'spring', stiffness: 400, damping: 15 } : { duration: glow ? 0.7 : 2 + i * 0.2, repeat: Infinity }}>
              <img src={p.img} alt="" draggable={false} style={{ width: 'min(9vh, 6vw)', height: 'min(9vh, 6vw)' }} className="object-contain" />
              <span className="pb-1 text-xs font-black text-slate-700">{p.word}</span>
            </motion.button>
          );
        })}
      </div>

      {/* paint pots */}
      {scene.colors.map((c, i) => (
        <motion.button key={c.word} onClick={() => { void pickColor(i); }} aria-label={`${c.word} paint`}
          className="absolute z-20 flex flex-col items-center" style={{ left: `${potX(i, scene.colors.length)}%`, top: '76%', translate: '-50% -50%' }}
          whileTap={reduce ? undefined : { scale: 0.88 }}
          animate={reduce ? {} : glowColor === i ? { y: [0, -10, 0] } : sel ? { y: [0, -4, 0] } : { y: 0 }}
          transition={{ duration: glowColor === i ? 0.7 : 1.2, repeat: sel ? Infinity : 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: 'min(10vh, 7vw)', height: 'min(10vh, 7vw)' }} className="drop-shadow-[0_6px_6px_rgba(0,0,0,0.3)]">
            <path d="M14 30 L22 92 Q50 100 78 92 L86 30 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="4" />
            <ellipse cx="50" cy="30" rx="36" ry="12" fill={c.hex} stroke="#334155" strokeWidth="4" />
          </svg>
          <span className="mt-1 rounded-full bg-white/90 px-3 py-0.5 text-sm font-black text-slate-700 shadow">{c.word}</span>
        </motion.button>
      ))}

      {/* the piece swooping onto the friend */}
      <AnimatePresence>
        {fly && (() => {
          const p = scene.pieces.find((x) => x.id === fly.piece)!;
          return (
            <motion.span key={fly.key} className="pointer-events-none absolute z-40" style={{ width: 'min(12vh, 8vw)', height: 'min(12vh, 8vw)', translate: '-50% -50%' }}
              initial={{ left: '72%', top: '30%', scale: 1, rotate: 0 }}
              animate={{ left: ['72%', '52%', `${FRIEND.x}%`], top: ['30%', '12%', `${FRIEND.y - 6}%`], scale: [1, 1.3, 0.6], rotate: [0, -20, 10] }}
              exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: 'easeIn' }}><Tinted src={p.img} hex={scene.colors[fly.color].hex} /></motion.span>
          );
        })()}
      </AnimatePresence>

      {/* camera flash */}
      <AnimatePresence>
        {flash > 0 && !reduce && <motion.div key={flash} className="pointer-events-none absolute inset-0 z-40 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
      </AnimatePresence>

      {free && !photo && wornCount >= 2 && (
        <motion.button onClick={() => { void takePhoto(); }} className={`${CLAY_BUTTON} absolute z-30 px-8 py-3 text-xl`} style={{ left: '72%', top: '52%', translate: '-50% -50%' }}
          initial={{ scale: 0 }} animate={reduce ? { scale: 1 } : { scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>📸 Photo!</motion.button>
      )}

      <div className="pointer-events-none absolute bottom-3 z-30 flex gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg" style={{ left: `${FRIEND.x}%`, translate: '-50% 0' }}>
        {[...scene.rounds, null].map((_, i) => <span key={i} className={`text-2xl ${i < round || photo ? '' : 'opacity-25 grayscale'}`}>{i < total ? '👕' : '📸'}</span>)}
      </div>
      <Bursts items={bursts} />
      {photo && (
        <motion.div className="absolute z-40" style={{ left: '72%', top: '52%', translate: '-50% -50%' }} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function dressStudioLines(scene: Studio) {
  const f = scene.free.friend;
  return [
    ...scene.rounds.flatMap((r) => [[r.friend, r.line], [r.friend, r.reply], [r.friend, studioWrongLine]]),
    [f, scene.free.line], [f, studioWearing], [f, studioWrongLine],
    ...scene.pieces.filter((p) => HAS[f]?.includes(p.id)).flatMap((p) => scene.colors.map((c) => [f, studioPhrase(p, c)])),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
