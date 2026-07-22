import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import type { SentinelIncident } from "@/pages/admin/SentinelDashboard";

interface Props {
  incident: SentinelIncident;
  onResolved: () => void;
}

export function SafeExecutionFooter({ incident, onResolved }: Props) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  const terminal = ["applied", "rejected", "failed"].includes(incident.status);
  const blocked = incident.requires_human_intervention;
  const noTarget = !incident.target_table || !incident.target_row_id;
  const approveDisabled = !!busy || terminal || blocked || noTarget;

  const act = async (action: "approve" | "reject") => {
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
    if (action === "approve") {
      toast.success("Patch deployed — incident resolved");
    } else {
      toast.success("Patch rejected — flagged for developer review");
    }
    if (status) onResolved();
  };

  return (
    <div className="sticky bottom-0 z-30 -mx-4 md:-mx-6 mt-6 border-t border-border/60 bg-background/85 backdrop-blur-xl px-4 md:px-6 py-3">
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {terminal ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Incident is {incident.status}. No further action available.</span>
            </>
          ) : blocked ? (
            <>
              <ShieldAlert className="w-4 h-4 text-destructive" />
              <span>Sentinel flagged this for human review — automated apply disabled.</span>
            </>
          ) : noTarget ? (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>No allow-listed target — reject or escalate manually.</span>
            </>
          ) : (
            <span>Review the diff carefully. Approval writes directly to the target row.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => act("reject")}
            disabled={!!busy || terminal}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {busy === "reject" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Reject Patch
          </Button>
          <Button
            onClick={() => act("approve")}
            disabled={approveDisabled}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {busy === "approve" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Approve & Deploy
          </Button>
        </div>
      </div>
    </div>
  );
}
