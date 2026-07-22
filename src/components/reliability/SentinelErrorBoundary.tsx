import { Component, type ErrorInfo, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { snapshotLatestSentinelState } from "@/hooks/useSentinelState";
import { SentinelFallback } from "./SentinelFallback";

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
}

export class SentinelErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, incidentId: null, diagnosing: false };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true, diagnosing: true };
  }

  async componentDidCatch(error: Error, info: ErrorInfo) {
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
