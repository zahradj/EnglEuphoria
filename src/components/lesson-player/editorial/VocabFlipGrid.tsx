import React, { useState } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { BookOpen, Volume2 } from 'lucide-react';
import { useSlideHub } from '../SlideHubContext';

interface VocabEntry {
  word: string;
  definition?: string;
  example_sentence?: string;
  image_url?: string;
  emoji?: string;
}

const normalize = (raw: any): VocabEntry => {
  if (typeof raw === 'string') return { word: raw };
  return {
    word: raw?.word || raw?.term || raw?.title || '',
    definition: raw?.definition || raw?.meaning || raw?.translation,
    example_sentence: raw?.example_sentence || raw?.sentence || raw?.example,
    image_url: raw?.image_url || raw?.imageUrl || raw?.thumbnail_url || raw?.picture_url,
    emoji: raw?.emoji,
  };
};

export default function VocabFlipGrid({ slide }: { slide: any }) {
  const { accent, accentSoft } = useSlideHub();
  const payload = slide?.interactive_data || slide?.content || {};
  const list: any[] = payload.words || payload.vocabulary || payload.vocab_list || payload.items || [];
  const entries: VocabEntry[] = list.map(normalize).filter((e) => e.word).slice(0, 6);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const speak = (text: string) => {
    void playElevenLabs(text);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">{slide.title || 'Vocabulary'}</h2>
        <p className="text-slate-500">No vocabulary items provided.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BookOpen className="w-7 h-7" style={{ color: accent }} />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{slide.title || 'Vocabulary'}</h2>
      </div>
      {slide.description && <p className="text-slate-600 text-sm">{slide.description}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {entries.map((entry, i) => {
          const isFlipped = !!flipped[i];
          return (
            <div key={i} className="perspective-1000 h-48 cursor-pointer" onClick={() => setFlipped((p) => ({ ...p, [i]: !p[i] }))}>
              <div
                className="relative w-full h-full preserve-3d transition-transform duration-500"
                style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 backface-hidden rounded-xl border-2 flex flex-col items-center justify-center gap-2 p-4 bg-white"
                  style={{ borderColor: accent, boxShadow: `0 6px 20px ${accent}22` }}
                >
                  {entry.image_url ? (
                    <img src={entry.image_url} alt={entry.word} className="h-20 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="text-5xl">{entry.emoji || '📘'}</div>
                  )}
                  <div className="text-xl font-bold text-slate-900 text-center">{entry.word}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(entry.word); }}
                    className="absolute bottom-2 right-2 p-1.5 rounded-full hover:bg-slate-100"
                    aria-label="Pronounce"
                  >
                    <Volume2 className="w-4 h-4" style={{ color: accent }} />
                  </button>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 flex flex-col justify-center gap-2 p-4 text-slate-900"
                  style={{ borderColor: accent, background: accentSoft }}
                >
                  <div className="text-sm font-bold uppercase tracking-wide" style={{ color: accent }}>{entry.word}</div>
                  {entry.definition && <p className="text-sm leading-snug text-slate-800">{entry.definition}</p>}
                  {entry.example_sentence && (
                    <p className="text-xs italic text-slate-600 border-l-2 pl-2" style={{ borderColor: accent }}>
                      "{entry.example_sentence}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 mt-1">Tap any card to flip</p>
    </div>
  );
}
