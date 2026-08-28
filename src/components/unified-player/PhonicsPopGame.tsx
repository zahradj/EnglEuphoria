/**
 * "Pop the sound" — a real, widely-used phonics game mechanic (ICT Games'
 * Phonics Pop, Twinkl's Bubble Pop Game): a scatter of floating bubbles,
 * some containing a picture whose word has the target sound and some not;
 * the student pops (taps) only the matching ones. Researched via web
 * search rather than invented from scratch — see the commit message for
 * sources. Built fresh here (not in playground-games.tsx) since floating/
 * popping bubbles are a distinct interaction from anything already there.
 *
 * The isolated phoneme itself (the sound being practiced) is file-only —
 * no live-TTS fallback, per this project's hard phonics-audio rule (a live
 * TTS engine mispronounces an isolated phoneme unpredictably). Each
 * bubble's own WORD is a normal whole word, safe to speak through the
 * usual TTS-fallback voice hook.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';
import { useHubTheme } from './HubTheme';

export interface PhonicsPopSlide {
  type: 'phonics_pop';
  sound: string;
  /** File-only replay of the isolated sound — omit if no recorded clip exists yet (never falls back to TTS). */
  soundAudio?: string;
  instruction?: string;
  bubbles: { label: string; emoji?: string; image?: string; matches: boolean }[];
}

/** A gentle, non-repeating-looking float — each bubble gets its own period/offset from its index. */
function floatFor(i: number) {
  const duration = 2.4 + (i % 3) * 0.4;
  const distance = 6 + (i % 2) * 4;
  return { animate: { y: [0, -distance, 0] }, transition: { duration, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.15 } };
}

export function PhonicsPopGame({ slide }: { slide: PhonicsPopSlide }) {
  const theme = useHubTheme();
  const { playVoice, playCorrect, playWrong } = usePlaygroundAudio();
  const [popped, setPopped] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const targets = slide.bubbles.filter((b) => b.matches);
  const done = targets.length > 0 && targets.every((t) => popped.includes(t.label));

  useEffect(() => {
    if (done) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [theme.accent, theme.accent2, '#ffffff'] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function tap(b: PhonicsPopSlide['bubbles'][number]) {
    if (popped.includes(b.label)) return;
    if (b.matches) {
      setPopped((p) => [...p, b.label]);
      playCorrect();
      playVoice(b.label);
    } else {
      playWrong();
      setWrong(b.label);
      setTimeout(() => setWrong(null), 400);
    }
  }

  return (
    <div className="w-full text-center" data-correct={done ? 'true' : undefined}>
      <h2 className="text-2xl font-black sm:text-3xl" style={{ color: theme.accent }}>
        🫧 Pop the /{slide.sound}/ sound!
      </h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        {slide.instruction || `Tap every bubble whose word has the /${slide.sound}/ sound.`}
      </p>
      {slide.soundAudio && (
        <button
          type="button"
          onClick={() => new Audio(slide.soundAudio).play().catch(() => {})}
          aria-label="Hear the sound"
          className="mx-auto mt-3 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: theme.accent }}
        >
          🔊
        </button>
      )}

      <div className="relative mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-5 py-4">
        {slide.bubbles.map((b, i) => {
          const isPopped = popped.includes(b.label);
          const float = floatFor(i);
          return (
            <motion.button
              key={b.label}
              type="button"
              onClick={() => tap(b)}
              disabled={isPopped}
              animate={isPopped ? { scale: 1 } : (wrong === b.label ? { x: [-6, 6, -6, 6, 0] } : float.animate)}
              transition={isPopped ? undefined : (wrong === b.label ? { duration: 0.4 } : float.transition)}
              whileTap={{ scale: 0.9 }}
              className="relative grid h-24 w-24 flex-shrink-0 place-items-center rounded-full text-3xl shadow-xl sm:h-28 sm:w-28"
              style={{
                background: isPopped
                  ? 'linear-gradient(160deg, #bbf7d0, #4ade80)'
                  : 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(255,255,255,0.35) 45%, var(--bubble-tint) 100%)',
                border: '3px solid rgba(255,255,255,0.7)',
                ['--bubble-tint' as string]: `${theme.accent}55`,
              }}
            >
              {b.image ? (
                <img src={b.image} alt={b.label} className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16" />
              ) : (
                <span>{b.emoji ?? '🔵'}</span>
              )}
              {isPopped && <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-green-500 text-sm text-white shadow">✓</span>}
            </motion.button>
          );
        })}
      </div>

      {done && <p className="mt-2 font-bold text-green-600">🎉 You found every /{slide.sound}/ sound!</p>}
    </div>
  );
}
