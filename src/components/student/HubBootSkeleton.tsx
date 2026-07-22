import React from 'react';
import type { HubLevel } from '@/lib/hubResolver';

interface HubBootSkeletonProps {
  hubHint?: HubLevel | null;
}

/**
 * Neutral, Flat 2.0 skeleton shown while auth + hub are hydrating.
 * Uses only semantic tokens — never hardcoded colors.
 * Prevents the wrong-hub flicker on refresh by occupying the screen
 * until the real dashboard knows which hub to render.
 */
export const HubBootSkeleton: React.FC<HubBootSkeletonProps> = ({ hubHint }) => {
  // Subtle hub tint only if we already know it (otherwise pure neutral).
  const tintClass =
    hubHint === 'academy'
      ? 'from-primary/5 via-background to-background'
      : hubHint === 'professional'
      ? 'from-emerald-500/5 via-background to-background'
      : hubHint === 'playground'
      ? 'from-orange-500/5 via-background to-background'
      : 'from-background via-background to-background';

  return (
    <div
      className={`min-h-dvh w-full flex bg-gradient-to-br ${tintClass}`}
      aria-busy="true"
      aria-live="polite"
    >
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-64 flex-col gap-3 p-4 border-r border-border/40">
        <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 rounded-md bg-muted/70 animate-pulse" />
          ))}
        </div>
      </aside>

      {/* Main skeleton */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border/40 flex items-center px-6 gap-3">
          <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          <div className="ml-auto h-8 w-24 rounded-md bg-muted animate-pulse" />
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-muted/70 animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 rounded-xl bg-muted/60 animate-pulse" />
              <div className="h-64 rounded-xl bg-muted/60 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HubBootSkeleton;
