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
import { useHubTheme } from './HubTheme';

export interface RolePlaySlide {
  type: 'role_play';
  prompt: string;
  character: string;
  lines: string[];
  scaffold?: string;
}

export function RolePlayGame({ slide }: { slide: RolePlaySlide }) {
  const theme = useHubTheme();
  const [step, setStep] = useState(0);
  const done = step >= slide.lines.length;
  const current = slide.lines[step];

  return (
    <div className="w-full text-center" data-correct={done ? 'true' : undefined}>
      <h2 className="text-2xl font-black text-slate-800">{slide.prompt}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">Role-play with {slide.character}</p>

      <div className="mx-auto mt-5 max-w-md rounded-3xl border-2 bg-white p-6 shadow-sm" style={{ borderColor: `${theme.accent}33` }}>
        {done ? (
          <>
            <div className="text-4xl">🎉</div>
            <p className="mt-2 font-bold text-slate-700">Nice work — you played the whole scene!</p>
          </>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-black uppercase tracking-wide" style={{ color: theme.accent }}>{slide.character} says</span>
            <p className="mt-2 text-xl font-black text-slate-800">&ldquo;{current}&rdquo;</p>
            {slide.scaffold && <p className="mt-3 text-sm italic text-slate-500">Try: &ldquo;{slide.scaffold}&rdquo;</p>}
          </motion.div>
        )}
      </div>

      {!done && (
        <button
          onClick={() => setStep((s) => s + 1)}
          className="mt-5 rounded-2xl px-8 py-3 text-lg font-black text-white shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: theme.accent }}
        >
          🗣️ I said it — next line
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
