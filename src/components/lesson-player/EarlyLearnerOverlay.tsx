import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, Loader2, Type } from 'lucide-react';
import { playSlideAudio } from '@/lib/playSlideAudio';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

/**
 * EarlyLearnerOverlay
 *
 * Visual + audio scaffolding for pre-readers / early readers.
 * Activates when:
 *   - hub === 'playground' (any level), OR
 *   - hub === 'academy' AND level ∈ { Pre-A1, A1 }
 *
 * What it adds to every slide:
 *   • Auto-plays slide.voice.text once on mount (with mute fallback if the
 *     browser blocks autoplay — the giant Listen Again button then bridges).
 *   • Always-visible giant "🔊 Listen Again" FAB bottom-right.
 *   • Pictogram chip top-left showing the action (👆 tap / ✋ drag / 🎤 say
 *     / 🔗 match) inferred from slide.type/kind.
 *   • "Aa" toggle top-right that hides/shows the slide's visible TEXT
 *     instructions for non-readers. OFF by default for Pre-A1 — picture +
 *     voice teach instead.
 *
 * This is presentational only — it never edits the slide payload. The "Aa"
 * toggle adds a CSS class on the wrapper that `.early-learner-text-hidden
 * [data-early-text]` hides via the matching rule below.
 */
export interface EarlyLearnerOverlayProps {
  hub: HubType;
  level?: string;
  slide?: any;
  children: React.ReactNode;
}

const EARLY_CEFRS = new Set(['Pre-A1', 'A1']);

export function isEarlyLearnerAudience(hub: HubType, level?: string): boolean {
  if (hub === 'playground') return true;
  if (hub === 'academy' && level && EARLY_CEFRS.has(level.trim())) return true;
  return false;
}

interface Pictogram { emoji: string; label: string }

function inferAction(slide: any): Pictogram {
  const t = String(slide?.type ?? slide?.kind ?? '').toLowerCase();
  if (/drag|drop|sort/.test(t)) return { emoji: '✋', label: 'Drag' };
  if (/match|pair|link/.test(t)) return { emoji: '🔗', label: 'Match' };
  if (/speak|repeat|record|voice|listen_repeat/.test(t)) return { emoji: '🎤', label: 'Say' };
  if (/listen|sound|phonics|audio/.test(t)) return { emoji: '👂', label: 'Listen' };
  if (/draw|trace/.test(t)) return { emoji: '✏️', label: 'Draw' };
  return { emoji: '👆', label: 'Tap' };
}

function extractVoiceText(slide: any): string {
  if (!slide) return '';
  const v = slide.voice ?? slide.content?.voice ?? slide.data?.voice;
  if (v && typeof v === 'object' && typeof v.text === 'string') return v.text.trim();
  // Fallbacks so non-conforming slides still get a spoken cue.
  if (typeof slide.title === 'string' && slide.title.length <= 60) return slide.title;
  if (typeof slide.prompt === 'string' && slide.prompt.length <= 60) return slide.prompt;
  return '';
}

function extractAudioUrl(slide: any): string | undefined {
  const v = slide?.voice ?? slide?.content?.voice ?? slide?.data?.voice;
  return v?.audio_url ?? v?.audioUrl ?? slide?.audio_url;
}

export default function EarlyLearnerOverlay({
  hub,
  level,
  slide,
  children,
}: EarlyLearnerOverlayProps) {
  const active = isEarlyLearnerAudience(hub, level);
  const pictogram = useMemo(() => inferAction(slide), [slide]);
  const voiceText = extractVoiceText(slide);
  const audioUrl = extractAudioUrl(slide);
  const isPreA1 = (level ?? '').trim() === 'Pre-A1';
  // Default: Pre-A1 hides text (picture + voice teach); A1 shows it.
  const [textVisible, setTextVisible] = useState<boolean>(!isPreA1);
  const [playing, setPlaying] = useState(false);
  const playedKey = useRef<string>('');

  // Auto-play once per slide identity. Browser may block — the FAB recovers.
  useEffect(() => {
    if (!active || !voiceText) return;
    const key = `${(slide as any)?.id ?? ''}::${voiceText}`;
    if (playedKey.current === key) return;
    playedKey.current = key;
    setTextVisible(!isPreA1);
    const t = setTimeout(() => {
      setPlaying(true);
      playSlideAudio({
        text: voiceText,
        audioUrl,
        onEnd: () => setPlaying(false),
        onError: () => setPlaying(false),
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, voiceText, audioUrl, (slide as any)?.id]);

  const replay = () => {
    if (playing || !voiceText) return;
    setPlaying(true);
    playSlideAudio({
      text: voiceText,
      audioUrl,
      onEnd: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  };

  if (!active) return <>{children}</>;

  return (
    <div
      className={[
        'early-learner-shell relative w-full h-full',
        textVisible ? '' : 'early-learner-text-hidden',
      ].join(' ')}
    >
      {/* Pictogram chip — top-left */}
      <div className="absolute top-2 left-2 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 shadow-md border border-slate-200">
        <span className="text-xl leading-none" aria-hidden>{pictogram.emoji}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {pictogram.label}
        </span>
      </div>

      {/* Aa text toggle — top-right */}
      <button
        type="button"
        onClick={() => setTextVisible((v) => !v)}
        aria-pressed={textVisible}
        aria-label={textVisible ? 'Hide written text' : 'Show written text'}
        className={[
          'absolute top-2 right-2 z-30 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
          'text-xs font-bold uppercase tracking-wider shadow-md border transition',
          textVisible
            ? 'bg-white/90 backdrop-blur text-slate-700 border-slate-200 hover:bg-white'
            : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-100',
        ].join(' ')}
      >
        <Type className="w-3.5 h-3.5" />
        Aa
      </button>

      {/* Slide content */}
      {children}

      {/* Giant "Listen Again" FAB — bottom-right */}
      {voiceText && (
        <button
          type="button"
          onClick={replay}
          disabled={playing}
          aria-label="Listen again"
          className={[
            'absolute bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full',
            'pl-4 pr-5 py-3 font-extrabold text-white shadow-xl border-2 border-white',
            'transition active:scale-95 disabled:opacity-80',
            'bg-[var(--hub-accent,#FE6A2F)] hover:brightness-110',
          ].join(' ')}
        >
          {playing ? (
            <Loader2 className="w-6 h-6 animate-spin" aria-hidden />
          ) : (
            <Volume2 className="w-6 h-6" aria-hidden />
          )}
          <span className="hidden sm:inline">Listen Again</span>
        </button>
      )}
    </div>
  );
}
