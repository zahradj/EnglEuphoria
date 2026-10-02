import { useEffect, useMemo } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf, CARD_FONT } from './shared';

/* ---------- Welcome party (A1 U1 L1 signature game) ----------
 * Guests knock at the party door. The door only opens when the child
 * chooses — and says — the right line: greet the guest and ask their name
 * ("greet" rounds), or answer the guest's question with their name
 * ("answer" rounds). The guest comes in, introduces themself, and the child
 * pins the right name badge on them. Using the language IS what moves the
 * party forward: a wrong line (e.g. "Goodbye!") keeps the door shut. */

export function welcomeLine(name: string) {
  return `Welcome, ${name}!`;
}

type Phase = 'knock' | 'choose' | 'enter' | 'badge' | 'joined';

export function WelcomePartyScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'welcome-party' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    phase: 'knock' as Phase,
    wrongOpt: -1,
    wrongName: '',
    joined: [] as string[],
    gemDone: false,
  });
  const { round, phase, wrongOpt, wrongName, joined, gemDone } = state;
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : undefined;
  const joinedSet = useMemo(() => new Set(joined), [joined]);

  // Each round opens with the knock; the guest's knock line is spoken once.
  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    setState((s) => ({ ...s, phase: 'knock', wrongOpt: -1, wrongName: '' }));
    (async () => {
      sfx.click();
      await new Promise((res) => setTimeout(res, 250));
      sfx.click();
      if (cancelled) return;
      await safeSpeak(r.knock, voiceOf(r.guest));
      if (cancelled) return;
      setState((s) => (s.round === round && s.phase === 'knock' ? { ...s, phase: 'choose' } : s));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const finishRound = async () => {
    if (!r) return;
    const next = round + 1;
    setState((s) => ({ ...s, phase: 'joined', joined: s.joined.includes(r.guest) ? s.joined : [...s.joined, r.guest] }));
    await new Promise((res) => setTimeout(res, 900));
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  const pickLine = async (i: number) => {
    if (!r || phase !== 'choose') return;
    const opt = r.options[i];
    if (!opt) return;
    if (!opt.correct) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrongOpt: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongOpt: -1 })), 700);
      return;
    }
    setState((s) => ({ ...s, phase: 'enter', wrongOpt: -1 }));
    await safeSpeak(opt.line, voiceOf(scene.host));
    sfx.reveal();
    await new Promise((res) => setTimeout(res, 500));
    await safeSpeak(r.reply, voiceOf(r.guest));
    if (r.mode === 'greet' && r.names.length > 1) setState((s) => ({ ...s, phase: 'badge' }));
    else await finishRound();
  };

  const pickName = async (name: string) => {
    if (!r || phase !== 'badge') return;
    if (name !== CAST[r.guest].name) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrongName: name }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongName: '' })), 700);
      return;
    }
    sfx.match();
    await safeSpeak(welcomeLine(name), voiceOf(scene.host));
    await finishRound();
  };

  const lineup = (
    <div className="pointer-events-none absolute bottom-[4%] right-[2%] z-20 flex items-end gap-1">
      {scene.rounds.filter((g) => joinedSet.has(g.guest)).map((g) => (
        <div key={g.guest} className="flex flex-col items-center">
          <img src={g.sprite} alt="" className="h-[22vh] w-auto drop-shadow-xl" draggable={false} />
          <span className="-mt-2 rounded-lg bg-white px-2 py-0.5 text-sm font-black shadow ring-2" style={{ color: CAST[g.guest].color, ['--tw-ring-color' as string]: CAST[g.guest].color, fontFamily: CARD_FONT }}>
            {CAST[g.guest].name}
          </span>
        </div>
      ))}
    </div>
  );

  if (finished || !r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
        {lineup}
        <div className="relative z-30 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white px-8 py-4 text-center shadow-2xl" style={{ fontFamily: CARD_FONT }}>
            <div className="text-3xl font-black text-orange-600">🎉 Party time!</div>
            <div className="text-lg font-bold text-neutral-700">You welcomed every friend!</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const doorOpen = phase === 'enter' || phase === 'badge' || phase === 'joined';
  const guestVisible = doorOpen && phase !== 'joined';
  const c = CAST[r.guest];
  const d = scene.door;

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/30" />

      {/* Door: dark doorway when open, a knocking glow while closed. */}
      <div
        className={`pointer-events-none absolute z-10 rounded-t-2xl transition-all duration-500 ${doorOpen ? 'bg-[#3b2a1a]/85' : phase === 'knock' ? 'animate-[lep1-shake_0.4s_ease-in-out_2]' : ''}`}
        style={{ left: `${d.left}%`, top: `${d.top}%`, width: `${d.width}%`, height: `${d.height}%`, boxShadow: doorOpen ? 'none' : '0 0 0 4px rgba(255,200,80,0.6)' }}
      />
      {!doorOpen && (
        <div className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-lg font-black text-orange-600 shadow-lg" style={{ left: `${d.left + d.width / 2}%`, top: `${Math.max(2, d.top - 7)}%`, fontFamily: CARD_FONT }}>
          ✊ Knock, knock!
        </div>
      )}
      {guestVisible && (
        <img
          src={r.sprite}
          alt={c.name}
          className="pointer-events-none absolute z-20 w-auto -translate-x-1/2 animate-[lep1-pop_0.4s_ease-out] drop-shadow-2xl"
          style={{ left: `${d.left + d.width / 2}%`, bottom: `${100 - d.top - d.height}%`, height: `${d.height * 0.95}%` }}
          draggable={false}
        />
      )}
      {lineup}

      {/* Prompt */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl" style={{ fontFamily: CARD_FONT }}>
        {phase === 'badge' ? 'Who is it? Pin the right name badge!' : r.mode === 'greet' ? 'Say hello and ask the name!' : 'Answer the question!'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(r.knock, voiceOf(r.guest))} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* What the guest just said */}
      {(phase === 'enter' || phase === 'badge') && (
        <div className="pointer-events-none absolute z-30 max-w-[34%] rounded-3xl bg-white px-4 py-2 text-lg font-black shadow-2xl ring-4" style={{ left: `${Math.min(62, d.left + d.width + 2)}%`, top: `${d.top + 4}%`, color: c.color, ['--tw-ring-color' as string]: `${c.color}55`, fontFamily: CARD_FONT }}>
          {r.reply}
        </div>
      )}
      {phase !== 'enter' && phase !== 'badge' && r.mode === 'answer' && phase === 'choose' && (
        <div className="pointer-events-none absolute z-30 max-w-[34%] rounded-3xl bg-white px-4 py-2 text-lg font-black shadow-2xl ring-4" style={{ left: `${Math.min(62, d.left + d.width + 2)}%`, top: `${d.top + 4}%`, color: c.color, ['--tw-ring-color' as string]: `${c.color}55`, fontFamily: CARD_FONT }}>
          {r.knock}
        </div>
      )}

      {/* Line choices: say it, then tap it */}
      {phase === 'choose' && (
        <div className="absolute inset-x-0 bottom-[6%] z-30 flex flex-wrap justify-center gap-3 px-4">
          {r.options.map((o, i) => (
            <button
              key={o.line}
              onClick={() => pickLine(i)}
              className={`min-h-[56px] rounded-3xl border-4 bg-white px-5 py-3 text-lg font-black text-neutral-800 shadow-2xl transition active:scale-95 sm:text-xl ${wrongOpt === i ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-orange-200 hover:border-orange-400'}`}
              style={{ fontFamily: CARD_FONT }}
            >
              💬 {o.line}
            </button>
          ))}
        </div>
      )}

      {/* Name badges */}
      {phase === 'badge' && (
        <div className="absolute inset-x-0 bottom-[6%] z-30 flex flex-wrap justify-center gap-4 px-4">
          {r.names.map((n) => (
            <button
              key={n}
              onClick={() => pickName(n)}
              className={`min-h-[56px] rounded-2xl border-4 bg-[#FFF6DF] px-6 py-3 text-2xl font-black text-[#2A1459] shadow-2xl transition active:scale-95 ${wrongName === n ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-amber-300'}`}
              style={{ fontFamily: CARD_FONT }}
            >
              🏷️ {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Every line this scene speaks, for voice baking (generate-voice-cache). */
export function welcomePartyLines(scene: Extract<Scene, { kind: 'welcome-party' }>): [CharKey, string][] {
  const out: [CharKey, string][] = [];
  for (const r of scene.rounds) {
    out.push([r.guest, r.knock], [r.guest, r.reply]);
    for (const o of r.options) if (o.correct) out.push([scene.host, o.line]);
    if (r.mode === 'greet') out.push([scene.host, welcomeLine(CAST[r.guest].name)]);
  }
  return out;
}
