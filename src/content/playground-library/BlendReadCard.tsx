import { motion, useReducedMotion } from 'framer-motion';
import { cueSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * Blend & Read (owner, 2026-10-12: "in A1, not just CVC words — they need to learn to read full sentences").
 * After a word is blended and found, it flies into a sentence from the lesson's story; the child reads the whole
 * sentence aloud (🔊 = the model, recorded voices only) and taps "I read it!". Shared by every Blend It! world
 * (Sound Train, Frog Hop, Slide Down, Gumball). Mechanic: Teach Your Monster to Read moves from blending words to
 * "ready to read sentences"; Jolly Phonics Step 2 "Words and Sentences". Better: the sentence is from the child's
 * own story, the new word glows inside it, and every word can be tapped to hear it.
 */
export function BlendReadCard({ word, sentence, onDone, disabled }: { word: string; sentence: string; onDone: () => void; disabled?: boolean }) {
  const reduce = useReducedMotion();
  const words = sentence.split(/\s+/);
  const isTarget = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '') === word.toLowerCase();
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/35 px-[4cqw]" style={{ containerType: 'size' }}>
      <motion.div className="w-full max-w-[92cqw] rounded-[4cqh] border-[0.8cqh] border-white bg-gradient-to-b from-amber-50 to-orange-100 px-[3cqw] py-[3cqh] text-center shadow-2xl"
        initial={reduce ? false : { scale: 0.7, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
        <div className="mb-[1.5cqh] font-black uppercase tracking-widest text-orange-600" style={{ fontSize: 'clamp(0.8rem, 3.4cqh, 1.3rem)' }}>📖 Now read it!</div>
        <div className="flex flex-wrap justify-center gap-x-[1.6cqw] gap-y-[1cqh] font-black leading-tight text-[#3b2410]" style={{ fontSize: 'clamp(1.4rem, 9cqh, 3.6rem)' }}>
          {words.map((w, i) => (
            <motion.button key={i} type="button" onClick={() => cueSpeak(w.replace(/[^A-Za-z']/g, ''), 'teacher')}
              className={`rounded-[1.5cqh] px-[0.6cqw] ${isTarget(w) ? 'bg-yellow-300 text-[#7c2d12] shadow-[0_0.6cqh_0_#eab308]' : ''}`}
              initial={reduce || !isTarget(w) ? false : { y: -80, scale: 1.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.25 }}>
              {w}
            </motion.button>
          ))}
        </div>
        <div className="mt-[3cqh] flex items-center justify-center gap-[2cqw]">
          <button type="button" onClick={() => cueSpeak(sentence, 'teacher')} aria-label="Hear it"
            className="grid h-[11cqh] w-[11cqh] place-items-center rounded-full bg-white text-[5cqh] shadow-lg ring-2 ring-orange-200 active:scale-95">🔊</button>
          <button type="button" disabled={disabled} onClick={() => { sfx.match(); onDone(); }}
            className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[5cqw] py-[2cqh] font-black text-white shadow-xl active:scale-95 disabled:opacity-50"
            style={{ fontSize: 'clamp(1rem, 5cqh, 2rem)' }}>✓ I read it!</button>
        </div>
      </motion.div>
    </div>
  );
}
