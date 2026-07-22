import React, { useState } from 'react';
import { Video, VideoOff } from 'lucide-react';
import { useSlideHub } from '../SlideHubContext';

interface VideoSlideProps {
  slide: any;
}

function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  if (/^[\w-]{11}$/.test(input.trim())) return input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/v\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const pat of patterns) {
    const match = input.match(pat);
    if (match) return match[1];
  }
  return null;
}

function extractVimeoId(input: string): string | null {
  if (!input) return null;
  const m = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

const PLAYER_WRAPPER =
  'w-full max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden bg-black shadow-md';

export default function VideoSlide({ slide }: VideoSlideProps) {
  const { accent, accentSoft } = useSlideHub();
  const [hasError, setHasError] = useState(false);

  if (!slide) return null;

  const payload = slide?.interactive_data || slide?.content || {};
  const videoUrl: string =
    slide?.video_url || payload.video_url || payload.youtube_url || payload.url || '';
  const videoId: string =
    slide?.video_id || payload.video_id || extractYouTubeId(videoUrl) || '';
  const vimeoId = !videoId ? extractVimeoId(videoUrl) : '';
  const isMp4 = !videoId && !vimeoId && /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl);

  const takeaways: string[] = Array.isArray(payload.key_takeaways) ? payload.key_takeaways : [];
  const instructions = payload.video_instructions || slide?.description || '';

  const showFallback = hasError || (!videoId && !vimeoId && !isMp4);

  const renderFallback = () => (
    <div
      className={`${PLAYER_WRAPPER} flex flex-col items-center justify-center gap-4 px-6`}
      style={{ background: accentSoft }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'white' }}
      >
        <VideoOff className="w-10 h-10" style={{ color: accent }} />
      </div>
      <p className="text-lg md:text-xl text-slate-700 text-center max-w-md font-medium leading-snug">
        Video content is being updated. Let's discuss this topic instead!
      </p>
    </div>
  );

  const renderPlayer = () => {
    if (videoId) {
      return (
        <div className={PLAYER_WRAPPER}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={slide.title || 'Video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setHasError(true)}
          />
        </div>
      );
    }
    if (vimeoId) {
      return (
        <div className={PLAYER_WRAPPER}>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={slide.title || 'Video'}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onError={() => setHasError(true)}
          />
        </div>
      );
    }
    if (isMp4) {
      return (
        <div className={PLAYER_WRAPPER}>
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            onError={() => setHasError(true)}
          />
        </div>
      );
    }
    return renderFallback();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Video className="w-7 h-7 mt-1 flex-shrink-0" style={{ color: accent }} />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          {slide.title || 'Video'}
        </h2>
      </div>

      {showFallback ? renderFallback() : renderPlayer()}

      {instructions && (
        <p className="text-base text-slate-700 leading-relaxed">{instructions}</p>
      )}

      {takeaways.length > 0 && (
        <div
          className="rounded-xl p-5 border"
          style={{ background: accentSoft, borderColor: `${accent}33` }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: accent }}
          >
            Key Takeaways
          </h3>
          <ul className="space-y-2">
            {takeaways.map((t, i) => (
              <li key={i} className="text-base text-slate-800 flex items-start gap-2">
                <span className="mt-1 font-bold" style={{ color: accent }}>
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { extractYouTubeId };
