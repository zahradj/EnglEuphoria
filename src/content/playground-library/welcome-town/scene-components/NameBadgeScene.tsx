import { useEffect } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, playLetterName } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf, CARD_FONT } from './shared';

/* ---------- Name badge (A1 U1 L1: "How do you spell it?") ----------
 * Part A: a friend's name is spelled out with the RECORDED letter-name clips
 * (no voice reads single letters — they come out wrong); the child taps the
 * letters in order to fill the friend's badge.
 * Part B: the child builds their OWN badge on an A–Z strip (each tap plays the
 * recorded letter name), then says "My name is …" out loud. The child's name
 * itself is never voiced — only the child says it. */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_OWN = 12;

export function spellPrompt(name: string) {
  return `How do you spell ${name}?`;
}
export const OWN_BADGE_PROMPT = 'Now make your name badge!';
export const OWN_BADGE_SAY = 'Great! Now say: My name is…';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function spellOut(name: string) {
  for (const ch of name.toUpperCase()) {
    if (!/[A-Z]/.test(ch)) continue;
    await playLetterName(ch);
    await sleep(180);
  }
}

export function NameBadgeScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'name-badge' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    filled: 0,
    wrong: '',
    own: '',
    ownDone: false,
    gemDone: false,
  });
  const { round, filled, wrong, own, ownDone, gemDone } = state;
  const total = scene.rounds.length;
  const inOwn = round >= total;
  const r = !inOwn ? scene.rounds[round] : undefined;
  const target = r ? r.name.toUpperCase().replace(/[^A-Z]/g, '') : '';
  const c = CAST[scene.who];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await sleep(350);
      if (cancelled) return;
      if (r) {
        await safeSpeak(spellPrompt(r.name), voiceOf(scene.who));
        if (!cancelled) await spellOut(r.name);
      } else {
        await safeSpeak(OWN_BADGE_PROMPT, voiceOf(scene.who));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tapSpell = async (letter: string) => {
    if (!r || filled >= target.length) return;
    if (letter !== target[filled]) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: letter }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 500);
      return;
    }
    const nextFilled = filled + 1;
    setState((s) => ({ ...s, filled: nextFilled, wrong: '' }));
    await playLetterName(letter);
    if (nextFilled >= target.length) {
      sfx.match();
      await sleep(900);
      setState((s) => ({ ...s, round: s.round + 1, filled: 0 }));
    }
  };

  const tapOwn = (letter: string) => {
    if (ownDone || own.length >= MAX_OWN) return;
    sfx.click();
    void playLetterName(letter);
    setState((s) => ({ ...s, own: (s.own + letter).slice(0, MAX_OWN) }));
  };
  const backspace = () => { if (!ownDone) setState((s) => ({ ...s, own: s.own.slice(0, -1) })); };
  const finishOwn = async () => {
    if (ownDone || own.length < 2) return;
    const awardGem = !gemDone;
    setState((s) => ({ ...s, ownDone: true, gemDone: true }));
    sfx.reveal();
    if (awardGem) { sfx.gem(); onWin(true); }
    await safeSpeak(OWN_BADGE_SAY, voiceOf(scene.who));
  };

  const prettyOwn = own ? own[0] + own.slice(1).toLowerCase() : '';

  const header = (
    <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-lg" style={{ fontFamily: CARD_FONT }}>
      🏷️ {r ? scene.teacher : 'Make YOUR name badge! Tap the letters of your name.'}
      {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
    </div>
  );

  // Part A — spell a friend's name.
  if (r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-20" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        {header}
        <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center gap-5 px-4">
          <div className="flex items-end gap-4">
            {r.sprite && <img src={r.sprite} alt="" className="h-[26vh] w-auto drop-shadow-2xl" draggable={false} />}
            <div className="rounded-3xl border-[6px] bg-[#FFF6DF] px-6 py-4 shadow-2xl" style={{ borderColor: c.color }}>
              <div className="mb-2 text-center text-xs font-black uppercase tracking-widest text-neutral-500">Hello, my name is</div>
              <div className="flex gap-2">
                {target.split('').map((ch, i) => (
                  <div key={i} className={`grid h-16 w-14 place-items-center rounded-xl border-4 text-4xl font-black ${i < filled ? 'border-emerald-400 bg-white text-[#2A1459]' : 'border-dashed border-neutral-300 bg-white/60 text-transparent'}`} style={{ fontFamily: CARD_FONT }}>
                    {i < filled ? ch : '·'}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { void safeSpeak(spellPrompt(r.name), voiceOf(scene.who)).then(() => spellOut(r.name)); }} className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Spell it again</button>
          <div className="flex flex-wrap justify-center gap-3">
            {r.choices.map((ch) => (
              <button
                key={ch}
                onClick={() => tapSpell(ch.toUpperCase())}
                className={`grid h-16 w-16 place-items-center rounded-2xl border-4 bg-white text-3xl font-black text-[#2A1459] shadow-xl transition active:scale-95 ${wrong === ch.toUpperCase() ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-amber-300'}`}
                style={{ fontFamily: CARD_FONT }}
              >
                {ch.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Part B — the child's own badge.
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-20" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/25" />
      {ownDone && <Confetti count={50} />}
      {header}
      <div className="relative z-10 flex w-full max-w-[760px] flex-col items-center gap-4 px-4">
        <div className="min-w-[60%] rounded-3xl border-[6px] bg-[#FFF6DF] px-6 py-4 text-center shadow-2xl" style={{ borderColor: c.color }}>
          <div className="text-xs font-black uppercase tracking-widest text-neutral-500">Hello, my name is</div>
          <div className="min-h-[56px] text-5xl font-black text-[#2A1459]" style={{ fontFamily: CARD_FONT }}>{prettyOwn || <span className="text-neutral-300">…</span>}</div>
        </div>
        {ownDone ? (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-white px-6 py-3 text-2xl font-black text-orange-600 shadow-xl" style={{ fontFamily: CARD_FONT }}>🗣️ Say: “My name is {prettyOwn}!”</div>
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-13" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))', width: '100%' }}>
              {ALPHABET.map((ch) => (
                <button key={ch} onClick={() => tapOwn(ch)} className="h-11 rounded-xl border-2 border-amber-300 bg-white text-xl font-black text-[#2A1459] shadow active:scale-95" style={{ fontFamily: CARD_FONT }}>{ch}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={backspace} className="rounded-full bg-white px-5 py-3 text-lg font-black text-neutral-600 shadow-lg active:scale-95">⌫ Undo</button>
              <button onClick={finishOwn} disabled={own.length < 2} className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-lg font-black text-white shadow-xl active:scale-95 disabled:opacity-40">✅ Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Every voiced line (letters are recorded clips, not voiced). */
export function nameBadgeLines(scene: Extract<Scene, { kind: 'name-badge' }>): [CharKey, string][] {
  return [...scene.rounds.map((r) => [scene.who, spellPrompt(r.name)] as [CharKey, string]), [scene.who, OWN_BADGE_PROMPT], [scene.who, OWN_BADGE_SAY]];
}
