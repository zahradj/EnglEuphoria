import { useMemo } from 'react';

export type MediaKind = 'youtube' | 'audio' | 'video';

export type MediaPlayerSlideShape = {
  type: 'media_player';
  title?: string;
  media_url: string;
  media_kind: MediaKind;
  transcript?: string;
};

type Hub = 'playground' | 'academy' | 'success';

const HUB_WRAP: Record<Hub, string> = {
  playground: 'border-orange-300 bg-orange-50',
  academy: 'border-indigo-300 bg-indigo-50',
  success: 'border-emerald-300 bg-emerald-50',
};

export function detectMediaKind(url: string): MediaKind {
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/\.(mp3|wav|m4a|ogg)(\?|$)/i.test(url)) return 'audio';
  return 'video';
}

function youTubeEmbed(url: string): string {
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else id = u.searchParams.get('v') || '';
    if (!id) return url;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return url;
  }
}

export function MediaPlayerRenderer({ slide, hub }: { slide: MediaPlayerSlideShape; hub: Hub }) {
  const kind = slide.media_kind || detectMediaKind(slide.media_url);
  const embedUrl = useMemo(() => (kind === 'youtube' ? youTubeEmbed(slide.media_url) : slide.media_url), [slide.media_url, kind]);

  return (
    <div className={`w-full rounded-2xl border-2 ${HUB_WRAP[hub]} p-4`}>
      {slide.title && <h3 className="text-lg font-bold text-slate-800 mb-3">🎧 {slide.title}</h3>}
      {kind === 'youtube' && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe src={embedUrl} title="media" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      )}
      {kind === 'video' && (
        <video controls src={slide.media_url} className="w-full rounded-xl bg-black" />
      )}
      {kind === 'audio' && (
        <audio controls src={slide.media_url} className="w-full" />
      )}
      {slide.transcript && (
        <details className="mt-3 text-sm text-slate-700">
          <summary className="cursor-pointer font-semibold">Transcript</summary>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">{slide.transcript}</p>
        </details>
      )}
    </div>
  );
}

export default MediaPlayerRenderer;
