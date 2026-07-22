/**
 * Parent-facing Quest Log — read-only mirror of /quest-log for a specific
 * child. Access is gated by `student_parent_relationships` (RLS enforced
 * on the underlying `student_engine_runs` cross-check).
 */
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Target, Timer, Star, ShieldCheck } from "lucide-react";
import type { EngineKind, UnitEngineRun } from "@/lib/unitProgressReport";

const ENGINE_LABEL: Record<EngineKind, string> = {
  story: "Story Adventure",
  escape_room: "Escape Room",
  detective_mystery: "Detective Mystery",
  hidden_object: "Hidden Object",
};

type Entry = { unitId: string; run: UnitEngineRun };

export default function ParentQuestLog() {
  const { studentId } = useParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [studentName, setStudentName] = useState<string>("your child");

  useEffect(() => {
    (async () => {
      if (!studentId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setAuthorized(false);
      // Verify parent-child link
      const { data: rel } = await supabase
        .from("student_parent_relationships")
        .select("id")
        .eq("parent_id", user.id)
        .eq("student_id", studentId)
        .maybeSingle();
      if (!rel) return setAuthorized(false);
      setAuthorized(true);

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("first_name")
        .eq("user_id", studentId)
        .maybeSingle();
      if (profile?.first_name) setStudentName(profile.first_name);

      const { data } = await supabase
        .from("student_engine_runs")
        .select("unit_id, engine, accuracy, duration_ms, attempts, correct, created_at")
        .eq("user_id", studentId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) {
        setEntries(
          (data as any[]).map((r) => ({
            unitId: r.unit_id,
            run: {
              engine: r.engine as EngineKind,
              accuracy: Number(r.accuracy) || 0,
              durationMs: r.duration_ms || 0,
              attempts: r.attempts || 0,
              correct: r.correct || 0,
              ts: r.created_at,
            } as UnitEngineRun,
          })),
        );
      }
    })();
  }, [studentId]);

  const avg = useMemo(
    () => entries.length ? entries.reduce((s, e) => s + e.run.accuracy, 0) / entries.length : 0,
    [entries],
  );

  if (authorized === false) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center max-w-md">
          <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Not authorized</h1>
          <p className="text-muted-foreground">
            You aren't linked as a parent of this student.
          </p>
          <Link to="/" className="underline text-sm mt-4 inline-block">Back home</Link>
        </div>
      </div>
    );
  }
  if (authorized === null) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Compass className="h-7 w-7 text-purple-500" /> {studentName}'s Quests
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {entries.length} completed · {Math.round(avg * 100)}% average accuracy
        </p>
      </header>

      {entries.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No completed quests yet.
        </Card>
      ) : (
        <div className="grid gap-3">
          {entries.map(({ unitId, run }, i) => {
            const pct = Math.round(run.accuracy * 100);
            return (
              <Card key={`${unitId}-${i}`} className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{ENGINE_LABEL[run.engine]}</span>
                    <Badge variant="outline">Unit {unitId.slice(0, 6)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {pct}%</span>
                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {Math.max(1, Math.round(run.durationMs / 60000))}m</span>
                    <span>{run.correct}/{run.attempts}</span>
                    <span>{new Date(run.ts).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${
                      (pct >= 90 && s <= 3) || (pct >= 75 && s <= 2) || s === 1
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
