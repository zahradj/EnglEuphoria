import React, { Component, ErrorInfo, ReactNode, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { slideLabel } from '@/lib/academy/playerSafety';

/**
 * Safety net for the Academy lesson player. A student should never lose a lesson because ONE slide is broken:
 *  - SlideErrorBoundary catches a render crash inside a slide, offers "Try again" and "Skip", and logs it.
 *  - RenderGuard notices a slide that rendered NOTHING (unsupported/unknown slide type) and offers a skip.
 *  - OfflineChip tells the student their progress is safe if the connection drops.
 */

interface BoundaryProps {
  children: ReactNode;
  /** Changes with the slide so navigating away clears a crash screen. */
  resetKey: string | number;
  slide: any;
  onSkip: () => void;
  canSkip: boolean;
}
interface BoundaryState { hasError: boolean; attempt: number }

export class SlideErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<BoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AcademyPlayer] slide crashed:', this.props.slide?.type, error, info);
    void this.log(error, info);
  }

  componentDidUpdate(prev: BoundaryProps) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState((s) => ({ hasError: false, attempt: s.attempt + 1 }));
    }
  }

  private async log(error: Error, info: ErrorInfo) {
    try {
      const { data: auth } = await supabase.auth.getUser();
      await supabase.from('system_errors').insert({
        error_message: error.message?.slice(0, 4000) ?? 'Unknown error',
        stack_trace: [error.stack, info.componentStack].filter(Boolean).join('\n\n---\n\n'),
        component_name: `AcademyPlayer > slide ${String(this.props.slide?.type ?? 'unknown')}`,
        route: typeof window !== 'undefined' ? window.location.pathname : null,
        user_id: auth.user?.id ?? null,
        status: 'open',
      });
    } catch {
      /* logging must never break the fallback UI */
    }
  }

  render() {
    if (!this.state.hasError) {
      return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
    }
    return (
      <FallbackCard
        title="This activity didn't load"
        body="Don't worry — your progress is saved. Try it again, or skip to the next slide."
        slide={this.props.slide}
        primary={{ label: 'Try again', onClick: () => this.setState((s) => ({ hasError: false, attempt: s.attempt + 1 })) }}
        secondary={this.props.canSkip ? { label: 'Skip ▶', onClick: this.props.onSkip } : undefined}
      />
    );
  }
}

function FallbackCard({ title, body, slide, primary, secondary }: {
  title: string; body: string; slide: any;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div role="alert" className="mx-4 w-full max-w-md rounded-3xl border-4 border-amber-300 bg-white p-6 text-center text-slate-900 shadow-[0_8px_0_0_#b45309,0_24px_44px_rgba(0,0,0,0.4)]">
      <div className="text-5xl" aria-hidden>🧭</div>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      <p className="mt-1 text-base text-slate-700">{body}</p>
      <p className="mt-1 text-xs text-slate-500">{slideLabel(slide)}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button onClick={primary.onClick} className="min-h-[48px] rounded-2xl bg-emerald-600 px-6 text-base font-black text-white shadow-[0_4px_0_0_#064e3b] active:translate-y-1">{primary.label}</button>
        {secondary && (
          <button onClick={secondary.onClick} className="min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-6 text-base font-bold text-slate-800 hover:bg-slate-50">{secondary.label}</button>
        )}
      </div>
    </div>
  );
}

/** Shows a skip card when a slide renders no DOM at all (an unsupported slide type returns `undefined`). */
export function RenderGuard({ children, slide, resetKey, onSkip, canSkip }: {
  children: ReactNode; slide: any; resetKey: string | number; onSkip: () => void; canSkip: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    setEmpty(false);
    const t = window.setTimeout(() => {
      const el = ref.current;
      if (el && el.childElementCount === 0 && !el.textContent?.trim()) setEmpty(true);
    }, 700);
    return () => window.clearTimeout(t);
  }, [resetKey]);
  if (empty) {
    return (
      <FallbackCard
        title="This slide isn't available here yet"
        body="Your teacher can still use it in class. You can skip it and keep going."
        slide={slide}
        primary={{ label: canSkip ? 'Skip ▶' : 'OK', onClick: onSkip }}
      />
    );
  }
  // `display: contents` keeps the wrapper out of the layout so the slide renders exactly as before.
  return <div ref={ref} style={{ display: 'contents' }}>{children}</div>;
}

/** Small, calm notice when the connection drops. Lessons keep working: progress is saved on the device. */
export function OfflineChip() {
  const [online, setOnline] = useState<boolean>(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="pointer-events-none fixed left-1/2 top-3 z-[95] -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-xl ring-1 ring-white/20">
      📡 You're offline — your progress is saved on this device.
    </div>
  );
}
