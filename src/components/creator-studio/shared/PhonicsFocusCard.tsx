import { useEffect, useRef } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { Volume2 } from 'lucide-react';
import { HUB_THEME, type Hub } from './hubTheme';

/**
 * PhonicsFocusCard — dedicated slide for the Phonics & Phonology layer.
 *
 *  Playground (Synthetic Phonics) → giant grapheme + isolated sound + 3 example words.
 *  Academy / Success (Pronunciation & Intonation) → same shell, reframed for accuracy
 *  ("Executive Pronunciation" copy comes from the AI's `phoneme`/`label` fields).
 *
 * Owns its OWN audio (no `UniversalMediaShell` wrapper) — same no-duplicate
 * pattern as VisualFlashcard.
 */

export interface PhonicsItem {
  word: string;
  image_url?: string;
  audio_url?: string;
  /** Override for ElevenLabs phonetic generation (e.g. "aaah" or SSML <phoneme>). */
  spoken_text?: string;
}

interface PhonicsSlide {
  type?: 'phonics_focus';
  phoneme?: string;        // e.g. "/æ/"
  grapheme?: string;       // e.g. "a" or "Magic e"
  sound_ipa?: string;      // optional explicit IPA
  label?: string;          // optional headline for Academy/Success ("Word Stress")
  /** New canonical schema — array of word objects with image + audio per item. */
  phonics_items?: PhonicsItem[];
  /** Legacy — flat list of example words (still rendered if phonics_items missing). */
  example_words?: string[];
  audio_url?: string;      // isolated sound
  example_audio?: Record<string, string>; // legacy per-word audio map
  voice?: { text?: string; audio_url?: string; autoPlay?: boolean };
}

interface Props {
  slide: PhonicsSlide;
  hub?: Hub;
  autoPlay?: boolean;
}

const HUB_INTRO: Record<Hub, string> = {
  playground: 'Listen to the sound',
  academy: 'Listen and repeat',
  success: 'Executive Pronunciation',
};

/** Normalize legacy example_words[]/example_audio{} into the new PhonicsItem shape. */
function resolveItems(slide: PhonicsSlide): PhonicsItem[] {
  if (Array.isArray(slide.phonics_items) && slide.phonics_items.length > 0) {
    return slide.phonics_items.filter((it) => it && (it.word || '').trim());
  }
  return (slide.example_words || [])
    .filter((w) => (w || '').trim())
    .map((w) => ({ word: w, audio_url: slide.example_audio?.[w] }));
}

export function PhonicsFocusCard({ slide, hub = 'playground', autoPlay = true }: Props) {
  const theme = HUB_THEME[hub];
  const grapheme = (slide.grapheme || slide.phoneme || '—').toString();
  const ipa = (slide.sound_ipa || slide.phoneme || '').toString();
  const items = resolveItems(slide).slice(0, 6);
  const isDark = hub === 'success';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = (text: string, audioUrl?: string) => {
    if (audioUrl) {
      try {
        audioRef.current?.pause();
        const a = new Audio(audioUrl);
        audioRef.current = a;
        a.play().catch(() => {});
        return;
      } catch { /* noop */ }
    }
    if (!text) return;
    void playElevenLabs(text, { speed: 0.8 });
  };

  const playSound = () => speak(slide.voice?.text || ipa || grapheme, slide.audio_url || slide.voice?.audio_url);
  const playItem = (it: PhonicsItem) => speak(it.spoken_text || it.word, it.audio_url);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(playSound, 350);
    return () => {
      clearTimeout(t);
      audioRef.current?.pause();
      audioRef.current = null;
      stopElevenLabs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide.audio_url, slide.phoneme, slide.grapheme, autoPlay]);

  const gridCols = items.length <= 3 ? 'grid-cols-3' : items.length === 4 ? 'grid-cols-4' : 'grid-cols-3 md:grid-cols-' + Math.min(items.length, 6);

  return (
    <div
      className={`overflow-hidden border ${theme.ring} ${theme.corners} ${theme.shadow} ${isDark ? 'bg-slate-800 text-amber-50' : 'bg-white'} w-full max-w-5xl mx-auto p-8 md:p-12`}
    >
      <p className={`text-xs font-bold tracking-widest uppercase mb-4 ${theme.accentText}`}>
        🔊 {slide.label || HUB_INTRO[hub]}
      </p>

      <button
        type="button"
        onClick={playSound}
        className={`w-full flex flex-col items-center justify-center gap-3 rounded-2xl py-10 ${isDark ? 'bg-slate-900/60' : 'bg-muted/30'} active:scale-[0.99] transition`}
      >
        <span
          className={`${theme.canvasFont} ${theme.accentText} font-black leading-none tracking-tight`}
          style={{ fontFamily: 'Fredoka, Poppins, system-ui, sans-serif', fontSize: 'clamp(6rem, 18vw, 14rem)' }}
        >
          {grapheme}
        </span>
        {ipa && ipa !== grapheme && (
          <span className={`text-2xl md:text-3xl italic ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{ipa}</span>
        )}
        <span className={`mt-2 inline-flex items-center gap-2 font-bold rounded-full px-6 py-3 shadow-lg ${theme.accentBtn}`}>
          <Volume2 className="w-5 h-5" /> Play sound
        </span>
      </button>

      {items.length > 0 && (
        <div className="mt-6">
          <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Example words
          </p>
          <div className={`grid ${gridCols} gap-3`}>
            {items.map((it, idx) => (
              <button
                key={`${it.word}-${idx}`}
                type="button"
                onClick={() => playItem(it)}
                className={`group flex flex-col items-center gap-2 rounded-2xl border-2 ${theme.ring} px-3 pt-3 pb-3 hover:scale-[1.02] active:scale-95 transition ${isDark ? 'bg-slate-900/40' : 'bg-white'}`}
              >
                <div className={`w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-muted/40'}`}>
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.word} className="w-full h-full object-cover" />
                  ) : (
                    <span className={`text-3xl font-black ${theme.accentText}`}>{(it.word || '?')[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-extrabold text-base md:text-lg ${isDark ? 'text-amber-50' : 'text-slate-800'}`}>
                    {it.word}
                  </span>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${theme.accentBtn}`}>
                    <Volume2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhonicsFocusCard;
