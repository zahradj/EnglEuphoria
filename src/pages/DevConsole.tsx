import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, CheckCircle2, Sparkles, ChevronDown, ChevronRight } from "lucide-react";

interface SystemError {
  id: string;
  created_at: string;
  error_message: string;
  stack_trace: string | null;
  component_name: string | null;
  route: string | null;
  user_id: string | null;
  ai_analysis: string | null;
  ai_model: string | null;
  analyzed_at: string | null;
  status: "open" | "analyzing" | "analyzed" | "resolved";
}

const STATUS_FILTERS = ["all", "open", "analyzing", "analyzed", "resolved"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const statusVariant = (s: SystemError["status"]) => {
  switch (s) {
    case "open": return "destructive";
    case "analyzing": return "secondary";
    case "analyzed": return "default";
    case "resolved": return "outline";
  }
};

export default function DevConsole() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("system_errors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error(`Failed to load: ${error.message}`);
    } else {
      setErrors((data ?? []) as SystemError[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("system_errors_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_errors" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalyzer = async (id?: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-system-bug", {
        body: id ? { id } : {},
      });
      if (error) throw error;
      toast.success(`Analyzed ${data?.analyzed ?? 0} bug(s)`);
      await load();
    } catch (e) {
      toast.error(`Analyzer failed: ${(e as Error).message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const markResolved = async (id: string) => {
    const { error } = await supabase
      .from("system_errors")
      .update({ status: "resolved" })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Marked resolved");
      load();
    }
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = filter === "all" ? errors : errors.filter((e) => e.status === filter);
  const counts = STATUS_FILTERS.reduce<Record<string, number>>((acc, k) => {
    acc[k] = k === "all" ? errors.length : errors.filter((e) => e.status === k).length;
    return acc;
  }, {});

  return (
    <div className="min-h-dvh bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" />
              Dev Console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-analyzed crash reports from the Engleuphoria app.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => runAnalyzer()} disabled={analyzing}>
              {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze open bugs
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                filter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {s} ({counts[s] ?? 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-12 text-center">
            <p className="text-muted-foreground">No errors to display. 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bug) => {
              const isOpen = expanded.has(bug.id);
              return (
                <div
                  key={bug.id}
                  className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggle(bug.id)}
                    className="w-full flex items-start gap-3 p-4 text-left hover:bg-accent/30 transition"
                  >
                    {isOpen ? <ChevronDown className="w-5 h-5 mt-1 shrink-0" /> : <ChevronRight className="w-5 h-5 mt-1 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={statusVariant(bug.status) as any}>{bug.status}</Badge>
                        {bug.route && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {bug.route}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(bug.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-mono text-sm text-foreground break-words">
                        {bug.error_message}
                      </p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border">
                      {bug.component_name && (
                        <div className="pt-3">
                          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Component</h4>
                          <p className="font-mono text-sm">{bug.component_name}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Stack trace</h4>
                        <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-64">
                          {bug.stack_trace ?? "(no stack trace)"}
                        </pre>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs uppercase tracking-wide text-muted-foreground">
                            AI analysis {bug.ai_model && <span className="normal-case">· {bug.ai_model}</span>}
                          </h4>
                        </div>
                        {bug.ai_analysis ? (
                          <pre className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                            {bug.ai_analysis}
                          </pre>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Not analyzed yet.</p>
                        )}
                      </div>
                      <div className="flex gap-2 pt-1">
                        {bug.status !== "resolved" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => runAnalyzer(bug.id)} disabled={analyzing}>
                              <Sparkles className="w-4 h-4 mr-2" />
                              {bug.ai_analysis ? "Re-analyze" : "Analyze"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => markResolved(bug.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark resolved
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
