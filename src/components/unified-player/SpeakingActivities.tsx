/**
 * Speaking-production activities (role_play, speaking_mission) — the
 * highest-value gap found researching teen/adult engagement: both age
 * groups respond far more to real production tasks than passive recall,
 * and neither had a component in the reused Playground game library
 * (those only exist as PPP slide types in AcademyDemo.tsx today). Built
 * fresh here rather than added to playground-games.tsx since there's no
 * existing Playground caller to stay compatible with.
 *
 * No speech-recognition dependency: the student reads/says the line out
 * loud themselves and self-confirms with "I said it" / "Done" — consistent
 * with this project's no-live-audio-dependency rule (nothing here calls an
 * external TTS/STT API), and with expert-teacher-activity-architect's rule
 * that speaking activities need a scaffold, not just an open prompt.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';
import { useHubTheme } from './HubTheme';

export interface RolePlaySlide {
  type: 'role_play';
  prompt: string;
  character: string;
  lines: string[];
  scaffold?: string;
}

interface Turn {
  speaker: 'character' | 'you';
  text: string;
}

export function RolePlayGame({ slide }: { slide: RolePlaySlide }) {
  const theme = useHubTheme();
  const { playVoice } = usePlaygroundAudio();
  // Alternates character-line / your-turn so the exchange plays out as a
  // real back-and-forth conversation, not just a cycle through the
  // character's lines with a static hint repeated every time.
  const turns: Turn[] = slide.lines.flatMap((line) => [
    { speaker: 'character', text: line },
    { speaker: 'you', text: slide.scaffold || '(say something back)' },
  ]);
  const [revealed, setRevealed] = useState(1);
  const done = revealed >= turns.length;
  const nextTurn = turns[revealed];

  return (
    <div className="w-full text-center" data-correct={done ? 'true' : undefined}>
      <p className="mb-3">
        <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow backdrop-blur-sm">
          {slide.prompt} · Role-play with {slide.character}
        </span>
      </p>

      <div className="mx-auto flex max-w-md flex-col gap-2 text-left">
        {turns.slice(0, revealed).map((turn, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2 ${turn.speaker === 'you' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm font-bold shadow-xl ${
                turn.speaker === 'you' ? 'rounded-br-md text-white' : 'rounded-bl-md bg-white text-slate-800'
              }`}
              style={turn.speaker === 'you' ? { backgroundColor: theme.accent } : undefined}
            >
              <div className="mb-0.5 text-[10px] font-black uppercase tracking-wide opacity-70">
                {turn.speaker === 'you' ? 'You' : slide.character}
              </div>
              &ldquo;{turn.text}&rdquo;
            </div>
            {turn.speaker === 'character' && (
              <button
                type="button"
                onClick={() => playVoice(turn.text)}
                aria-label="Hear this line"
                className="mb-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-white/90 text-xs shadow"
              >
                🔊
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {done ? (
        <p className="mt-5 rounded-full bg-black/30 px-4 py-1.5 text-sm font-bold text-white shadow backdrop-blur-sm inline-block">🎉 Nice work — you played the whole scene!</p>
      ) : (
        <button
          onClick={() => setRevealed((r) => r + 1)}
          className="mt-5 rounded-2xl px-8 py-3 text-lg font-black text-white shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: theme.accent }}
        >
          {nextTurn?.speaker === 'you' ? '🗣️ I said it' : `Next: ${slide.character} replies →`}
        </button>
      )}
    </div>
  );
}

export interface SpeakingMissionSlide {
  type: 'speaking_mission';
  prompt: string;
  scaffold?: string;
}

export function SpeakingMissionGame({ slide }: { slide: SpeakingMissionSlide }) {
  const theme = useHubTheme();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="w-full text-center" data-correct={done ? 'true' : undefined}>
      <h2 className="text-2xl font-black text-slate-800">🎤 Speaking mission</h2>
      <div className="mx-auto mt-4 max-w-md rounded-3xl border-2 bg-white p-6 shadow-sm" style={{ borderColor: `${theme.accent}33` }}>
        <p className="text-lg font-bold text-slate-800">{slide.prompt}</p>
        {slide.scaffold && <p className="mt-2 text-sm italic text-slate-500">Try: &ldquo;{slide.scaffold}&rdquo;</p>}
      </div>

      {!ready ? (
        <button
          onClick={() => setReady(true)}
          className="mt-5 rounded-2xl px-8 py-3 text-lg font-black text-white shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: theme.accent }}
        >
          I'm ready to speak
        </button>
      ) : !done ? (
        <>
          <p className="mt-5 text-sm font-bold text-slate-500">Say your answer out loud now.</p>
          <button
            onClick={() => setDone(true)}
            className="mt-3 rounded-2xl px-8 py-3 text-lg font-black text-white shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: theme.accent }}
          >
            ✅ Done speaking
          </button>
        </>
      ) : (
        <p className="mt-5 font-bold text-green-600">🎉 Nice work!</p>
      )}
    </div>
  );
}

/**
 * Listen & Repeat — matches ACTIVITY_CATALOG's 'echo'/'shadowing' types
 * (Hear it · say it back). No component existed for either in
 * playground-games.tsx, so built fresh here on the same pattern: play the
 * target audio via the shared usePlaygroundAudio hook (static cache with
 * live ElevenLabs fallback, same as every other Playground game), then
 * self-confirm since there's no speech-recognition dependency.
 */
export interface ListenRepeatSlide {
  type: 'echo' | 'shadowing';
  prompt?: string;
  word?: string;
  sentence?: string;
}

export function ListenRepeatGame({ slide }: { slide: ListenRepeatSlide }) {
  const theme = useHubTheme();
  const { playVoice } = usePlaygroundAudio();
  const [heard, setHeard] = useState(false);
  const [done, setDone] = useState(false);
  const target = slide.sentence || slide.word || '';

  const hear = () => {
    playVoice(target);
    setHeard(true);
  };

  return (
    <div className="w-full text-center" data-correct={done ? 'true' : undefined}>
      <h2 className="text-2xl font-black text-slate-800">🔊 Listen & repeat</h2>
      {slide.prompt && <p className="mt-1 text-sm font-semibold text-slate-500">{slide.prompt}</p>}

      <div className="mx-auto mt-5 max-w-md rounded-3xl border-2 bg-white p-6 shadow-sm" style={{ borderColor: `${theme.accent}33` }}>
        <p className="text-2xl font-black" style={{ color: theme.accent }}>&ldquo;{target}&rdquo;</p>
        <button
          onClick={hear}
          className="mt-4 rounded-full px-6 py-2.5 text-sm font-black text-white shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: theme.accent }}
        >
          🔊 Hear it
        </button>
      </div>

      {!done ? (
        <button
          onClick={() => setDone(true)}
          disabled={!heard}
          className="mt-5 rounded-2xl px-8 py-3 text-lg font-black text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          style={{ backgroundColor: theme.accent }}
        >
          🗣️ I said it back
        </button>
      ) : (
        <p className="mt-5 font-bold text-green-600">🎉 Nice pronunciation!</p>
      )}
    </div>
  );
}
