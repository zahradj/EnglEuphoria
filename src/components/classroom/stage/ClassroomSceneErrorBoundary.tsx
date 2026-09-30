import { Component, ReactNode, ErrorInfo } from 'react';
import { RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  /** Remounts the boundary (fresh error state + fresh children) whenever
   *  this changes — pass the current scene/lesson identity so navigating
   *  away from the scene that crashed also clears the crash screen, not
   *  just clicking "Reload this activity". */
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  attempt: number;
}

/**
 * Scoped error boundary for the live classroom's scene-player area only.
 *
 * Before this existed, a render crash anywhere inside the scene player
 * (EmbeddedWelcomeTownLesson / EmbeddedSceneLesson) had nowhere to go but
 * up to the single app-wide AppErrorBoundary wrapping the whole routed app
 * — which replaced the ENTIRE classroom (video, chat, controls, both
 * participants' views) with a generic "Something went wrong" card, ending
 * the live session for both teacher and student over a failure in one
 * scene. Reported live as "classroom broke in the middle of the lesson."
 *
 * This boundary catches at the scene-player boundary instead, so the rest
 * of the classroom (video call, chat, teacher controls) stays intact and
 * usable, and recovery is a full remount of just the crashed subtree via
 * the `attempt` key — not merely clearing a flag and re-rendering the same,
 * possibly still-corrupted component tree in place.
 */
export class ClassroomSceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Classroom scene crashed:', error, errorInfo);
    void this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      // The scene changed (e.g. teacher navigated away) — drop the crash
      // screen automatically instead of stranding the class on it.
      this.setState((s) => ({ hasError: false, attempt: s.attempt + 1 }));
    }
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const componentName =
        errorInfo.componentStack?.trim().split('\n')[0]?.trim().replace(/^in\s+/i, '') ?? null;
      await supabase.from('system_errors').insert({
        error_message: error.message?.slice(0, 4000) ?? 'Unknown error',
        stack_trace: [error.stack, errorInfo.componentStack].filter(Boolean).join('\n\n---\n\n'),
        component_name: `ClassroomScenePlayer > ${componentName ?? 'unknown'}`,
        route: typeof window !== 'undefined' ? window.location.pathname : null,
        user_id: auth.user?.id ?? null,
        status: 'open',
      });
    } catch (logErr) {
      console.warn('[ClassroomSceneErrorBoundary] Failed to log error:', logErr);
    }
  }

  private handleRetry = () => {
    this.setState((s) => ({ hasError: false, attempt: s.attempt + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-6 text-center backdrop-blur">
          <div className="max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-3xl">😅</div>
            <h2 className="text-lg font-bold text-slate-800">This activity hit a snag</h2>
            <p className="text-sm text-slate-500">
              The rest of the classroom is fine — video and chat are still connected. Try reloading just this activity.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" /> Reload this activity
            </button>
          </div>
        </div>
      );
    }
    // The scene player's own content is `position: absolute` (out of
    // normal flow), so this wrapper MUST also be absolutely positioned and
    // fill its container — a plain unstyled div collapses to zero size
    // when its only children are absolutely positioned, which silently
    // hid the entire scene canvas behind the classroom's own chrome
    // (video tiles, chat, nav bar all kept working since that state
    // flows through separate callbacks) while `onNavState` still fired
    // normally. Reported live as "blank page, both sides" right after
    // this boundary shipped.
    return <div key={this.state.attempt} className="absolute inset-0">{this.props.children}</div>;
  }
}

export default ClassroomSceneErrorBoundary;
