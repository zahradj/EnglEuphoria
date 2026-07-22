/**
 * <VocabSlideSplit /> — premium 50/50 vocabulary slide for Academy & Success hubs.
 * LEFT (50%): word, phonetic spelling, definition, example sentence.
 * RIGHT (50%): the AI-generated vocabulary image as a clean full-panel asset.
 *
 * Playground keeps using <SoloVocabCard /> for its cartoon-card vibe.
 */
import { Volume2, ImageIcon } from 'lucide-react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';

interface VocabSplitProps {
  word: string;
  phonetic_spelling?: string;
  definition?: string;
  example_sentence?: string;
  image_url?: string;
  audio_url?: string;
  /** 'academy' | 'success' — drives typography */
  hub: 'academy' | 'success';
}

export default function VocabSlideSplit({
  word,
  phonetic_spelling,
  definition,
  example_sentence,
  image_url,
  audio_url,
  hub,
}: VocabSplitProps) {
  const isSuccess = hub === 'success';
  const headingFont = isSuccess ? 'font-serif' : 'font-sans';
  const bodyFont = isSuccess ? 'font-serif' : 'font-sans';
  const accent = isSuccess ? 'text-emerald-700' : 'text-indigo-700';
  const surface = isSuccess ? 'bg-stone-50 border-stone-200' : 'bg-white border-indigo-200';
  const btn = isSuccess
    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
    : 'bg-indigo-600 hover:bg-indigo-500 text-white';

  const playAudio = () => {
    if (audio_url) {
      try { new Audio(audio_url).play().catch(() => {}); return; } catch { /* noop */ }
    }
    void playElevenLabs(word);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 overflow-hidden border rounded-2xl shadow-md ${surface} w-full max-w-5xl mx-auto`}>
      {/* LEFT — Text */}
      <div className="p-8 md:p-12 flex flex-col justify-center gap-5">
        <div>
          <h2 className={`${headingFont} ${accent} text-5xl md:text-6xl font-bold leading-tight tracking-tight`}>
            {word}
          </h2>
          {phonetic_spelling && (
            <p className={`${bodyFont} mt-2 text-lg italic text-slate-500`}>/{phonetic_spelling.replace(/^\/|\/$/g, '')}/</p>
          )}
        </div>
        {definition && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Definition</p>
            <p className={`${bodyFont} text-base md:text-lg text-slate-700 leading-relaxed mt-1`}>{definition}</p>
          </div>
        )}
        {example_sentence && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Example</p>
            <p className={`${bodyFont} italic text-base md:text-lg text-slate-600 leading-relaxed mt-1`}>“{example_sentence}”</p>
          </div>
        )}
        <button
          type="button"
          onClick={playAudio}
          className={`mt-2 inline-flex items-center gap-2 self-start rounded-full px-5 py-3 font-semibold shadow ${btn}`}
        >
          <Volume2 className="w-5 h-5" /> Listen
        </button>
      </div>

      {/* RIGHT — Image */}
      <div className={`min-h-[320px] md:min-h-[460px] flex items-center justify-center overflow-hidden ${isSuccess ? 'bg-stone-100' : 'bg-indigo-50/40'}`}>
        {image_url ? (
          <img src={image_url} alt={word} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 p-6">
            <ImageIcon className="w-12 h-12" />
            <span className="text-xs font-semibold uppercase tracking-wider">Image generating…</span>
          </div>
        )}
      </div>
    </div>
  );
}
