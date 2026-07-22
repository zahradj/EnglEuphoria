import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Volume2, Loader2, ImageIcon, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';

/**
 * UniversalMediaShell
 *
 * Wraps any slide renderer with a shared media layer:
 *   • Hero image (or skeleton when generating / placeholder when empty)
 *   • 🔊 Listen button bound to slide.voice.audio_url (or TTS fallback on .voice.text)
 *   • 16:9 responsive video player for slide.video_url / slide.video_embed_url
 *
 * Auto-play: when `autoPlayVoice` is true (Playground default) and the slide
 * has voice.text or voice.audio_url, narration plays on slide activation.
 *
 * Source of truth = the slide object. Re-renders happen automatically when the
 * creator's onPatch updates parent state.
 */

export interface SlideMediaShape {
  image_url?: string;
  image_loading?: boolean;
  image_error?: string | null;
  audio_url?: string;
  video_url?: string;
  video_embed_url?: string;
  video_provider?: string;
  voice?: { text?: string; audio_url?: string; autoPlay?: boolean };
}

interface Props {
  slide: SlideMediaShape & Record<string, any>;
  hub: 'playground' | 'academy' | 'success';
  /** Force-default for autoPlay when slide.voice.autoPlay is undefined. */
  autoPlayDefault?: boolean;
  /** Hide the hero image strip (for slides that draw their own image). */
  suppressImage?: boolean;
  /** Optional retry handler shown when image_error is set. */
  onRetryImage?: () => void;
  children: ReactNode;
}

const accent = {
  playground: { btn: 'bg-orange-500 hover:bg-orange-600', ring: 'border-orange-200' },
  academy: { btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'border-indigo-200' },
  success: { btn: 'bg-emerald-600 hover:bg-emerald-700', ring: 'border-emerald-200' },
};

export function UniversalMediaShell({
  slide,
  hub,
  autoPlayDefault,
  suppressImage,
  onRetryImage,
  children,
}: Props) {
  const a = accent[hub];
  const voice = slide?.voice || {};
  const audioUrl: string | undefined = slide?.audio_url || voice.audio_url;
  const ttsText: string | undefined = voice.text;
  const hasAudio = Boolean(audioUrl || ttsText);
  const autoPlay = voice.autoPlay ?? autoPlayDefault ?? (hub === 'playground');

  const { playVoice, isPlaying, stop } = usePlaygroundAudio();
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const playSlideAudio = () => {
    if (audioUrl) {
      try {
        if (audioElRef.current) {
          audioElRef.current.pause();
        }
        const el = new Audio(audioUrl);
        audioElRef.current = el;
        el.onplay = () => setAudioPlaying(true);
        el.onended = () => setAudioPlaying(false);
        el.onerror = () => setAudioPlaying(false);
        el.play().catch(() => setAudioPlaying(false));
      } catch {
        /* noop */
      }
    } else if (ttsText) {
      playVoice(ttsText);
    }
  };

  // Auto-play once per slide change (cleanup on unmount/change)
  const sigKey = `${audioUrl || ''}::${ttsText || ''}`;
  useEffect(() => {
    if (!autoPlay || !hasAudio) return;
    const t = setTimeout(playSlideAudio, 350);
    return () => {
      clearTimeout(t);
      audioElRef.current?.pause();
      audioElRef.current = null;
      setAudioPlaying(false);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigKey, autoPlay]);

  // ── Video block ───────────────────────────────────────────────────────────
  const videoEmbed: string | undefined = slide?.video_embed_url || slide?.video_url;
  const isYouTube = useMemo(
    () => Boolean(videoEmbed && /youtube\.com\/embed\//.test(videoEmbed)),
    [videoEmbed],
  );
  const isMp4 = useMemo(
    () => Boolean(videoEmbed && /\.(mp4|webm|mov)(\?|$)/i.test(videoEmbed)),
    [videoEmbed],
  );

  const showImage = !suppressImage && (slide?.image_url || slide?.image_loading);
  const playing = audioPlaying || isPlaying;

  return (
    <div className="relative w-full">
      {/* Floating audio button */}
      {hasAudio && (
        <button
          type="button"
          onClick={playSlideAudio}
          className={cn(
            'absolute top-2 right-2 z-20 w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center transition-transform active:scale-95',
            a.btn,
          )}
          aria-label="Listen"
          title="🔊 Listen"
        >
          <Volume2 className={cn('w-5 h-5', playing && 'animate-pulse')} />
        </button>
      )}

      {/* Video (takes priority over image when present) */}
      {videoEmbed ? (
        <div className={cn('mb-3 w-full rounded-xl overflow-hidden border bg-black', a.ring)}>
          <div className="relative w-full aspect-video">
            {isYouTube ? (
              <iframe
                src={videoEmbed}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Slide video"
              />
            ) : isMp4 ? (
              <video src={videoEmbed} controls className="absolute inset-0 w-full h-full object-contain bg-black" />
            ) : (
              <iframe
                src={videoEmbed}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="Slide video"
              />
            )}
          </div>
        </div>
      ) : showImage ? (
        <div className="mb-3 mx-auto w-full max-w-sm">
          <div className={cn('relative w-full aspect-video rounded-xl border-2 overflow-hidden bg-muted/40 flex items-center justify-center', a.ring)}>
            {slide.image_url ? (
              <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
            ) : slide.image_loading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-semibold">Generating image…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">Image placeholder</span>
              </div>
            )}
            {slide.image_error && !slide.image_loading && (
              <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-[11px] px-2 py-1 flex items-center justify-between gap-2">
                <span className="truncate">⚠ {slide.image_error}</span>
                {onRetryImage && (
                  <button
                    type="button"
                    onClick={onRetryImage}
                    className="bg-white/20 hover:bg-white/30 rounded px-2 py-0.5 font-bold"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {children}

      {/* Inline player when audio_url exists but no auto-play */}
      {audioUrl && !autoPlay && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Play className="w-3.5 h-3.5" />
          <audio controls src={audioUrl} className="h-8" />
        </div>
      )}
    </div>
  );
}

export default UniversalMediaShell;
