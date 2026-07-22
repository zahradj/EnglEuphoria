import React, { Component, ReactNode } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  /** Called when the user clicks "Skip to next" — wired to advance the slide deck. */
  onSkip?: () => void;
  /** Optional reset key — when it changes the boundary clears its error state. */
  resetKey?: string | number | null;
  /** Friendly label for what failed (e.g., "this slide", "the studio"). */
  label?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  lastResetKey?: string | number | null;
}

/**
 * Friendly Error Boundary used around individual slides and the studio shell.
 * Renders a "let's keep going!" UI instead of white-screening the live class.
 */
export class SlideErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, lastResetKey: props.resetKey ?? null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Auto-reset when the parent rotates the resetKey (e.g., slide index changed).
    if (props.resetKey !== state.lastResetKey) {
      return { hasError: false, error: undefined, lastResetKey: props.resetKey ?? null };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SlideErrorBoundary] Caught render error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleSkip = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onSkip?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { onSkip, label = 'this slide' } = this.props;

    return (
      <div className="w-full h-full min-h-[320px] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-pink-50 p-8 shadow-xl">
          <div className="text-6xl mb-3" aria-hidden>🎈</div>
          <h2 className="text-2xl font-extrabold text-slate-800 font-['Nunito']">
            Oops! Let's skip to the next game!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We had a tiny hiccup loading {label}. No worries — we'll keep the lesson moving.
          </p>
          <div className="mt-6 flex gap-2 justify-center flex-wrap">
            {onSkip && (
              <Button
                onClick={this.handleSkip}
                className="min-h-[48px] min-w-[48px] gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl border-b-4 border-amber-700 active:translate-y-1 active:border-b-0"
              >
                Next Game <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={this.handleReset}
              className="min-h-[48px] min-w-[48px] gap-2 rounded-2xl border-2"
            >
              <Sparkles className="h-4 w-4" /> Try Again
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-5 text-left">
              <summary className="cursor-pointer text-xs text-slate-400">Dev details</summary>
              <pre className="mt-2 text-[10px] bg-slate-100 p-2 rounded overflow-auto max-h-40">
                {this.state.error.stack || this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
