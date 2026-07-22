import React from 'react';

/**
 * Academy Loader — sleek, branded, no mascot.
 * Pulsing indigo geometric mark. Replaces the Playground/Pip loader
 * inside Academy routes.
 */
export default function AcademyLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      data-hub="academy"
      className="flex min-h-screen w-full items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-lg bg-primary/20" />
          <div className="absolute inset-2 rounded-md bg-primary/40" />
          <div className="absolute inset-4 rounded-sm bg-primary animate-pulse" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
