// Playground PhonicsCard — claymorphic, mascot-driven, chant rhythm.
// Skin language: rounded-3xl, warm orange/yellow, big mouth shape, Pip cheers.

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Mic, Sparkles } from 'lucide-react';
import type { PhonicsCardData } from './phonicsCardTypes';
import { highlightWord } from './phonicsCardTypes';
import PhonicsDoStep from './PhonicsDoStep';

interface Props { data: PhonicsCardData; onCorrect?: () => void; onIncorrect?: () => void; }

export default function PlaygroundPhonicsCard({ data, onCorrect, onIncorrect }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Auto-play phoneme on mount (Hear beat).
    if (data.phoneme_audio_url) {
      const a = new Audio(data.phoneme_audio_url);
      audioRef.current = a;
      a.play().catch(() => {});
      a.onplay = () => setPlaying(true);
      a.onended = () => setPlaying(false);
    }
    return () => { audioRef.current?.pause(); };
  }, [data.phoneme_audio_url]);

  const playPhoneme = () => {
    if (!data.phoneme_audio_url) return;
    const a = new Audio(data.phoneme_audio_url);
    a.play().catch(() => {});
    a.onplay = () => setPlaying(true);
    a.onended = () => setPlaying(false);
  };

  return (
    <div className="w-full h-full p-6 md:p-10 grid gap-6 content-center"
         style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEFBDD)' }}>
      {data.progression && (
        <div className="flex items-center justify-between text-sm font-bold text-[#92400E]">
          <span>🎵 {data.progression.phase_label}</span>
          <span>{data.progression.unit_label}</span>
        </div>
      )}

      {/* HEAR — giant phoneme bubble */}
      <motion.button
        onClick={playPhoneme}
        whileTap={{ scale: 0.92 }}
        animate={playing ? { scale: [1, 1.08, 1] } : {}}
        transition={{ repeat: playing ? Infinity : 0, duration: 0.6 }}
        className="mx-auto rounded-full flex items-center justify-center shadow-[0_12px_0_rgba(0,0,0,0.08)]"
        style={{ width: 220, height: 220, background: 'linear-gradient(135deg, #FE6A2F, #F59E0B)' }}
        aria-label={`Play sound ${data.phoneme}`}
      >
        <div className="text-center text-white">
          <div className="text-7xl font-black leading-none">{data.grapheme}</div>
          <div className="mt-2 flex items-center justify-center gap-2 text-lg font-bold opacity-90">
            <Volume2 className="w-5 h-5" /> {data.phoneme}
          </div>
        </div>
      </motion.button>

      {data.mouth_hint && (
        <p className="text-center text-lg font-bold text-[#92400E]">👄 {data.mouth_hint}</p>
      )}

      {/* SEE — example words with highlighted grapheme */}
      <div className="grid grid-cols-3 gap-3">
        {data.examples.slice(0, 3).map((ex, i) => {
          const h = highlightWord(ex.word, ex.highlight);
          return (
            <button key={i}
              onClick={() => ex.audio_url && new Audio(ex.audio_url).play().catch(() => {})}
              className="rounded-3xl bg-white p-3 shadow-[0_6px_0_rgba(254,106,47,0.18)] active:translate-y-1 transition-transform">
              {ex.image_url && <img src={ex.image_url} alt={ex.word} className="w-full h-24 object-contain mb-2" />}
              <div className="text-center text-2xl font-black text-[#1A1A2E]">
                {h.before}<span className="text-[#FE6A2F] underline decoration-wavy decoration-2">{h.target}</span>{h.after}
              </div>
            </button>
          );
        })}
      </div>

      {/* SAY + DO */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={playPhoneme}
          className="rounded-3xl py-4 px-6 bg-white text-[#FE6A2F] font-black text-lg flex items-center justify-center gap-2 shadow-[0_6px_0_rgba(254,106,47,0.18)]">
          <Mic className="w-6 h-6" /> Say it like Pip!
        </button>
        <div className="rounded-3xl bg-white p-4 shadow-[0_6px_0_rgba(254,106,47,0.18)]">
          <div className="text-xs font-bold text-[#92400E] mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> YOUR TURN
          </div>
          <PhonicsDoStep skin="playground" step={data.do_step} onCorrect={onCorrect} onIncorrect={onIncorrect} />
        </div>
      </div>
    </div>
  );
}
