import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { IncidentHeaderStrip } from "@/components/admin/sentinel/IncidentHeaderStrip";
import { ProblemPanel } from "@/components/admin/sentinel/ProblemPanel";
import { SolutionPanel } from "@/components/admin/sentinel/SolutionPanel";
import { SafeExecutionFooter } from "@/components/admin/sentinel/SafeExecutionFooter";
import type { SentinelIncident } from "@/pages/admin/SentinelDashboard";

export default function SentinelIncidentReport() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<SentinelIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("sentinel_incidents")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setLoading(false);
    if (error) {
      console.error(error);
      setNotFound(true);
      return;
    }
    if (!data) {
      setNotFound(true);
      return;
    }
    setIncident(data as SentinelIncident);
  };

  useEffect(() => {
    load();
    if (!id) return;
    const ch = supabase
      .channel(`sentinel_incident_${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sentinel_incidents", filter: `id=eq.${id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/admin/sentinel">
              <ArrowLeft className="w-4 h-4 mr-1" />
              All incidents
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="rounded-xl border border-border/60 bg-card/50 p-12 text-center text-sm text-muted-foreground">
            Loading incident…
          </div>
        )}

        {!loading && notFound && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-12 text-center text-sm">
            Incident not found or access denied.
          </div>
        )}

        {!loading && incident && (
          <div className="space-y-4">
            <IncidentHeaderStrip incident={incident} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProblemPanel incident={incident} />
              <SolutionPanel incident={incident} />
            </div>

            {incident.apply_error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                Apply error: {incident.apply_error}
              </div>
            )}

            <SafeExecutionFooter incident={incident} onResolved={load} />
          </div>
        )}
      </div>
    </div>
  );
}
