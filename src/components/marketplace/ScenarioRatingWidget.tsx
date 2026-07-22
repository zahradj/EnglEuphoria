/**
 * Inline rating + review widget for Scenario Marketplace cards.
 * Anyone can read stars/comments; only signed-in teachers can post/edit
 * their own rating and comment. Reviews are shown inline (latest 3).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Row { stars: number; rater_id: string; comment: string | null; created_at: string }

export function ScenarioRatingWidget({ scenarioId }: { scenarioId: string }) {
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [mine, setMine] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: userData }, { data }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("teacher_scenario_ratings")
        .select("stars, rater_id, comment, created_at")
        .eq("scenario_id", scenarioId)
        .order("created_at", { ascending: false }),
    ]);
    const uid = userData?.user?.id ?? null;
    setUserId(uid);
    const list = ((data as unknown) as Row[]) || [];
    setRows(list);
    if (list.length) {
      setAvg(list.reduce((s, r) => s + (r.stars || 0), 0) / list.length);
      setCount(list.length);
      const own = list.find((r) => r.rater_id === uid);
      setMine(own?.stars ?? 0);
      setComment(own?.comment ?? "");
    } else {
      setAvg(null); setCount(0); setMine(0); setComment("");
    }
  };

  useEffect(() => { load(); }, [scenarioId]);

  const upsert = async (stars: number, nextComment?: string) => {
    if (!userId) return toast({ title: "Sign in to rate" });
    setBusy(true);
    const { error } = await supabase
      .from("teacher_scenario_ratings")
      .upsert(
        { scenario_id: scenarioId, rater_id: userId, stars, comment: (nextComment ?? comment) || null },
        { onConflict: "scenario_id,rater_id" },
      );
    setBusy(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setMine(stars);
    await load();
  };

  const display = mine || Math.round(avg ?? 0);
  const withComments = rows.filter((r) => (r.comment || "").trim().length > 0).slice(0, 3);

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <div className="flex" aria-label={avg ? `Average ${avg.toFixed(1)} of 5` : "No ratings yet"}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy}
              onClick={() => upsert(n)}
              className="p-0.5 disabled:opacity-50"
              aria-label={`Rate ${n} stars`}
            >
              <Star className={`h-4 w-4 ${n <= display ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <span className="text-muted-foreground">
          {avg ? `${avg.toFixed(1)} · ${count}` : "No ratings"}
        </span>
        {userId ? (
          <button
            type="button"
            onClick={() => setShowReview((v) => !v)}
            className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            aria-label="Write a review"
          >
            <MessageSquare className="h-3.5 w-3.5" /> {mine && comment ? "Edit review" : "Review"}
          </button>
        ) : null}
      </div>

      {showReview ? (
        <div className="space-y-1.5">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Share how this scenario worked with your students…"
            className="text-xs min-h-[64px]"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{comment.length}/500</span>
            <Button
              size="sm"
              disabled={busy || !mine}
              onClick={() => { upsert(mine || 5, comment); setShowReview(false); }}
            >
              Save review
            </Button>
          </div>
          {!mine ? <p className="text-[10px] text-amber-600">Pick a star rating first.</p> : null}
        </div>
      ) : null}

      {withComments.length > 0 ? (
        <ul className="space-y-1 pt-1 border-t">
          {withComments.map((r) => (
            <li key={r.rater_id + r.created_at} className="flex gap-1.5">
              <span className="flex shrink-0">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-3 w-3 ${n <= r.stars ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40"}`} />
                ))}
              </span>
              <span className="text-muted-foreground italic line-clamp-2">"{r.comment}"</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
