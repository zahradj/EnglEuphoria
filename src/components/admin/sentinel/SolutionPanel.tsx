import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JsonDiffViewer } from "./JsonDiffViewer";
import type { SentinelIncident } from "@/pages/admin/SentinelDashboard";

export function SolutionPanel({ incident }: { incident: SentinelIncident }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">The AI Solution</div>
          <div className="text-sm font-semibold">Proposed fix</div>
        </div>
      </div>

      <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
        {incident.root_cause_analysis || (
          <span className="text-muted-foreground italic">No root-cause analysis available.</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">JSON Diff</div>
        {incident.target_table && (
          <Badge variant="outline" className="font-mono text-[10px]">
            {incident.target_table}
            {incident.target_row_id ? ` · ${incident.target_row_id.slice(0, 8)}` : ""}
          </Badge>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <JsonDiffViewer before={incident.current_state} after={incident.proposed_data_patch} />
      </div>
    </div>
  );
}
