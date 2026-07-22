// PhonicsDoStep — the "Do" beat. Renders one of five micro-interactions,
// styled to match the host PhonicsCard skin.
//
// Activities (all also exposed as standalone slide activity types):
//   • phoneme_isolation  — tap the picture that starts with the target sound
//   • blending_animation — watch letters slide together, then tap PLAY
//   • minimal_pair_tap   — tap the word you hear (e.g. ship vs sheep)
//   • grapheme_hunt      — tap every occurrence of the target grapheme in a sentence
//   • decoding_probe     — say each word; pseudoword vs real word

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Volume2 } from 'lucide-react';
import type { PhonicsDoStep as Step } from './phonicsCardTypes';

type Skin = 'playground' | 'academy' | 'success';
interface Props { skin: Skin; step?: Step; onCorrect?: () => void; onIncorrect?: () => void; }

const ACCENT: Record<Skin, string> = {
  playground: '#FE6A2F',
  academy: '#6B21A8',
  success: '#059669',
};

export default function PhonicsDoStep({ skin, step, onCorrect, onIncorrect }: Props) {
  if (!step) {
    return <p className="text-sm text-slate-500">Repeat the sound after the audio.</p>;
  }
  switch (step.kind) {
    case 'phoneme_isolation':
      return <PhonemeIsolation skin={skin} step={step} onCorrect={onCorrect} onIncorrect={onIncorrect} />;
    case 'blending_animation':
      return <BlendingAnimation skin={skin} step={step} onCorrect={onCorrect} />;
    case 'minimal_pair_tap':
      return <MinimalPairTap skin={skin} step={step} onCorrect={onCorrect} onIncorrect={onIncorrect} />;
    case 'grapheme_hunt':
      return <GraphemeHunt skin={skin} step={step} onCorrect={onCorrect} onIncorrect={onIncorrect} />;
    case 'decoding_probe':
      return <DecodingProbe skin={skin} step={step} onCorrect={onCorrect} />;
    default:
      return null;
  }
}

