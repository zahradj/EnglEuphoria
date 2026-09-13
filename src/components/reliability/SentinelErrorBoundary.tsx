import { Component, type ErrorInfo, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { snapshotLatestSentinelState } from "@/hooks/useSentinelState";
import { SentinelFallback } from "./SentinelFallback";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunkLoadRecovery";

const CYCLE1_ROUTES = [
  "/onboarding",
  "/student-signup",
  "/teach-with-us",
  "/placement",
  "/auth",
  "/login",
  "/signup",
];

interface State {
  hasError: boolean;
  incidentId: string | null;
  diagnosing: boolean;
  /** A stale-chunk crash we're already reloading to recover from — not a real incident, don't show the scary fallback or file a report for it. */
  recoveringFromDeploy: boolean;
}

export class SentinelErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, incidentId: null, diagnosing: false, recoveringFromDeploy: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    if (isChunkLoadError(error) && reloadOnceForChunkError()) {
      return { hasError: true, recoveringFromDeploy: true };
    }
    return { hasError: true, diagnosing: true, recoveringFromDeploy: false };
  }

  async componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.state.recoveringFromDeploy) return; // already reloading — not a real incident
    try {
      const route = typeof window !== "undefined" ? window.location.pathname : "";
      const cycle1 = CYCLE1_ROUTES.some((c) => route.toLowerCase().startsWith(c));
      const snap = snapshotLatestSentinelState();
      const componentName =
        snap?.component ||
        (info.componentStack?.split("\n").find((l) => l.trim())?.trim() ?? "UnknownComponent");

      const { data, error: invokeErr } = await supabase.functions.invoke("sentinel-diagnose", {
        body: {
          component_name: componentName,
          route,
          error_message: error.message,
          error_stack: error.stack ?? info.componentStack ?? "",
          current_state: snap?.state ?? {},
          cycle1,
        },
      });

      // If the crash happened inside a /classroom/* route, stamp platform_crash
      // on the live session so the dispute resolution dashboard picks it up.
      if (route.toLowerCase().startsWith("/classroom/")) {
        const roomId = route.split("/")[2];
        if (roomId) {
          supabase.functions
            .invoke("classroom-mark-crash", {
              body: { room_id: roomId, message: error.message },
            })
            .catch(() => {});
        }
      }

      if (invokeErr) console.error("Sentinel report failed", invokeErr);
      this.setState({
        diagnosing: false,
        incidentId: (data as { incident_id?: string } | null)?.incident_id ?? null,
      });
    } catch (e) {
      console.error("Sentinel boundary failure", e);
      this.setState({ diagnosing: false });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.recoveringFromDeploy) {
        // window.location.reload() is already in flight (triggered from
        // getDerivedStateFromError) — render nothing rather than flash the
        // "Something went off-script" card for a false alarm.
        return null;
      }
      return (
        <SentinelFallback
          incidentId={this.state.incidentId}
          diagnosing={this.state.diagnosing}
          onReload={this.handleReload}
        />
      );
    }
    return this.props.children;
  }
}
