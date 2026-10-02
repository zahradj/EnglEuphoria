import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, SkipForward } from 'lucide-react';
import { logClassroomCrash } from '@/lib/classroomCrashLog';

/**
 * Per-scene crash guard for the lesson players (Pre-A1, Welcome Town/A2,
 * Magic Castle). One broken activity must never end the lesson:
 *
 *   crash #1  → quietly remount the activity               ("Reconnecting…")
 *   crash #2  → remount in SAFE MODE: no live sync at all, so the activity
 *               runs purely on its own data and can't be tripped by anything
 *               the other screen sent
 *   crash #3+ → show a card with "Reload" and — for whoever can navigate —
 *               "Skip to the next activity", so the class keeps moving
 *
 * Every crash is logged with the scene id/kind and which side/mode it was in.
 * Place it inside the player's per-scene `key={scene.id}` wrapper, so a new
 * scene always starts with a clean slate.
 */
const RETRY_DELAY_MS = 350;
const FAILURES_BEFORE_SAFE_MODE = 1;
const FAILURES_BEFORE_CARD = 3;

interface Props {
  sceneId: string;
  sceneKind: string;
  /** "student mirror" | "teacher" | "solo" — for the crash log. */
  side: string;
  /** Can this user move the lesson on? (teacher, or solo play). */
  canSkip: boolean;
  onSkip: () => void;
  /** `safeMode` is true once live sync has been switched off for this scene. */
  children: (opts: { safeMode: boolean }) => ReactNode;
}

interface State {
  hasError: boolean;
  failures: number;
  attempt: number;
}

export class SceneCrashGuard extends Component<Props, State> {
  state: State = { hasError: false, failures: 0, attempt: 0 };
  private timer: number | null = null;

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const failures = this.state.failures + 1;
    const safe = failures > FAILURES_BEFORE_SAFE_MODE;
    console.error(`🚨 Scene ${this.props.sceneId} crashed (#${failures})`, error);
    void logClassroomCrash(error, info, {
      label: `Scene ${this.props.sceneId} [${this.props.sceneKind}] · ${this.props.side}${safe ? ' · safe mode' : ''} · crash #${failures}`,
    });
    this.setState({ failures });
    if (failures < FAILURES_BEFORE_CARD) {
      this.timer = window.setTimeout(this.remount, RETRY_DELAY_MS);
    }
  }

  componentWillUnmount() {
    if (this.timer !== null) window.clearTimeout(this.timer);
  }

  private remount = () => {
    this.timer = null;
    this.setState((s) => ({ hasError: false, attempt: s.attempt + 1 }));
  };

  private manualReload = () => {
    this.setState((s) => ({ hasError: false, failures: 0, attempt: s.attempt + 1 }));
  };

  render() {
    const { failures, hasError, attempt } = this.state;
    if (hasError && failures < FAILURES_BEFORE_CARD) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6" role="status">
          <p className="rounded-full bg-white/95 px-5 py-2 text-sm font-semibold text-slate-600 shadow-lg">Reconnecting the activity…</p>
        </div>
      );
    }
    if (hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-6 text-center backdrop-blur">
          <div className="max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-3xl">😅</div>
            <h2 className="text-lg font-bold text-slate-800">This activity hit a snag</h2>
            <p className="text-sm text-slate-500">
              {this.props.canSkip
                ? 'The rest of the class is fine. Reload this activity, or skip to the next one.'
                : 'The rest of the class is fine. Try reloading — your teacher can also skip to the next activity.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={this.manualReload} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg active:scale-95">
                <RotateCcw className="h-4 w-4" /> Reload this activity
              </button>
              {this.props.canSkip && (
                <button type="button" onClick={this.props.onSkip} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">
                  <SkipForward className="h-4 w-4" /> Skip this activity
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
    const safeMode = failures > FAILURES_BEFORE_SAFE_MODE;
    return (
      <div key={attempt} className="absolute inset-0">
        {this.props.children({ safeMode })}
      </div>
    );
  }
}

export default SceneCrashGuard;
