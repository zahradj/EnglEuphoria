// Success PhonicsCard — professional clarity skin for adults (18+).
// Skin language: editorial sans, emerald + slate, IPA shown by default,
// framing: "Read names, addresses, signs, emails with confidence."

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Mic, Briefcase } from 'lucide-react';
import type { PhonicsCardData } from './phonicsCardTypes';
import { highlightWord } from './phonicsCardTypes';
import PhonicsDoStep from './PhonicsDoStep';

interface Props { data: PhonicsCardData; onCorrect?: () => void; onIncorrect?: () => void; }

export default function SuccessPhonicsCard({ data, onCorrect, onIncorrect }: Props) {
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
    <div className="w-full h-full p-6 md:p-10 grid gap-6 content-start bg-[#F0FDFA]">
      <div className="flex items-center justify-between border-b border-[#059669]/20 pb-3">
        <div className="inline-flex items-center gap-2 text-[#059669] text-xs font-semibold tracking-widest uppercase">
          <Briefcase className="w-4 h-4" /> Clarity Module
        </div>
        {data.progression && (
          <div className="text-xs text-slate-600 font-serif italic">
            {data.progression.phase_label} — {data.progression.unit_label}
          </div>
        )}
      </div>

      {/* HEAR — editorial layout, IPA prominent */}
      <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
        <motion.button
          onClick={playPhoneme}
          whileTap={{ scale: 0.97 }}
          animate={playing ? { borderColor: ['#059669', '#10b981', '#059669'] } : {}}
          transition={{ repeat: playing ? Infinity : 0, duration: 0.8 }}
          className="rounded-sm border-2 border-[#059669] bg-white p-8 w-full text-left"
          aria-label={`Play sound ${data.phoneme}`}
        >
          <div className="text-7xl font-serif font-bold text-slate-900 leading-none">{data.grapheme}</div>
          <div className="mt-3 flex items-center gap-2 text-2xl font-serif text-[#059669]">
            <Volume2 className="w-5 h-5" /> {data.phoneme}
          </div>
        </motion.button>

        <div className="space-y-4">
          {data.mouth_hint && (
            <div>
              <div className="text-xs uppercase tracking-wider text-[#059669] font-semibold mb-1">Articulation</div>
              <p className="text-base text-slate-700 leading-relaxed">{data.mouth_hint}</p>
            </div>
          )}
          <div>
            <div className="text-xs uppercase tracking-wider text-[#059669] font-semibold mb-2">In context</div>
            <div className="space-y-1.5">
              {data.examples.slice(0, 3).map((ex, i) => {
                const h = highlightWord(ex.word, ex.highlight);
                return (
                  <button key={i}
                    onClick={() => ex.audio_url && new Audio(ex.audio_url).play().catch(() => {})}
                    className="block w-full text-left rounded-sm border border-slate-200 bg-white px-4 py-2.5 font-serif text-lg hover:border-[#059669] transition-colors">
                    {h.before}<span className="text-[#059669] font-bold">{h.target}</span>{h.after}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SAY + DO */}
      <div className="grid md:grid-cols-[1fr_2fr] gap-4 pt-2 border-t border-[#059669]/20">
        <button
          onClick={playPhoneme}
          className="rounded-sm py-3 px-4 bg-[#059669] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors">
          <Mic className="w-4 h-4" /> Record · Compare
        </button>
        <div className="rounded-sm border border-slate-200 bg-white p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#059669] font-semibold mb-2">Practical drill</div>
          <PhonicsDoStep skin="success" step={data.do_step} onCorrect={onCorrect} onIncorrect={onIncorrect} />
        </div>
      </div>
    </div>
  );
}
