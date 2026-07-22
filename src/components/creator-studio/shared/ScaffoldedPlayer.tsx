import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { ScaffoldedMediaSlide, Hub, HUB_FRAME } from './canvasSchema';

interface Props {
  slide: ScaffoldedMediaSlide;
  hub: Hub;
  onAllSegmentsPassed?: () => void;
}

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/i.test(url);
}
function ytId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    return u.searchParams.get('v') || '';
  } catch { return ''; }
}

export function ScaffoldedPlayer({ slide, hub, onAllSegmentsPassed }: Props) {
  const segments = useMemo(
    () => [...(slide.segments || [])].sort((a, b) => a.start_time - b.start_time),
    [slide.segments],
  );
  const [passed, setPassed] = useState<Set<number>>(new Set());
  const [activeSeg, setActiveSeg] = useState<number | null>(null);
  const [pickedAnswer, setPickedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const ytRef = useRef<any>(null);
  const ytReadyRef = useRef(false);
  const ytIframeRef = useRef<HTMLIFrameElement>(null);
  const allDoneRef = useRef(false);

  const isYT = isYouTube(slide.media_url);
  const segIdxAtTime = (t: number) => segments.findIndex(s => !passed.has(segments.indexOf(s)) && t >= s.end_time && t < s.end_time + 60);

  // Setup YouTube iframe API
  useEffect(() => {
    if (!isYT) return;
    let cancelled = false;
    const ensureYT = () => new Promise<any>((resolve) => {
      const w = window as any;
      if (w.YT && w.YT.Player) return resolve(w.YT);
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => { prev?.(); resolve(w.YT); };
    });
    ensureYT().then((YT) => {
      if (cancelled || !ytIframeRef.current) return;
      ytRef.current = new YT.Player(ytIframeRef.current, {
        events: {
          onReady: () => {
            ytReadyRef.current = true;
            setDuration(ytRef.current.getDuration?.() ?? 0);
          },
        },
      });
    });
    return () => { cancelled = true; try { ytRef.current?.destroy?.(); } catch {} };
  }, [isYT, slide.media_url]);

  // Polling loop for current time (works for both HTML5 and YouTube)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      let t = 0;
      if (isYT && ytReadyRef.current) {
        try { t = ytRef.current.getCurrentTime?.() ?? 0; } catch {}
      } else if (mediaRef.current) {
        t = mediaRef.current.currentTime || 0;
      }
      setCurrentTime(t);

      if (activeSeg == null) {
        for (let i = 0; i < segments.length; i++) {
          if (passed.has(i)) continue;
          if (t >= segments[i].end_time) {
            // pause
            try { mediaRef.current?.pause(); } catch {}
            try { ytRef.current?.pauseVideo?.(); } catch {}
            setActiveSeg(i);
            setPickedAnswer(null);
            setFeedback(null);
            break;
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [segments, activeSeg, passed, isYT]);

  // Detect "all done" once every segment passed AND playback ended
  useEffect(() => {
    if (allDoneRef.current) return;
    if (segments.length > 0 && passed.size === segments.length) {
      allDoneRef.current = true;
      onAllSegmentsPassed?.();
    }
  }, [passed, segments.length, onAllSegmentsPassed]);

  const submitAnswer = () => {
    if (activeSeg == null || pickedAnswer == null) return;
    const seg = segments[activeSeg];
    if (pickedAnswer === seg.question.answer) {
      setFeedback('correct');
      setTimeout(() => {
        setPassed(p => new Set(p).add(activeSeg));
        setActiveSeg(null);
        // resume
        try { mediaRef.current?.play(); } catch {}
        try { ytRef.current?.playVideo?.(); } catch {}
      }, 600);
    } else {
      setFeedback('wrong');
    }
  };

  const replayLast30 = () => {
    if (activeSeg == null) return;
    const seg = segments[activeSeg];
    const t = Math.max(0, seg.end_time - 30);
    if (isYT && ytReadyRef.current) {
      ytRef.current.seekTo?.(t, true);
      ytRef.current.playVideo?.();
    } else if (mediaRef.current) {
      mediaRef.current.currentTime = t;
      mediaRef.current.play().catch(() => {});
    }
    setActiveSeg(null);
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {slide.title && <h2 className="text-2xl font-extrabold text-slate-800 text-center">{slide.title}</h2>}

      <div className={`relative rounded-2xl border-4 overflow-hidden ${HUB_FRAME[hub]}`}>
        {isYT ? (
          <div className="relative w-full aspect-video bg-black">
            <iframe
              ref={ytIframeRef}
              src={`https://www.youtube.com/embed/${ytId(slide.media_url)}?enablejsapi=1&rel=0`}
              title={slide.title || 'media'}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : slide.media_kind === 'audio' ? (
          <audio
            ref={mediaRef as any}
            src={slide.media_url}
            controls
            className="w-full"
            onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration || 0)}
          />
        ) : (
          <video
            ref={mediaRef as any}
            src={slide.media_url}
            controls
            className="w-full aspect-video bg-black"
            onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration || 0)}
          />
        )}

        {/* Question overlay */}
        {activeSeg != null && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-6 z-10">
            <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                <Pause className="w-3.5 h-3.5" />
                Checkpoint {activeSeg + 1} / {segments.length}
              </div>
              <p className="text-lg font-bold text-slate-800">{segments[activeSeg].question.prompt}</p>
              <div className="grid gap-2">
                {segments[activeSeg].question.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setPickedAnswer(opt); setFeedback(null); }}
                    className={`text-left px-4 py-2.5 rounded-xl border-2 font-semibold transition ${
                      pickedAnswer === opt
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {feedback === 'wrong' && (
                <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold">
                  <XCircle className="w-4 h-4" /> Not quite. Try again or replay the segment.
                </div>
              )}
              {feedback === 'correct' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Correct! Resuming…
                </div>
              )}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={replayLast30}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw className="w-4 h-4" /> Replay last 30s
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!pickedAnswer || feedback === 'correct'}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl px-4 py-2"
                >
                  <Play className="w-4 h-4" /> Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {duration > 0 && segments.length > 0 && (
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-indigo-400/60"
            style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
          />
          {segments.map((s, i) => (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                passed.has(i) ? 'bg-emerald-500 border-emerald-700' : 'bg-white border-slate-500'
              }`}
              style={{ left: `calc(${(s.end_time / duration) * 100}% - 6px)` }}
              title={`Checkpoint at ${Math.round(s.end_time)}s`}
            />
          ))}
        </div>
      )}

      <div className="text-xs text-slate-500 text-center">
        {passed.size} / {segments.length} checkpoints passed
      </div>
    </div>
  );
}
