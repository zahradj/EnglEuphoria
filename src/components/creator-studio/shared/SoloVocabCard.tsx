import { Volume2, Image as ImageIcon } from 'lucide-react';
import { HUB_THEME, type Hub } from './hubTheme';
import { playAudioUrlOrTts } from '@/lib/elevenLabsAudio';

/**
 * SoloVocabCard — the gold-standard 1-on-1 vocabulary card.
 * Strict 50/50 split: large image LEFT, massive word + audio button RIGHT.
 */

interface Card {
  word?: string;
  front?: string;
  definition?: string;
  back?: string;
  image_url?: string;
  audio_url?: string;
}

interface Props {
  card: Card;
  hub?: Hub;
  ttsFallback?: string; // played if no audio_url is set
}

export function SoloVocabCard({ card, hub = 'playground', ttsFallback }: Props) {
  const theme = HUB_THEME[hub];
  const word = (card.word || card.front || '').toString();
  const def = (card.definition || card.back || '').toString();
  const audio = card.audio_url;

  const playAudio = () => {
    const text = ttsFallback || word;
    void playAudioUrlOrTts(audio, text);
  };

  const isDark = hub === 'success';

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 overflow-hidden border ${theme.ring} ${theme.corners} ${theme.shadow} ${isDark ? 'bg-slate-800' : 'bg-white'} w-full max-w-5xl mx-auto`}
    >
      {/* LEFT — image */}
      <div className={`aspect-square md:aspect-auto md:min-h-[420px] flex items-center justify-center overflow-hidden ${isDark ? 'bg-slate-900/60' : 'bg-muted/30'}`}>
        {card.image_url ? (
          <img src={card.image_url} alt={word} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
            <ImageIcon className="w-12 h-12" />
            <span className="text-xs font-semibold">Add image to spark recall</span>
          </div>
        )}
      </div>

      {/* RIGHT — word + audio */}
      <div className={`p-10 md:p-14 flex flex-col items-center justify-center gap-6 text-center ${isDark ? 'text-amber-50' : ''}`}>
        <h2 className={`${theme.canvasFont} ${theme.accentText} text-6xl md:text-8xl font-extrabold leading-none tracking-tight drop-shadow-sm break-words`}>
          {word || '—'}
        </h2>
        {def && (
          <p className={`text-lg md:text-xl leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-md`}>
            {def}
          </p>
        )}
        <button
          type="button"
          onClick={playAudio}
          className={`mt-2 inline-flex items-center gap-3 font-bold rounded-full px-7 py-4 text-lg shadow-lg active:scale-95 transition ${theme.accentBtn}`}
        >
          <Volume2 className="w-5 h-5" /> Play Audio
        </button>
      </div>
    </div>
  );
}

export default SoloVocabCard;
