import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IncidentList } from "@/components/admin/sentinel/IncidentList";
import { IncidentDetail } from "@/components/admin/sentinel/IncidentDetail";
import { ShieldCheck } from "lucide-react";

export interface SentinelIncident {
  id: string;
  created_at: string;
  resolved_at: string | null;
  user_id: string | null;
  component_name: string;
  route: string | null;
  error_message: string;
  error_stack: string | null;
  current_state: unknown;
  target_table: string | null;
  target_row_id: string | null;
  proposed_data_patch: unknown;
  confidence_score: number;
  root_cause_analysis: string | null;
  cto_explanation: string | null;
  requires_human_intervention: boolean;
  status: "pending" | "approved" | "rejected" | "applied" | "failed" | "needs_human";
  reviewed_by: string | null;
  apply_error: string | null;
}

export default function SentinelDashboard() {
  const [incidents, setIncidents] = useState<SentinelIncident[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("sentinel_incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setIncidents((data ?? []) as SentinelIncident[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("sentinel_incidents_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sentinel_incidents" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const selected = useMemo(
    () => incidents.find((i) => i.id === selectedId) ?? null,
    [incidents, selectedId],
  );

  const counts = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return {
      pending: incidents.filter((i) => i.status === "pending").length,
      needs_human: incidents.filter((i) => i.status === "needs_human").length,
      applied_24h: incidents.filter(
        (i) => i.status === "applied" && now - new Date(i.created_at).getTime() < day,
      ).length,
      failed_24h: incidents.filter(
        (i) => i.status === "failed" && now - new Date(i.created_at).getTime() < day,
      ).length,
    };
  }, [incidents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Sentinel-1</h1>
            <p className="text-sm text-muted-foreground">Reliability incidents & proposed patches</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Pending", value: counts.pending, tone: "text-amber-500" },
            { label: "Needs Human", value: counts.needs_human, tone: "text-destructive" },
            { label: "Applied (24h)", value: counts.applied_24h, tone: "text-emerald-500" },
            { label: "Failed (24h)", value: counts.failed_24h, tone: "text-destructive" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-4"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
              <div className={`text-2xl font-semibold mt-1 ${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <IncidentList
                incidents={incidents}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            {selected ? (
              <IncidentDetail incident={selected} onChanged={load} />
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-12 text-center text-sm text-muted-foreground">
                Select an incident to review the proposed patch.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
