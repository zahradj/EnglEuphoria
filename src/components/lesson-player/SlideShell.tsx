import React from 'react';
import { Logo } from '@/components/Logo';
import { GraduationCap, Briefcase, Gamepad2 } from 'lucide-react';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { SlideHubContext, buildHubValue } from './SlideHubContext';

const HUB_LABEL: Record<HubType, string> = {
  playground: 'Playground Hub',
  academy: 'Academy Hub',
  professional: 'Professional Hub',
};

const HUB_ICON: Record<HubType, React.ComponentType<{ className?: string }>> = {
  playground: Gamepad2,
  academy: GraduationCap,
  professional: Briefcase,
};

/**
 * Hub theme tokens — drive both the inline gradient and the CSS variables
 * (`--hub-accent`, `--hub-secondary`, `--hub-bg`) so any descendant can
 * style itself with `bg-[var(--hub-accent)]` and stay in sync when the
 * active hub changes.
 */
// Calm, classroom-friendly surface. Hub identity comes through a thin
// accent strip + small icon chip, NOT a full saturated frame.
const HUB_TOKENS: Record<HubType, { accent: string; secondary: string; bg: string; gradient: string }> = {
  playground: {
    accent: '#FE6A2F',
    secondary: '#F59E0B',
    bg: '#FFF1DB',
    gradient: 'linear-gradient(135deg, #FFE9B8 0%, #FFD3A8 45%, #FFB7C5 100%)',
  },
  academy: {
    accent: '#3B82F6',
    secondary: '#6366F1',
    bg: '#F6F8FC',
    gradient: 'linear-gradient(180deg, #FBFCFE 0%, #F1F5FB 100%)',
  },
  professional: {
    accent: '#059669',
    secondary: '#0D9488',
    bg: '#F4FBF8',
    gradient: 'linear-gradient(180deg, #FBFEFC 0%, #ECFAF4 100%)',
  },
};

export interface SlideShellProps {
  hub: HubType;
  children: React.ReactNode;
  level?: string;
  unit?: number | string;
  lesson?: number | string;
  slideIndex?: number;
  totalSlides?: number;
  /** When true, render children without the inner white card (full-bleed). */
  fullBleed?: boolean;
}

export default function SlideShell({
  hub,
  children,
  level,
  unit,
  lesson,
  slideIndex,
  totalSlides,
  fullBleed = false,
}: SlideShellProps) {
  const tokens = HUB_TOKENS[hub];
  const HubIcon = HUB_ICON[hub];
  const meta = [HUB_LABEL[hub], level, unit != null ? `Unit ${unit}` : null, lesson != null ? `Lesson ${lesson}` : null]
    .filter(Boolean)
    .join(' · ');
  const progress =
    typeof slideIndex === 'number' && typeof totalSlides === 'number' && totalSlides > 0
      ? Math.min(100, Math.max(0, ((slideIndex + 1) / totalSlides) * 100))
      : null;

  // Publish hub theme as CSS variables so descendants can use `bg-[var(--hub-accent)]`.
  const cssVars = {
    background: tokens.gradient,
    ['--hub-accent' as any]: tokens.accent,
    ['--hub-secondary' as any]: tokens.secondary,
    ['--hub-bg' as any]: tokens.bg,
  } as React.CSSProperties;

  return (
    <SlideHubContext.Provider value={buildHubValue(hub)}>
      <div
        className={`slide-container ${hub} relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden flex flex-col border border-slate-200`}
        style={cssVars}
      >
        {/* Thin hub accent strip — replaces the heavy purple frame */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-10"
          style={{ background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.secondary})` }}
          aria-hidden
        />

        {/* Top bar — light, neutral, classroom-friendly */}
        <div className="relative z-10 flex items-center justify-between px-5 py-2.5 bg-white/85 backdrop-blur border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-md px-1.5 py-0.5 flex items-center">
              <Logo size="small" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0"
                style={{ background: tokens.accent }}
                aria-hidden
              >
                <HubIcon className="w-3.5 h-3.5 text-white" />
              </span>
              <span className="text-slate-600 text-[11px] md:text-xs font-semibold tracking-wide uppercase truncate">
                {meta}
              </span>
            </div>
          </div>
          {progress !== null && (
            <span className="text-slate-500 text-xs font-bold tabular-nums shrink-0">
              {(slideIndex ?? 0) + 1} / {totalSlides}
            </span>
          )}
        </div>

        {/* Content — full-bleed canvas with faint hub-tinted background */}
        <div
          className="relative z-10 flex-1 flex items-stretch justify-stretch p-3 md:p-4 overflow-y-auto"
          style={{ background: tokens.gradient }}
        >
          {fullBleed ? (
            <div className="w-full h-full">{children}</div>
          ) : (
            <div className="w-full h-full text-slate-900">
              {children}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progress !== null && (
          <div className="relative z-10 h-1 w-full bg-slate-100">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, background: tokens.accent }}
            />
          </div>
        )}
      </div>
    </SlideHubContext.Provider>
  );
}
