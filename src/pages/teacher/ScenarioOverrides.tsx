/**
 * Teacher-authored Language Engine scenario overrides.
 * Any override matching (engine, hub, cefr, vocab_hash) short-circuits
 * cache + AI generation in the generate-engine-scenario edge function.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const ENGINES = [
  "story_engine_slot",
  "escape_room_slot",
  "detective_mystery_slot",
  "hidden_object_slot",
] as const;
type Engine = (typeof ENGINES)[number];
const HUBS = ["playground", "academy", "success"] as const;
type Hub = (typeof HUBS)[number];

async function hashVocab(words: string[]): Promise<string> {
  const key = words.map((w) => w.toLowerCase().trim()).filter(Boolean).sort().join("|");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

interface Override {
  id: string;
  engine: Engine;
  hub: Hub;
  cefr: string;
  vocab_hash: string;
  topic: string | null;
  scenario: unknown;
  notes: string | null;
  active: boolean;
  updated_at: string;
}

export default function ScenarioOverridesPage() {
  const [rows, setRows] = useState<Override[]>([]);
  const [engine, setEngine] = useState<Engine>("story_engine_slot");
  const [hub, setHub] = useState<Hub>("academy");
  const [cefr, setCefr] = useState("A2");
  const [topic, setTopic] = useState("");
  const [vocab, setVocab] = useState("");
  const [scenarioText, setScenarioText] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const targetWords = useMemo(
    () => vocab.split(",").map((w) => w.trim()).filter(Boolean),
    [vocab],
  );

  async function load() {
    const { data, error } = await supabase
      .from("teacher_scenario_overrides")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) return toast({ title: "Load failed", description: error.message });
    setRows((data ?? []) as Override[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    let scenario: unknown;
    try {
      scenario = JSON.parse(scenarioText);
    } catch {
      return toast({ title: "Scenario JSON is invalid", variant: "destructive" });
    }
    if (targetWords.length === 0) {
      return toast({ title: "Add at least one target word", variant: "destructive" });
    }
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error("Not signed in");
      const vocab_hash = await hashVocab(targetWords);
      const { error } = await supabase.from("teacher_scenario_overrides").insert({
        teacher_id: auth.user.id,
        engine,
        hub,
        cefr,
        vocab_hash,
        topic: topic || null,
        scenario,
        notes: notes || null,
        active: true,
      });
      if (error) throw error;
      toast({ title: "Override saved" });
      setScenarioText("");
      setNotes("");
      await load();
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    const { error } = await supabase
      .from("teacher_scenario_overrides")
      .update({ active })
      .eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this override?")) return;
    const { error } = await supabase
      .from("teacher_scenario_overrides")
      .delete()
      .eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message });
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scenario Overrides</h1>
          <p className="text-sm text-muted-foreground">
            Author custom Language Engine scenarios that replace AI-generated ones for matching
            engine + hub + level + vocabulary sets.
          </p>
        </div>
        <a
          href="/teacher/scenario-marketplace"
          className="shrink-0 text-sm underline text-primary hover:opacity-80"
        >
          Browse Marketplace →
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Engine</Label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={engine}
                onChange={(e) => setEngine(e.target.value as Engine)}
              >
                {ENGINES.map((e) => (
                  <option key={e} value={e}>
                    {e.replace("_slot", "").replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Hub</Label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={hub}
                onChange={(e) => setHub(e.target.value as Hub)}
              >
                {HUBS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>CEFR</Label>
              <Input value={cefr} onChange={(e) => setCefr(e.target.value.toUpperCase())} />
            </div>
          </div>
          <div>
            <Label>Topic (optional)</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. weekend market" />
          </div>
          <div>
            <Label>Target vocabulary (comma-separated)</Label>
            <Input
              value={vocab}
              onChange={(e) => setVocab(e.target.value)}
              placeholder="apple, market, bought, ripe"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {targetWords.length} word{targetWords.length === 1 ? "" : "s"}. Order does not matter — the
              hash normalises case and order.
            </p>
          </div>
          <div>
            <Label>Scenario JSON</Label>
            <Textarea
              rows={10}
              className="font-mono text-xs"
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder='{"kind":"story","title":"...","opening":"...","nodes":[...]}'
            />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save override"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Your overrides</h2>
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No overrides yet.</p>
        )}
        {rows.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{r.engine.replace("_slot", "")}</Badge>
                  <Badge variant="outline">{r.hub}</Badge>
                  <Badge variant="outline">{r.cefr}</Badge>
                  {!r.active && <Badge variant="destructive">inactive</Badge>}
                </div>
                <p className="truncate text-sm">
                  {r.topic ?? <span className="italic text-muted-foreground">no topic</span>}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  vocab_hash: {r.vocab_hash}
                </p>
                {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={r.active} onCheckedChange={(v) => toggle(r.id, v)} />
                <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
