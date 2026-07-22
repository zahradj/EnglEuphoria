/**
 * Scenario Marketplace — browse teacher-shared Language Engine overrides
 * and clone them into your own library. Polish: search + filter chips.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Download, Users, Store, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ScenarioRatingWidget } from "@/components/marketplace/ScenarioRatingWidget";

interface PublicOverride {
  id: string;
  engine: string;
  hub: string;
  cefr: string;
  topic: string | null;
  title: string | null;
  description: string | null;
  vocab_hash: string;
  scenario: unknown;
  clone_count: number;
  teacher_id: string;
  updated_at: string;
}

const HUBS = ["all", "playground", "academy", "success"] as const;
const ENGINES = ["all", "story", "escape_room", "detective_mystery", "hidden_object"] as const;
const SORTS = [
  { key: "top_rated", label: "Top rated" },
  { key: "popular", label: "Most cloned" },
  { key: "newest", label: "Newest" },
] as const;
const MIN_STARS = [0, 3, 4, 5] as const;

export default function ScenarioMarketplace() {
  const [rows, setRows] = useState<PublicOverride[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [hub, setHub] = useState<(typeof HUBS)[number]>("all");
  const [engine, setEngine] = useState<(typeof ENGINES)[number]>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("top_rated");
  const [minStars, setMinStars] = useState<(typeof MIN_STARS)[number]>(0);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_scenario_overrides")
      .select("id, engine, hub, cefr, topic, title, description, vocab_hash, scenario, clone_count, teacher_id, updated_at")
      .eq("is_public", true)
      .eq("active", true)
      .limit(200);
    if (!error && data) {
      setRows(data as any);
      const ids = (data as any[]).map((r) => r.id);
      if (ids.length) {
        const { data: rr } = await supabase
          .from("teacher_scenario_ratings")
          .select("scenario_id, stars")
          .in("scenario_id", ids);
        const agg: Record<string, { avg: number; count: number }> = {};
        for (const r of (rr as any[]) || []) {
          const a = agg[r.scenario_id] ||= { avg: 0, count: 0 };
          a.avg = (a.avg * a.count + (r.stars || 0)) / (a.count + 1);
          a.count += 1;
        }
        setRatings(agg);
      } else {
        setRatings({});
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (hub !== "all" && r.hub !== hub) return false;
      if (engine !== "all" && !r.engine.startsWith(engine)) return false;
      if (minStars > 0 && (ratings[r.id]?.avg ?? 0) < minStars) return false;
      if (!q) return true;
      const hay = [r.title, r.topic, r.description, r.engine, r.cefr]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
    out.sort((a, b) => {
      if (sort === "popular") return (b.clone_count || 0) - (a.clone_count || 0);
      if (sort === "newest") return b.updated_at.localeCompare(a.updated_at);
      // top_rated: avg desc, then count desc
      const ra = ratings[a.id], rb = ratings[b.id];
      const av = ra ? ra.avg + Math.min(ra.count, 20) * 0.001 : 0;
      const bv = rb ? rb.avg + Math.min(rb.count, 20) * 0.001 : 0;
      return bv - av;
    });
    return out;
  }, [rows, ratings, query, hub, engine, sort, minStars]);

  const clone = async (row: PublicOverride) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast({ title: "Sign in required" });
    const { error } = await supabase.from("teacher_scenario_overrides").insert({
      teacher_id: user.id,
      engine: row.engine,
      hub: row.hub,
      cefr: row.cefr,
      topic: row.topic,
      vocab_hash: row.vocab_hash,
      scenario: row.scenario as any,
      title: row.title ? `${row.title} (clone)` : null,
      description: row.description,
      cloned_from: row.id,
      active: false,
      is_public: false,
    });
    if (error) return toast({ title: "Clone failed", description: error.message, variant: "destructive" });
    await supabase
      .from("teacher_scenario_overrides")
      .update({ clone_count: (row.clone_count || 0) + 1 })
      .eq("id", row.id);
    toast({ title: "Cloned to your library", description: "Activate it from Scenario Overrides." });
    load();
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-7 w-7 text-emerald-500" /> Scenario Marketplace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Community-shared Language Engine scenarios. Clone to edit and activate.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/teacher/scenario-overrides">My Overrides</Link>
        </Button>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, topic, description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="self-center text-muted-foreground mr-1">Hub:</span>
          {HUBS.map((h) => (
            <Badge
              key={h}
              variant={hub === h ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setHub(h)}
            >{h}</Badge>
          ))}
          <span className="self-center text-muted-foreground mx-1">·</span>
          <span className="self-center text-muted-foreground mr-1">Engine:</span>
          {ENGINES.map((e) => (
            <Badge
              key={e}
              variant={engine === e ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setEngine(e)}
            >{e.replace(/_/g, " ")}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="self-center text-muted-foreground mr-1">Sort:</span>
          {SORTS.map((s) => (
            <Badge
              key={s.key}
              variant={sort === s.key ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSort(s.key)}
            >{s.label}</Badge>
          ))}
          <span className="self-center text-muted-foreground mx-1">·</span>
          <span className="self-center text-muted-foreground mr-1">Min ★:</span>
          {MIN_STARS.map((s) => (
            <Badge
              key={s}
              variant={minStars === s ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setMinStars(s)}
            >{s === 0 ? "Any" : `${s}+`}</Badge>
          ))}
        </div>
      </div>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {!loading && filtered.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          No scenarios match your filters.
        </CardContent></Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((row) => (
          <Card key={row.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  {row.title || row.topic || row.engine.replace(/_/g, " ")}
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" /> {row.clone_count}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="secondary">{row.engine.replace("_slot", "")}</Badge>
                <Badge variant="secondary">{row.hub}</Badge>
                <Badge variant="secondary">{row.cefr}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {row.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{row.description}</p>
              )}
              <ScenarioRatingWidget scenarioId={row.id} />
              <Button size="sm" onClick={() => clone(row)} className="w-full">
                <Download className="h-4 w-4 mr-2" /> Clone to my library
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
