/**
 * VideoLessonPhase — full-bleed cartoon player for the Video Lesson track.
 * Phase 3 wiring: renders a <video> element, plays once, auto-advances.
 * No text overlay (Pre-A1 safe). Falls back to a Replay button.
 */
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

interface Props {
  videoUrl: string;
  posterUrl?: string;
  onComplete: () => void;
}

export function VideoLessonPhase({ videoUrl, posterUrl, onComplete }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {
      /* autoplay blocked — user taps Play */
    });
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        No video is attached to this lesson yet.
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-black">
      <video
        ref={ref}
        src={videoUrl}
        poster={posterUrl}
        playsInline
        controls={false}
        onEnded={() => setEnded(true)}
        className="max-h-full max-w-full"
      />
      {ended && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              v.currentTime = 0;
              setEnded(false);
              void v.play();
            }}
            className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-black shadow-lg hover:bg-white"
            aria-label="Replay"
          >
            <RotateCcw className="h-4 w-4" /> Again
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
            aria-label="Continue"
          >
            <Play className="h-4 w-4" /> Next
          </button>
        </div>
      )}
    </div>
  );
}
