/**
 * Admin: Marketplace Review Moderation.
 * Lists visible/flagged/hidden teacher scenario ratings and lets admins hide/restore them.
 * Requires admin role — RLS lets admins read all rows regardless of moderation_status.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Flag, Star } from "lucide-react";

type Status = "visible" | "flagged" | "hidden";

interface Row {
  id: string;
  scenario_id: string;
  rater_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  moderation_status: Status;
  moderation_reason: string | null;
}

export default function ReviewModeration() {
  const [status, setStatus] = useState<Status>("visible");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (s: Status) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_scenario_ratings")
      .select("id, scenario_id, rater_id, stars, comment, created_at, moderation_status, moderation_reason")
      .eq("moderation_status", s)
      .order("created_at", { ascending: false })
      .limit(100);
    setLoading(false);
    if (error) return toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows(((data as unknown) as Row[]) || []);
  };

  useEffect(() => { load(status); }, [status]);

  const moderate = async (id: string, next: Status, reason?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("teacher_scenario_ratings")
      .update({
        moderation_status: next,
        moderation_reason: reason ?? null,
        moderated_by: userData?.user?.id ?? null,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: next === "visible" ? "Restored" : next === "hidden" ? "Hidden" : "Flagged" });
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Review Moderation</h1>
        <p className="text-sm text-muted-foreground">Hide abusive or spam reviews on the scenario marketplace.</p>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as Status)}>
        <TabsList>
          <TabsTrigger value="visible">Visible</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="hidden">Hidden</TabsTrigger>
        </TabsList>

        {(["visible", "flagged", "hidden"] as Status[]).map((s) => (
          <TabsContent key={s} value={s} className="space-y-2 mt-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No {s} reviews.</p>
            ) : (
              rows.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= r.stars ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40"}`} />
                        ))}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {new Date(r.created_at).toLocaleDateString()} · scenario {r.scenario_id.slice(0, 8)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm italic">
                      {r.comment ? `"${r.comment}"` : <span className="text-muted-foreground">(no comment)</span>}
                    </p>
                    {r.moderation_reason ? (
                      <p className="text-[11px] text-muted-foreground">Reason: {r.moderation_reason}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {s !== "hidden" ? (
                        <Button size="sm" variant="destructive" onClick={() => {
                          const reason = window.prompt("Reason for hiding? (optional)") || undefined;
                          moderate(r.id, "hidden", reason);
                        }}>
                          <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide
                        </Button>
                      ) : null}
                      {s === "visible" ? (
                        <Button size="sm" variant="outline" onClick={() => moderate(r.id, "flagged")}>
                          <Flag className="h-3.5 w-3.5 mr-1.5" /> Flag
                        </Button>
                      ) : null}
                      {s !== "visible" ? (
                        <Button size="sm" variant="outline" onClick={() => moderate(r.id, "visible")}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Restore
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
