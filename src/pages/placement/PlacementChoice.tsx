// PlacementChoice — Welcome screen shown before the Lean CAT placement test.
// Hub-aware mascot + voice: Playground=Pip (fox), Academy=Nova (owl),
// Success=Atlas (falcon). Greeting copy follows the user's i18n language.
// Voice greeting stays in English (matches the rest of the placement test).
//
// App-shell constraint: max-w-720, h-[100dvh], no scrolling.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Sprout, Target, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  attachPlacementContentRealtime,
  loadHubPlacementContent,
  type HubKey,
  type HubPlacementContent,
} from '@/placement/hubContent';

type Hub = 'playground' | 'academy' | 'success' | 'professional';

interface Props {
  hub: Hub;
  firstName?: string;
  onPickBeginner: () => Promise<void> | void;
  onPickTest: () => void;
  busy?: boolean;
}

const hubTheme: Record<Hub, { gradient: string; ring: string; cta: string; accent: string }> = {
  playground: {
    gradient: 'from-orange-50 via-amber-50 to-yellow-50',
    ring: 'ring-orange-300/60',
    cta: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
    accent: 'text-orange-600',
  },
  academy: {
    gradient: 'from-violet-50 via-indigo-50 to-fuchsia-50',
    ring: 'ring-violet-300/60',
    cta: 'from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700',
    accent: 'text-violet-600',
  },
  success: {
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    ring: 'ring-emerald-300/60',
    cta: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
    accent: 'text-emerald-600',
  },
  professional: {
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    ring: 'ring-emerald-300/60',
    cta: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
    accent: 'text-emerald-600',
  },
};

const hubKey = (hub: Hub): HubKey => (hub === 'professional' ? 'success' : hub);

const DEFAULT_AVATAR: Record<Hub, string> = {
  playground: '/mascots/pip-fox-welcome.png',
  academy: '/mascots/nova-owl-welcome.png',
  success: '/mascots/atlas-falcon-welcome.png',
  professional: '/mascots/atlas-falcon-welcome.png',
};

