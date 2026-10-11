import { useEffect, useMemo, useRef } from 'react';
import type { CharKey, Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { seededOrder } from '../../PictureMatchScene';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf, CARD_FONT } from './shared';

/* ---------- Chat Chain (A1 U1 L4 signature game, "have a short greeting conversation").
   A friend says a line (heard + shown as a chat bubble). The child picks the reply that FITS out of 2-3
   bubbles ("What's your name?" -> "My name is …", not "I am fine"), then SAYS it out loud; the reply joins
   the chat and the friend answers. Turn by turn the child builds a whole conversation, and at the end the
   chat plays back from the top, the child's lines included, so they hear the conversation they made.
   Sources (mechanic only): Duolingo "complete the chat" / Stories dialogue choices, Novakid and LingoAce
   speech-bubble replies, Cambridge Pre A1 Starters / A1 Movers speaking "ask and answer".
   Better: the wrong bubbles are real lines of the unit that answer a DIFFERENT question (so the child must
   understand the question, not spot a new word), every reply must also be spoken, a wrong tap repeats the
   friend's line instead of moving on, and the finished chat replays as a whole conversation. ---------- */

export function ChatChainScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'chat-chain' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    step: 0, phase: 'listen' as string, wrong: '' as string, finished: false, gemDone: false, playing: -1,
  });
  const { step, phase, wrong, finished, playing } = state;
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const turns = scene.turns;
  const turn = turns[step];
  const listRef = useRef<HTMLDivElement>(null);

  // Friend turns play on their own; the chat stops at each student turn.
  useEffect(() => {
    if (isRemoteMirror || finished || !turn) return;
    if (turn.who === 'student') { setState((s) => ({ ...s, phase: 'pick' })); return; }
    let live = true;
    void (async () => {
      await safeSpeak(turn.line, voiceOf(turn.who));
      if (!live) return;
      window.setTimeout(() => { if (live) advance(); }, 350);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, finished]);

  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [step, phase]);

  const advance = () => {
    const next = step + 1;
    if (next >= turns.length) {
      setState((s) => ({ ...s, step: turns.length, phase: 'done', finished: true }));
      if (!state.gemDone) { sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); }
      return;
    }
    setState((s) => ({ ...s, step: next, phase: 'listen', wrong: '' }));
  };

  const options = useMemo(() => {
    if (!turn || turn.who !== 'student') return [] as string[];
    const list = [turn.line, ...turn.wrong];
    return seededOrder(list.length, `${scene.id}:${step}`).map((i) => list[i]);
  }, [turn, step, scene.id]);

  const pick = (label: string) => {
    if (isRemoteMirror || !turn || turn.who !== 'student' || phase !== 'pick') return;
    if (label !== turn.line) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: label }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 500);
      const prev = turns[step - 1];
      if (prev && prev.who !== 'student') void safeSpeak(prev.line, voiceOf(prev.who));
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, phase: 'say', wrong: '' }));
    void safeSpeak(turn.line, voiceOf('pip'));
  };

  const playBack = async () => {
    if (isRemoteMirror) return;
    for (let i = 0; i < turns.length; i++) {
      setState((s) => ({ ...s, playing: i }));
      const t = turns[i];
      await safeSpeak(t.line, voiceOf(t.who === 'student' ? 'pip' : t.who));
    }
    setState((s) => ({ ...s, playing: -1 }));
  };

  useEffect(() => { cueSpeak(scene.intro, voiceOf(scene.partner)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const upto = finished ? turns.length : turn?.who === 'student' && phase !== 'say' ? step : step + 1;
  const shown = turns.slice(0, Math.min(turns.length, upto));
  const partner = CAST[scene.partner];

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})`, fontFamily: CARD_FONT }}>
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      {finished && <Confetti count={50} />}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl sm:text-base">
        💬 {scene.title} <span className="ml-1 opacity-60">({Math.min(turns.filter((t, i) => t.who === 'student' && (i < step || finished)).length, turns.filter((t) => t.who === 'student').length)}/{turns.filter((t) => t.who === 'student').length})</span>
      </div>

      {/* The friend you are talking to */}
      <div className="absolute bottom-[4%] left-[2%] z-10 flex h-[78%] w-[30%] flex-col items-center justify-end">
        <img src={`/welcome-town/sprites/${scene.partner}-wave.png`} alt={partner.name} className="max-h-[88%] object-contain drop-shadow-2xl" style={{ maxWidth: '100%' }} />
        <span className="mt-1 rounded-full bg-white/95 px-4 py-1 text-lg font-black shadow" style={{ color: partner.color }}>{partner.name}</span>
      </div>

      {/* Chat panel */}
      <div className="absolute right-[3%] top-[11%] z-20 flex h-[84%] w-[63%] flex-col rounded-[2rem] border-[6px] border-white bg-[#EAF6FF]/95 shadow-2xl">
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {shown.map((t, i) => {
            const mine = t.who === 'student';
            const c = mine ? null : CAST[t.who];
            return (
              <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`} style={{ animation: 'lep1-pop 0.3s ease-out' }}>
                <button
                  onClick={() => { if (!isRemoteMirror) cueSpeak(t.line, voiceOf(mine ? 'pip' : (t.who as CharKey))); }}
                  className={`max-w-[80%] rounded-3xl px-4 py-2 text-left text-lg font-black shadow sm:text-2xl ${mine ? 'rounded-br-md bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'rounded-bl-md bg-white text-[#2A1459]'} ${playing === i ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  {!mine && c && <span className="mr-2 text-sm font-black" style={{ color: c.color }}>{c.name}:</span>}
                  {mine && <span className="mr-2 text-sm font-black text-white/80">You:</span>}
                  {t.line}
                </button>
              </div>
            );
          })}
        </div>

        {/* Reply bar */}
        <div className="border-t-4 border-white bg-white/70 px-3 py-3">
          {turn && turn.who === 'student' && phase === 'pick' && (
            <div className="flex flex-wrap justify-center gap-2">
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => pick(o)}
                  className={`rounded-3xl border-4 bg-white px-4 py-2 text-base font-black text-[#2A1459] shadow-lg transition active:scale-95 sm:text-xl ${wrong === o ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400 bg-red-100' : 'border-orange-300'}`}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
          {turn && turn.who === 'student' && phase === 'say' && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => cueSpeak(turn.line, voiceOf('pip'))} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFD978] text-2xl shadow active:scale-95" aria-label="Hear it again">🔊</button>
              <span className="text-lg font-black text-[#2A1459] sm:text-2xl">🎤 Say it to {partner.name}!</span>
              <button onClick={() => { if (!isRemoteMirror) { sfx.pop(); advance(); } }} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-lg font-black text-white shadow-lg active:scale-95">I said it! ▶</button>
            </div>
          )}
          {turn && turn.who !== 'student' && !finished && (
            <div className="text-center text-lg font-black text-[#2A1459]/70 sm:text-xl">👂 Listen to {CAST[turn.who].name}…</div>
          )}
          {finished && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={playBack} disabled={playing >= 0} className="rounded-full bg-[#FFD978] px-5 py-2 text-lg font-black text-[#2A1459] shadow-lg active:scale-95 disabled:opacity-60">▶ Play our chat</button>
              <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2 text-lg font-black text-white shadow-lg active:scale-95">Great chat! ⭐ Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