/* ─── 1. phoneme_isolation ────────────────────────────────────────── */
function PhonemeIsolation({ skin, step, onCorrect, onIncorrect }: any) {
  const [picked, setPicked] = useState<number | null>(null);
  const accent = ACCENT[skin as Skin];
  return (
    <div>
      <p className="text-sm text-slate-700 mb-2">Tap the picture that starts with this sound.</p>
      <div className="grid grid-cols-3 gap-2">
        {step.pictures.map((p: any, i: number) => {
          const isPicked = picked === i;
          const correct = p.starts_with_target;
          return (
            <button key={i} onClick={() => {
                if (picked !== null) return;
                setPicked(i);
                if (correct) onCorrect?.(); else onIncorrect?.();
              }}
              className="aspect-square rounded-xl border-2 bg-white p-2 transition-all"
              style={{ borderColor: isPicked ? accent : '#e5e7eb' }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.word} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl font-bold">{p.word}</span>
              )}
              {isPicked && (
                <div className="absolute" style={{ color: accent }}>
                  {correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 2. blending_animation ───────────────────────────────────────── */
function BlendingAnimation({ skin, step, onCorrect }: any) {
  const [stage, setStage] = useState(0); // 0=separated, 1=joining, 2=joined
  const accent = ACCENT[skin as Skin];
  const play = () => {
    setStage(1);
    setTimeout(() => {
      setStage(2);
      if (step.word_audio_url) new Audio(step.word_audio_url).play().catch(() => {});
      onCorrect?.();
    }, 700);
  };
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 min-h-[64px]">
        {stage < 2 ? (
          step.letters.map((l: string, i: number) => (
            <motion.span key={i}
              animate={stage === 1 ? { x: -i * 14 } : {}}
              transition={{ duration: 0.6 }}
              className="text-4xl font-black"
              style={{ color: accent }}>{l}</motion.span>
          ))
        ) : (
          <span className="text-5xl font-black" style={{ color: accent }}>{step.word}</span>
        )}
      </div>
      <button onClick={play} className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold" style={{ background: accent }}>
        <Volume2 className="w-4 h-4" /> Blend it
      </button>
    </div>
  );
}

/* ─── 3. minimal_pair_tap ─────────────────────────────────────────── */
function MinimalPairTap({ skin, step, onCorrect, onIncorrect }: any) {
  const [picked, setPicked] = useState<string | null>(null);
  const accent = ACCENT[skin as Skin];
  const playTarget = () => step.audio_url && new Audio(step.audio_url).play().catch(() => {});
  return (
    <div>
      <button onClick={playTarget}
        className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-bold"
        style={{ background: accent }}>
        <Volume2 className="w-3.5 h-3.5" /> Listen
      </button>
      <p className="text-sm text-slate-700 mb-2">Tap the word you hear.</p>
      <div className="grid grid-cols-2 gap-2">
        {step.pair.map((w: string) => {
          const isPicked = picked === w;
          const isCorrect = w === step.correct;
          return (
            <button key={w}
              onClick={() => {
                if (picked) return;
                setPicked(w);
                if (isCorrect) onCorrect?.(); else onIncorrect?.();
              }}
              className="rounded-xl border-2 bg-white px-4 py-3 text-xl font-bold transition-all"
              style={{
                borderColor: isPicked ? (isCorrect ? accent : '#dc2626') : '#e5e7eb',
                color: isPicked && !isCorrect ? '#dc2626' : '#0f172a',
              }}>
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 4. grapheme_hunt ────────────────────────────────────────────── */
function GraphemeHunt({ skin, step, onCorrect, onIncorrect }: any) {
  const accent = ACCENT[skin as Skin];
  const tokens = useMemo(() => {
    // Split sentence into words preserving spaces; mark occurrences of target_grapheme.
    return step.sentence.split(/(\s+)/);
  }, [step.sentence]);
  const [hits, setHits] = useState<Record<number, boolean>>({});
  const targetCount = tokens.reduce((n: number, w: string) => n + ((w.toLowerCase().match(new RegExp(step.target_grapheme.toLowerCase(), 'g')) || []).length ? 1 : 0), 0);
  const correctSoFar = Object.entries(hits).filter(([i, v]) => v && tokens[+i].toLowerCase().includes(step.target_grapheme.toLowerCase())).length;
  return (
    <div>
      <p className="text-sm text-slate-700 mb-2">
        Find every <span className="font-mono font-bold" style={{ color: accent }}>{step.target_grapheme}</span>.
      </p>
      <div className="text-lg leading-relaxed">
        {tokens.map((tok: string, i: number) => {
          if (!tok.trim()) return <span key={i}>{tok}</span>;
          const has = tok.toLowerCase().includes(step.target_grapheme.toLowerCase());
          const picked = hits[i];
          return (
            <button key={i} onClick={() => {
                if (picked !== undefined) return;
                setHits((h) => ({ ...h, [i]: true }));
                if (has) {
                  if (correctSoFar + 1 >= targetCount) onCorrect?.();
                } else {
                  onIncorrect?.();
                }
              }}
              className="px-1 rounded transition-colors"
              style={{
                background: picked ? (has ? accent : '#fee2e2') : 'transparent',
                color: picked && has ? 'white' : '#0f172a',
              }}>{tok}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 5. decoding_probe ───────────────────────────────────────────── */
function DecodingProbe({ skin, step, onCorrect }: any) {
  const accent = ACCENT[skin as Skin];
  const [idx, setIdx] = useState(0);
  const item = step.items[idx];
  if (!item) {
    return <p className="text-sm" style={{ color: accent }}>✓ Decoded all {step.items.length}.</p>;
  }
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {idx + 1} / {step.items.length} · {item.is_pseudoword ? 'Decode the made-up word' : 'Decode the real word'}
      </p>
      <div className="text-4xl font-black tracking-wide mb-3" style={{ color: accent }}>{item.word}</div>
      <button onClick={() => { setIdx(idx + 1); onCorrect?.(); }}
        className="px-4 py-2 rounded-lg text-white text-sm font-bold"
        style={{ background: accent }}>
        I said it ▶
      </button>
    </div>
  );
}