export default function PlacementChoice({
  hub,
  firstName,
  onPickBeginner,
  onPickTest,
  busy,
}: Props) {
  const theme = hubTheme[hub];
  const { t, i18n } = useTranslation();
  const dir = i18n.dir(i18n.language);

  const [content, setContent] = useState<HubPlacementContent | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedOnce = useRef(false);

  // Subscribe once so any admin save in Content Creator instantly invalidates
  // this tab's cached placement content.
  useEffect(() => {
    attachPlacementContentRealtime();
  }, []);

  // Load the hub's mascot/voice/greeting fresh on mount.
  useEffect(() => {
    let cancelled = false;
    loadHubPlacementContent(hubKey(hub), { force: true })
      .then((c) => {
        if (!cancelled) setContent(c);
      })
      .catch((e) => console.warn('[placement-choice] content load failed', e));
    return () => {
      cancelled = true;
    };
  }, [hub]);

  const pip = content?.pip;
  const mascotLabel = pip?.label ?? 'Pip';
  const avatarUrl = pip?.avatarUrl || DEFAULT_AVATAR[hub];

  // English voiceover script — kept English so the cached MP3 matches the
  // ElevenLabs voice. The UI copy below is translated separately.
  const greetingForVoice = pip?.intro
    ? `Hi${firstName ? ` ${firstName}` : ''}! ${pip.intro}`
    : `Hi${firstName ? ` ${firstName}` : ''}! I'm ${mascotLabel}. Pick how you'd like to start.`;

  // Fetch (or generate + cache) the hub-specific voiceover whenever content
  // arrives. Each (voiceId, text) pair has its own cached MP3.
  useEffect(() => {
    if (!pip) return;
    let cancelled = false;
    setLoadingAudio(true);
    setAudioUrl(null);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('placement-voiceover', {
          body: { text: greetingForVoice, voiceId: pip.voiceId },
        });
        if (cancelled) return;
        if (error) throw error;
        if (data?.url) setAudioUrl(data.url);
      } catch (e) {
        console.warn('[placement-choice] voiceover unavailable', e);
      } finally {
        if (!cancelled) setLoadingAudio(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pip?.voiceId, greetingForVoice]);

  // Try to autoplay once the URL is ready. Browsers may block silently.
  useEffect(() => {
    if (!audioUrl) return;
    playedOnce.current = false;
    const el = new Audio(audioUrl);
    audioRef.current = el;
    el.play()
      .then(() => {
        playedOnce.current = true;
      })
      .catch(() => {
        /* user gesture required — replay button is visible */
      });
    return () => {
      el.pause();
    };
  }, [audioUrl]);

  const replay = useCallback(() => {
    if (!audioUrl) return;
    const el = audioRef.current ?? new Audio(audioUrl);
    audioRef.current = el;
    el.currentTime = 0;
    el.play().catch(() => {});
    playedOnce.current = true;
  }, [audioUrl]);

  const comma = dir === 'rtl' ? '،' : ',';
  const nameInterp = firstName ?? '';

  return (
    <div
      dir={dir}
      className={`min-h-[100dvh] w-full overflow-y-auto bg-gradient-to-br ${theme.gradient} flex items-center justify-center px-4 py-6`}
    >
      <div className="w-full max-w-[680px] flex flex-col items-center justify-center gap-4 sm:gap-5">
        {/* Mascot */}
        <button
          type="button"
          onClick={replay}
          aria-label={t('placement.choice.replay')}
          className={`relative shrink-0 rounded-full bg-white/60 backdrop-blur-sm p-2 ring-2 ${theme.ring} shadow-sm hover:scale-[1.03] transition-transform`}
        >
          <img
            src={avatarUrl}
            alt={mascotLabel}
            width={1024}
            height={1024}
            loading="lazy"
            className="w-[clamp(110px,18vh,170px)] h-[clamp(110px,18vh,170px)] object-contain"
          />
          <span
            className={`absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-1 ${theme.ring}`}
          >
            {loadingAudio ? (
              <Loader2 className={`h-4 w-4 animate-spin ${theme.accent}`} />
            ) : (
              <Volume2 className={`h-4 w-4 ${theme.accent}`} />
            )}
          </span>
        </button>

        {/* Copy */}
        <div className="text-center px-2">
          <h1 className="text-[clamp(20px,3.2vh,28px)] font-bold text-slate-900 leading-tight">
            {t('placement.choice.title', {
              comma: nameInterp ? comma : '',
              name: nameInterp,
              mascot: mascotLabel,
            })}
          </h1>
          <p className="text-[clamp(13px,1.8vh,15px)] text-slate-600 mt-1">
            {t('placement.choice.subtitle')}
          </p>
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-2.5 sm:gap-3 px-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => onPickBeginner()}
            className="group w-full text-start rounded-2xl bg-white p-4 sm:p-5 ring-1 ring-slate-200 hover:ring-2 hover:ring-emerald-400 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Sprout className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 text-[clamp(14px,1.9vh,16px)]">
                  {t('placement.choice.beginnerTitle')}
                </p>
                <p className="text-[clamp(11px,1.5vh,13px)] text-slate-500 leading-snug">
                  {t('placement.choice.beginnerHint')}
                </p>
              </div>
              {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </div>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onPickTest}
            className={`group w-full text-start rounded-2xl bg-gradient-to-r ${theme.cta} p-4 sm:p-5 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white">
                <Target className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[clamp(14px,1.9vh,16px)]">
                  {t('placement.choice.testTitle')}
                </p>
                <p className="text-[clamp(11px,1.5vh,13px)] text-white/85 leading-snug">
                  {t('placement.choice.testHint')}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Replay hint */}
        <button
          type="button"
          onClick={replay}
          disabled={!audioUrl}
          className="mt-1 inline-flex items-center gap-1.5 text-[clamp(11px,1.5vh,13px)] text-slate-500 hover:text-slate-700 disabled:opacity-50"
        >
          <Volume2 className="h-3.5 w-3.5" />
          {t('placement.choice.replay')}
        </button>
      </div>
    </div>
  );
}
