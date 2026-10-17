import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { numWord, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { Bursts, CalmBg, useBursts, useShake } from '../../unit1/scene-components/gameFx';
import { SKIN, jewel } from '../../gameSkin';

/* ---------- Party Phone (A1 U1 L3, listen and write a name and numbers — docs/a1-unit-1-welcome-town.md §5.3) ----------
 * Ring ring! A friend calls to invite the child to a birthday party: "Hi! It's Bella. B, E, L, L, A. I am nine. My party
 * is at house number fifteen!" The child fills in the invitation card like a real one: the NAME letter by letter (the
 * friend spells it), the AGE and the HOUSE NUMBER on a number pad. Each line of the card has its own 🔊 to hear that
 * part again. When the card is full it gets a gold stamp and flies into the envelope; the next friend calls.
 * Researched mechanics (docs/research/playground-a1u1l3-research.md): Cambridge Pre A1 Starters Listening Part 2
 * ("listen and write a name or a number"; the sample asks the girl's name and "How old is she?"), phone role-plays in
 * ESL classes. Better: the child writes on a real-looking invitation (not a worksheet line), every part can be heard
 * again on its own, numbers up to twenty are typed digit by digit (fifteen = 1 + 5), and the card is "posted".
 * Look: the party picture behind is calmed; an orange toy phone that rings and shakes; a cream invitation card with
 * balloon corners; letter tiles and number keys in the brand jewel colours; a gold "SENT" stamp. */

type Phone = Extract<Scene, { kind: 'party-phone' }>;
type Field = 'name' | 'age' | 'house';
const FIELDS: Field[] = ['name', 'age', 'house'];

export const phoneLines = (c: { name: string; age: number; house: number }) => ({
  call: `Hi! It’s ${c.name}. ${c.name.toUpperCase().split('').join(', ')}. I am ${numWord(c.age)}. My party is at house number ${numWord(c.house)}. Come to my party!`,
  name: `My name is ${c.name}. ${c.name.toUpperCase().split('').join(', ')}.`,
  age: `I am ${numWord(c.age)}.`,
  house: `House number ${numWord(c.house)}.`,
});

export function PartyPhoneScene({ scene, onNext, onWin, onLose, sync }: { scene: Phone; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.calls.length;
  const [state, setState] = useSyncedState(sync, { call: 0, phase: 'ring', field: 0, letters: 0, typed: '', age: '', house: '', wrong: '', done: false });
  const ci = Math.max(0, Math.min(total - 1, Number(state.call) || 0));
  const c = scene.calls[ci];
  const phase = String(state.phase);
  const fieldIdx = Math.max(0, Math.min(2, Number(state.field) || 0));
  const field = FIELDS[fieldIdx];
  const name = (c?.name ?? '').toUpperCase();
  const letters = Math.max(0, Math.min(name.length, Number(state.letters) || 0));
  const typed = String(state.typed ?? '');
  const done = !!state.done;
  const lines = c ? phoneLines(c) : null;
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const gemDone = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)); };
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);
  // the letter tiles: the name's letters plus two others, shuffled the same way on both screens (seeded by the call)
  const tiles = useMemo(() => {
    const extra = ['S', 'T', 'M', 'R', 'O', 'P', 'N'].filter((x) => !name.includes(x)).slice(ci % 3, ci % 3 + 2);
    const set = Array.from(new Set([...name.split(''), ...extra]));
    return set.map((l, i) => ({ l, k: ((i + 3) * 7 + ci * 5) % 11 })).sort((a, b) => a.k - b.k).map((t) => t.l);
  }, [name, ci]);

  useEffect(() => {
    if (done || !c || phase !== 'ring') return undefined;
    const t = window.setTimeout(() => { sfx.pop(); cueSpeak('Ring ring! Pick up the phone!', voiceOf(scene.who)); }, ci === 0 ? 900 : 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ci, phase, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pickUp = () => {
    if (!c || !lines) return;
    sfx.click();
    cueSpeak(lines.call, voiceOf(c.from));
    if (phase === 'ring') setState((s) => ({ ...s, phase: 'write' }));
  };
  const nextField = () => {
    const nf = fieldIdx + 1;
    if (nf < 3) { setState((s) => ({ ...s, field: nf, typed: '', wrong: '' })); return; }
    // the card is full: stamp, post, next call
    sfx.gem(); fire(70, 45, 'confetti');
    setState((s) => ({ ...s, phase: 'sent', typed: '', wrong: '' }));
    cueSpeak(`Thank you, ${c?.name}! See you at the party!`, voiceOf(scene.who));
    later(2600, () => setState((s) => {
      const nx = (Number(s.call) || 0) + 1;
      return nx >= total ? { ...s, done: true } : { ...s, call: nx, phase: 'ring', field: 0, letters: 0, typed: '', age: '', house: '' };
    }));
  };
  const tapLetter = (l: string) => {
    if (phase !== 'write' || field !== 'name') return;
    if (l !== name[letters]) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: l }));
      later(500, () => setState((s) => ({ ...s, wrong: '' })));
      return;
    }
    sfx.pop();
    cueSpeak(l, voiceOf(c!.from));
    const nl = letters + 1;
    setState((s) => ({ ...s, letters: nl }));
    if (nl >= name.length) { sfx.match(); fire(70, 34, 'stars'); later(500, nextField); }
  };
  const tapDigit = (d: string) => {
    if (phase !== 'write' || field === 'name' || !c) return;
    const goal = String(field === 'age' ? c.age : c.house);
    const t = (typed + d).slice(0, 2);
    if (t.length < goal.length) { sfx.pop(); setState((s) => ({ ...s, typed: t })); return; }
    if (t !== goal) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, typed: t, wrong: t }));
      cueSpeak('Listen again!', voiceOf(scene.who));
      later(700, () => setState((s) => ({ ...s, typed: '', wrong: '' })));
      return;
    }
    sfx.match(); fire(70, field === 'age' ? 50 : 62, 'stars');
    setState((s) => ({ ...s, typed: '', [field]: t }));
    later(400, nextField);
  };
  const hear = (f: Field) => { if (c && lines) { sfx.click(); cueSpeak(lines[f], voiceOf(c.from)); } };

  const fieldValue = (f: Field) => (f === 'age' ? String(state.age ?? '') : f === 'house' ? String(state.house ?? '') : '');
  const ringing = phase === 'ring' && !done;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-[#FDE7C2]">
      <CalmBg img={scene.bg} />
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📞 ${scene.title}`}
        </span>
      </div>

      {/* the phone and the caller */}
      {c && !done && (
        <div className="absolute start-[4%] top-[18%] z-10 flex w-[30%] flex-col items-center">
          <motion.button type="button" onClick={pickUp} className="relative w-[70%]" whileTap={{ scale: 0.92 }}
            animate={ringing && !reduce ? { rotate: [0, -8, 8, -8, 8, 0], y: [0, -6, 0] } : { rotate: 0 }} transition={{ duration: 0.7, repeat: ringing ? Infinity : 0, repeatDelay: 0.5 }}>
            <img src={scene.phoneImg} alt="phone" draggable={false} className="w-full object-contain drop-shadow-[0_1.2vh_1.2vh_rgba(120,53,15,0.35)]" />
            {ringing && !reduce && [0, 1].map((k) => (
              <motion.span key={k} className="absolute -top-[6%] text-[min(4vh,2.6vw)]" style={{ [k ? 'right' : 'left']: '-6%' }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }} transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.3 }}>🎵</motion.span>
            ))}
          </motion.button>
          <div className={`${SKIN.pill} mt-[1.4vh] px-[1.2vw] py-[0.5vh]`} style={{ fontSize: 'min(2.6vh,1.7vw)' }}>
            {ringing ? '👆 Ring ring! Tap the phone!' : '🔊 Tap the phone to hear it again'}
          </div>
          <AnimatePresence>
            {!ringing && (
              <motion.div key={ci} className="mt-[1.6vh] flex items-center gap-[0.8vw]" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                <span className="block aspect-square w-[min(13vh,8vw)] overflow-hidden rounded-full border-[0.5vh] border-white bg-[#FEFBDD] shadow-lg">
                  <img src={c.img} alt="" draggable={false} className="h-[150%] w-full object-cover object-top" />
                </span>
                <span className="rounded-[1.4vh] bg-white/90 px-[0.8vw] py-[0.4vh] font-black text-[#3B2410] shadow" style={{ fontSize: 'min(2.6vh,1.7vw)' }}>📞 …</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* the invitation card */}
      {c && !done && (
        <motion.div key={`card-${ci}`} className="absolute end-[4%] top-[14%] z-10 w-[58%]" animate={shakeCtl}>
          <motion.div className="relative rounded-[2.4vh] border-[0.5vh] border-[#FEAF15] p-[2.4vh] shadow-[0_1.6vh_3vh_rgba(60,30,10,0.35)]"
            style={{ background: 'radial-gradient(circle at 20% 10%, #FFFFFF, #FEFBDD 55%, #FDEFC2)' }}
            animate={phase === 'sent' && !reduce ? { x: ['0%', '0%', '-80%'], y: ['0%', '0%', '60%'], scale: [1, 1, 0.2], rotate: [0, 0, -14], opacity: [1, 1, 0] } : {}}
            transition={{ duration: 2.2, times: [0, 0.45, 1] }}>
            <span className="absolute -start-[2vh] -top-[2.6vh] text-[min(6vh,4vw)]">🎈</span>
            <span className="absolute -end-[1.6vh] -top-[2.6vh] text-[min(6vh,4vw)]">🎈</span>
            <div className="mb-[1.2vh] text-center font-black text-[#FE6A2F]" style={{ fontSize: 'min(3.6vh,2.3vw)' }}>🎉 Party Invitation 🎉</div>
            {FIELDS.map((f, k) => {
              const active = phase === 'write' && field === f;
              const filled = k < fieldIdx || phase === 'sent';
              return (
                <div key={f} className={`mb-[1vh] flex items-center gap-[1vw] rounded-[1.6vh] px-[1vw] py-[0.8vh] ${active ? 'bg-[#FEAF15]/25 ring-[0.35vh] ring-[#FEAF15]' : ''}`}>
                  <button type="button" onClick={() => hear(f)} className="shrink-0 rounded-full bg-[#F59E0B] px-[0.7vw] py-[0.3vh] font-black text-white shadow" style={{ fontSize: 'min(2.4vh,1.5vw)' }}>🔊</button>
                  <span className="w-[24%] shrink-0 font-black text-[#7A5A2E]" style={{ fontSize: 'min(2.8vh,1.8vw)' }}>{f === 'name' ? 'Name:' : f === 'age' ? 'Age:' : 'House:'}</span>
                  {f === 'name' ? (
                    <span className="flex gap-[0.4vw]">
                      {name.split('').map((l, i) => (
                        <span key={i} className="flex h-[min(6vh,3.8vw)] w-[min(5vh,3.2vw)] items-center justify-center border-b-[0.5vh] border-[#B45309] font-black text-[#2A1A05]" style={{ fontSize: 'min(3.8vh,2.4vw)' }}>
                          {i < letters || filled ? l : ''}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className={`flex h-[min(6vh,3.8vw)] min-w-[min(10vh,6.4vw)] items-center justify-center rounded-[1vh] border-[0.35vh] font-black ${state.wrong && active ? 'border-[#E11D48] text-[#E11D48]' : 'border-[#B45309] text-[#2A1A05]'} bg-white`} style={{ fontSize: 'min(4vh,2.6vw)' }}>
                      {filled ? fieldValue(f) : active ? typed || '…' : ''}
                    </span>
                  )}
                  {filled && <span className="ms-auto text-[min(3.4vh,2.2vw)]">✅</span>}
                </div>
              );
            })}
            <AnimatePresence>
              {phase === 'sent' && (
                <motion.span className="absolute end-[6%] top-[38%] rounded-[1.2vh] border-[0.6vh] border-[#B45309] px-[1.2vw] py-[0.4vh] font-black text-[#B45309]"
                  style={{ fontSize: 'min(5vh,3.2vw)', rotate: -14, background: 'rgba(254,175,21,0.25)' }}
                  initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }}>
                  SENT ✉️
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* the pad: letters for the name, numbers for age and house */}
          {phase === 'write' && (
            <div className="mt-[1.6vh] flex flex-wrap justify-center gap-[0.8vw]">
              {field === 'name'
                ? tiles.map((l, i) => (
                  <motion.button key={l} type="button" onClick={() => tapLetter(l)} whileTap={{ scale: 0.86 }}
                    animate={state.wrong === l ? { x: [0, -6, 6, -4, 0] } : {}}
                    className={`flex aspect-square w-[min(8vh,5vw)] items-center justify-center rounded-[1.6vh] font-black ${jewel(i)}`} style={{ fontSize: 'min(4vh,2.6vw)' }}>
                    {l}
                  </motion.button>
                ))
                : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d, i) => (
                  <motion.button key={d} type="button" onClick={() => tapDigit(d)} whileTap={{ scale: 0.86 }}
                    className={`flex aspect-square w-[min(7.6vh,4.8vw)] items-center justify-center rounded-full font-black ${jewel(i)}`} style={{ fontSize: 'min(3.8vh,2.4vw)' }}>
                    {d}
                  </motion.button>
                ))}
            </div>
          )}
        </motion.div>
      )}

      {/* the envelope the card flies into */}
      {phase === 'sent' && !done && (
        <motion.img src={scene.envelopeImg} alt="" draggable={false} className="pointer-events-none absolute bottom-[4%] start-[40%] z-20 w-[14%] drop-shadow-xl"
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} />
      )}

      <Bursts items={bursts} />
      {done && <Confetti count={90} />}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
