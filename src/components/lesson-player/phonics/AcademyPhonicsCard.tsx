// Academy PhonicsCard — code-breaker skin for teens (10–17).
// Skin language: sharp rounded-xl, royal purple, "DECODE" framing,
// minimal-pairs-as-puzzles. No nursery vocabulary.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Mic, Zap } from 'lucide-react';
import type { PhonicsCardData } from './phonicsCardTypes';
import { highlightWord } from './phonicsCardTypes';
import PhonicsDoStep from './PhonicsDoStep';

interface Props { data: PhonicsCardData; onCorrect?: () => void; onIncorrect?: () => void; }

export default function AcademyPhonicsCard({ data, onCorrect, onIncorrect }: Props) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (data.phoneme_audio_url) {
      const a = new Audio(data.phoneme_audio_url);
      a.play().catch(() => {});
    }
  }, [data.phoneme_audio_url]);

  const playPhoneme = () => {
    if (!data.phoneme_audio_url) return;
    const a = new Audio(data.phoneme_audio_url);
    a.play().catch(() => {});
    a.onplay = () => setPlaying(true);
    a.onended = () => setPlaying(false);
  };

  return (
    <div className="w-full h-full p-6 md:p-10 grid gap-5 content-start"
         style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#6B21A8] text-white text-xs font-bold tracking-widest">
          <Zap className="w-3.5 h-3.5" /> DECODE LAB
        </div>
        {data.progression && (
          <div className="text-xs text-[#6B21A8] font-mono">
            {data.progression.phase_label} · {data.progression.unit_label}
          </div>
        )}
      </div>

      {/* HEAR — monospace cipher framing */}
      <div className="rounded-xl border-2 border-[#6B21A8]/30 bg-white p-6 grid grid-cols-[auto_1fr] gap-6 items-center">
        <motion.button
          onClick={playPhoneme}
          whileTap={{ scale: 0.95 }}
          animate={playing ? { boxShadow: ['0 0 0 0 rgba(107,33,168,0.4)', '0 0 0 16px rgba(107,33,168,0)'] } : {}}
          transition={{ repeat: playing ? Infinity : 0, duration: 1 }}
          className="rounded-xl flex flex-col items-center justify-center text-white p-6 min-w-[140px]"
          style={{ background: 'linear-gradient(135deg, #6B21A8, #A855F7)' }}
          aria-label={`Play sound ${data.phoneme}`}
        >
          <div className="text-6xl font-black font-mono">{data.grapheme}</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-mono opacity-95">
            <Volume2 className="w-4 h-4" /> {data.phoneme}
          </div>
        </motion.button>

        <div>
          <div className="text-xs uppercase tracking-wider text-[#6B21A8] font-bold mb-1">Cipher key</div>
          <div className="text-sm text-slate-700 mb-3">
            When you see <span className="font-mono font-bold text-[#6B21A8]">{data.grapheme}</span>, decode it as <span className="font-mono font-bold text-[#6B21A8]">{data.phoneme}</span>.
            {data.mouth_hint ? ` ${data.mouth_hint}` : ''}
          </div>
          <div className="flex flex-wrap gap-2">
            {data.examples.slice(0, 3).map((ex, i) => {
              const h = highlightWord(ex.word, ex.highlight);
              return (
                <button key={i}
                  onClick={() => ex.audio_url && new Audio(ex.audio_url).play().catch(() => {})}
                  className="rounded-lg border border-[#6B21A8]/20 bg-[#F5F3FF] px-3 py-2 font-mono text-base hover:bg-[#EDE9FE] transition-colors">
                  {h.before}<span className="text-[#6B21A8] font-black underline">{h.target}</span>{h.after}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SAY + DO */}
      <div className="grid md:grid-cols-[1fr_2fr] gap-4">
        <button
          onClick={playPhoneme}
          className="rounded-xl py-3 px-4 bg-[#6B21A8] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#581c87] transition-colors">
          <Mic className="w-4 h-4" /> RECORD & MATCH
        </button>
        <div className="rounded-xl border-2 border-[#6B21A8]/30 bg-white p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#6B21A8] font-bold mb-2">Crack the code</div>
          <PhonicsDoStep skin="academy" step={data.do_step} onCorrect={onCorrect} onIncorrect={onIncorrect} />
        </div>
      </div>
    </div>
  );
}
