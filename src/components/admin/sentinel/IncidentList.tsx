import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { SentinelIncident } from "@/pages/admin/SentinelDashboard";

interface Props {
  incidents: SentinelIncident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function confidenceTone(score: number, needsHuman: boolean): string {
  if (needsHuman) return "bg-destructive/15 text-destructive";
  if (score >= 85) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-destructive/15 text-destructive";
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  applied: "Applied",
  failed: "Failed",
  needs_human: "Needs Human",
};

export function IncidentList({ incidents, selectedId, onSelect }: Props) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-6 text-center text-sm text-muted-foreground">
        No incidents yet. Sentinel-1 is watching.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
      {incidents.map((i) => (
        <button
          key={i.id}
          onClick={() => onSelect(i.id)}
          className={cn(
            "w-full text-left rounded-xl border p-3 transition-all backdrop-blur-md",
            selectedId === i.id
              ? "border-primary/50 bg-primary/5 shadow-md"
              : "border-border/60 bg-card/60 hover:bg-card/80 hover:border-border",
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="font-medium text-sm truncate">{i.component_name}</div>
            <span
              className={cn(
                "shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold",
                confidenceTone(i.confidence_score, i.requires_human_intervention),
              )}
            >
              {i.requires_human_intervention ? "HUMAN" : `${i.confidence_score}%`}
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate mb-1">{i.route || "—"}</div>
          <div className="text-xs line-clamp-2 text-foreground/80 mb-2">
            {i.cto_explanation || i.error_message}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="px-1.5 py-0.5 rounded bg-muted">{statusLabel[i.status] ?? i.status}</span>
            <span>{formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
