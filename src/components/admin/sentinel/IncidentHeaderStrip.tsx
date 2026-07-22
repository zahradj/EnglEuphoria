import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ShieldCheck, Clock, Layers, Component as ComponentIcon, MapPin } from "lucide-react";
import type { SentinelIncident } from "@/pages/admin/SentinelDashboard";

function confidenceTone(score: number, needsHuman: boolean) {
  if (needsHuman) return "bg-destructive/15 text-destructive border-destructive/30";
  if (score > 90) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  if (score > 70) return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function parseClassroomId(route: string | null): string | null {
  if (!route) return null;
  const m = route.match(/\/classroom\/([^/?#]+)/);
  return m ? m[1] : null;
}

function inferHub(route: string | null): { label: string; tone: string } | null {
  if (!route) return null;
  if (route.startsWith("/playground")) return { label: "Playground", tone: "bg-orange-500/15 text-orange-600 dark:text-orange-400" };
  if (route.startsWith("/academy")) return { label: "Academy", tone: "bg-purple-500/15 text-purple-600 dark:text-purple-400" };
  if (route.startsWith("/hub") || route.startsWith("/success"))
    return { label: "Success", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
  return null;
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  applied: "Resolved",
  failed: "Failed",
  needs_human: "Needs Human",
};

export function IncidentHeaderStrip({ incident }: { incident: SentinelIncident }) {
  const classroomId = parseClassroomId(incident.route);
  const hub = inferHub(incident.route);

  return (
    <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Sentinel Agent Incident Report
            </div>
            <h1 className="text-xl md:text-2xl font-semibold truncate">{incident.component_name}</h1>
            <div className="text-xs font-mono text-muted-foreground mt-1 truncate">{incident.id}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={cn(
              "px-3 py-1.5 rounded-lg border text-sm font-semibold",
              confidenceTone(incident.confidence_score, incident.requires_human_intervention),
            )}
          >
            {incident.requires_human_intervention
              ? "Human Required"
              : `${incident.confidence_score}% Confidence`}
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">
            {statusLabel[incident.status] ?? incident.status}
          </span>
        </div>
      </div>

      {/* Metadata pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        {classroomId && (
          <MetaPill icon={<MapPin className="w-3 h-3" />} label="Classroom" value={classroomId} mono />
        )}
        {hub && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
              hub.tone,
            )}
          >
            <Layers className="w-3 h-3" />
            {hub.label}
          </span>
        )}
        <MetaPill
          icon={<ComponentIcon className="w-3 h-3" />}
          label="Component"
          value={incident.component_name}
        />
        {incident.route && (
          <MetaPill icon={<MapPin className="w-3 h-3" />} label="Route" value={incident.route} mono />
        )}
        <MetaPill
          icon={<Clock className="w-3 h-3" />}
          label="At"
          value={format(new Date(incident.created_at), "PP · HH:mm:ss")}
        />
        {incident.target_table && (
          <MetaPill label="Target" value={incident.target_table} mono />
        )}
      </div>
    </div>
  );
}

function MetaPill({
  icon,
  label,
  value,
  mono = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border/40 text-xs">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("text-foreground", mono && "font-mono")}>{value}</span>
    </span>
  );
}
