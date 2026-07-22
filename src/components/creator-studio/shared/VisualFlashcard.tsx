import { useEffect, useRef } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { Volume2, Image as ImageIcon } from 'lucide-react';
import { HUB_THEME, type Hub } from './hubTheme';

/**
 * VisualFlashcard — single-source-of-truth Pre-A1/A1 vocabulary card.
 * Strict 50/50 split. Owns its OWN image — never wrap in a media shell that
 * also renders a hero image, otherwise duplicates appear.
 *
 * Auto-plays audio (or TTS fallback) on mount so non-readers know what to do.
 */

interface Slide {
  word?: string;
  front?: string;
  definition?: string;
  back?: string;
  image_url?: string;
  audio_url?: string;
  voice?: { text?: string; audio_url?: string; autoPlay?: boolean };
}

interface Props {
  slide: Slide;
  hub?: Hub;
  autoPlay?: boolean;
}

export function VisualFlashcard({ slide, hub = 'playground', autoPlay = true }: Props) {
  const theme = HUB_THEME[hub];
  const word = (slide.word || slide.front || '').toString();
  const def = (slide.definition || slide.back || '').toString();
  const audio = slide.audio_url || slide.voice?.audio_url;
  const tts = slide.voice?.text || word;
  const isDark = hub === 'success';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = () => {
    if (audio) {
      try {
        audioRef.current?.pause();
        const a = new Audio(audio);
        audioRef.current = a;
        a.play().catch(() => {});
        return;
      } catch { /* noop */ }
    }
    if (!tts) return;
    void playElevenLabs(tts);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(play, 350);
    return () => {
      clearTimeout(t);
      audioRef.current?.pause();
      audioRef.current = null;
      stopElevenLabs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio, tts, autoPlay]);

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 overflow-hidden border ${theme.ring} ${theme.corners} ${theme.shadow} ${isDark ? 'bg-slate-800' : 'bg-white'} w-full max-w-5xl mx-auto`}
    >
      {/* LEFT — single, owned image */}
      <div className={`aspect-square md:aspect-auto md:min-h-[420px] flex items-center justify-center overflow-hidden ${isDark ? 'bg-slate-900/60' : 'bg-muted/30'}`}>
        {slide.image_url ? (
          <img src={slide.image_url} alt={word} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
            <ImageIcon className="w-12 h-12" />
            <span className="text-xs font-semibold">Add an image to spark recall</span>
          </div>
        )}
      </div>

      {/* RIGHT — bold word + audio */}
      <div className={`p-10 md:p-14 flex flex-col items-center justify-center gap-6 text-center ${isDark ? 'text-amber-50' : ''}`}>
        <h2
          className={`${theme.canvasFont} ${theme.accentText} text-6xl md:text-8xl font-extrabold leading-none tracking-tight drop-shadow-sm break-words`}
          style={{ fontFamily: 'Fredoka, Poppins, system-ui, sans-serif' }}
        >
          {word || '—'}
        </h2>
        {def && (
          <p className={`text-lg md:text-xl leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-md`}>
            {def}
          </p>
        )}
        <button
          type="button"
          onClick={play}
          className={`mt-2 inline-flex items-center gap-3 font-bold rounded-full px-7 py-4 text-lg shadow-lg active:scale-95 transition ${theme.accentBtn}`}
        >
          <Volume2 className="w-5 h-5" /> Play
        </button>
      </div>
    </div>
  );
}

export default VisualFlashcard;
