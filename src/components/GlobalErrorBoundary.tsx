import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { isChunkLoadError, reloadOnceForChunkError, hardReload } from "@/lib/chunkLoadRecovery";

interface State {
  hasError: boolean;
  message?: string;
  /** A stale-chunk crash we're already reloading to recover from — not a real error, don't show the fallback or log it. */
  recoveringFromDeploy: boolean;
}

interface Props {
  children: React.ReactNode;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, recoveringFromDeploy: false };

  static getDerivedStateFromError(error: Error): State {
    if (isChunkLoadError(error) && reloadOnceForChunkError()) {
      return { hasError: true, message: error.message, recoveringFromDeploy: true };
    }
    return { hasError: true, message: error.message, recoveringFromDeploy: false };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (this.state.recoveringFromDeploy) return; // already reloading — not a real error to log
    try {
      const { data: auth } = await supabase.auth.getUser();
      const componentName =
        info.componentStack?.trim().split("\n")[0]?.trim().replace(/^in\s+/i, "") ?? null;

      await supabase.from("system_errors").insert({
        error_message: error.message?.slice(0, 4000) ?? "Unknown error",
        stack_trace: [error.stack, info.componentStack].filter(Boolean).join("\n\n---\n\n"),
        component_name: componentName,
        route: typeof window !== "undefined" ? window.location.pathname : null,
        user_id: auth.user?.id ?? null,
        status: "open",
      });
    } catch (logErr) {
      console.warn("[GlobalErrorBoundary] Failed to log error:", logErr);
    }
  }

  handleReload = () => {
    void hardReload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.state.recoveringFromDeploy) {
      // window.location.reload() is already in flight (triggered from
      // getDerivedStateFromError) — render nothing rather than flash the
      // crash card for a false alarm.
      return null;
    }

    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-xl text-center">
          <div className="text-5xl mb-4">😅</div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Oops, we hit a snag!
          </h1>
          <p className="text-muted-foreground mb-6">
            Something unexpected happened. Our team has been notified and we're on it.
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition"
          >
            Reload page
          </button>
          {import.meta.env.DEV && this.state.message && (
            <p className="mt-4 text-xs text-muted-foreground font-mono break-all">
              {this.state.message}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default GlobalErrorBoundary;
