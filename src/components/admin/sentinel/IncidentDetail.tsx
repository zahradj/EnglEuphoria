import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonDiffViewer } from "./JsonDiffViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";
import type { SentinelIncident } from "@/pages/admin/SentinelDashboard";

interface Props {
  incident: SentinelIncident;
  onChanged: () => void;
}

export function IncidentDetail({ incident, onChanged }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (action: "approve" | "reject" | "needs_human") => {
    setBusy(action);
    const { data, error } = await supabase.functions.invoke("sentinel-apply-patch", {
      body: { incident_id: incident.id, action },
    });
    setBusy(null);
    if (error) {
      toast.error(error.message || "Action failed");
      return;
    }
    const status = (data as { status?: string } | null)?.status;
    toast.success(`Incident ${status ?? action}`);
    onChanged();
  };

  const blocked = incident.requires_human_intervention;
  const terminal = ["applied", "rejected", "failed"].includes(incident.status);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="font-semibold text-lg">{incident.component_name}</div>
            <div className="text-sm text-muted-foreground">{incident.route || "—"}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={blocked ? "destructive" : "secondary"}>
              {blocked ? "Needs Human" : `Confidence ${incident.confidence_score}%`}
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">{incident.status.replace("_", " ")}</span>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Link to={`/admin/system-health/report/${incident.id}`}>
                Open full report
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="text-sm bg-muted/40 rounded-lg p-3 mb-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">CTO Explanation</div>
          {incident.cto_explanation || "—"}
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Error & stack trace
          </summary>
          <div className="mt-2 p-3 rounded bg-muted/40 font-mono whitespace-pre-wrap break-words max-h-48 overflow-auto">
            <div className="text-destructive mb-2">{incident.error_message}</div>
            <div className="text-muted-foreground">{incident.error_stack || "(no stack)"}</div>
          </div>
        </details>
      </div>

      {/* Root cause */}
      {incident.root_cause_analysis && (
        <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Root Cause Analysis</div>
          <p className="text-sm whitespace-pre-wrap">{incident.root_cause_analysis}</p>
        </div>
      )}

      {/* Diff */}
      <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Data Patch</div>
          {incident.target_table && (
            <Badge variant="outline" className="font-mono text-[10px]">
              {incident.target_table}
              {incident.target_row_id ? ` · ${incident.target_row_id.slice(0, 8)}` : ""}
            </Badge>
          )}
        </div>
        <JsonDiffViewer before={incident.current_state} after={incident.proposed_data_patch} />
      </div>

      {/* Actions */}
      {!terminal && (
        <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-4 flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => act("needs_human")}
            disabled={!!busy}
          >
            Mark Needs Human
          </Button>
          <Button
            variant="outline"
            onClick={() => act("reject")}
            disabled={!!busy}
          >
            {busy === "reject" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reject
          </Button>
          <Button
            onClick={() => act("approve")}
            disabled={!!busy || blocked || !incident.target_table || !incident.target_row_id}
            title={
              blocked
                ? "Sentinel flagged this for human review"
                : !incident.target_table
                  ? "No allow-listed target table"
                  : !incident.target_row_id
                    ? "No target row id"
                    : ""
            }
          >
            {busy === "approve" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Approve & Apply
          </Button>
        </div>
      )}

      {incident.apply_error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          Apply error: {incident.apply_error}
        </div>
      )}
    </div>
  );
}
