import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

/**
 * Parent-facing notification preferences page.
 * Supports two entry modes:
 *   - ?token=<uuid>&unsubscribe=1  → one-click unsubscribe-all (no login required).
 *   - ?token=<uuid>                → toggle prefs by email token (no login required).
 * (An authenticated flow can be layered on later; today all emails ship a token.)
 */
export default function ParentNotifications() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const wantsUnsub = params.get("unsubscribe") === "1";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [questNudges, setQuestNudges] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const call = async (method: "GET" | "POST", body?: Record<string, unknown>) => {
    const { data, error: err } = await supabase.functions.invoke("parent-email-preferences", {
      method,
      body: method === "POST" ? { token, ...body } : undefined,
      // GET query for supabase-js: pass token via body -> the function reads url.searchParams
      // We use a workaround: call via fetch for GET so query is honored.
    } as any);
    if (err) throw err;
    return data;
  };

  const fetchPrefs = async () => {
    if (!token) { setError("Missing token in link."); setLoading(false); return; }
    try {
      const url = `https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/parent-email-preferences?token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setEmail(data.email ?? null);
      if (data.prefs) {
        if (typeof data.prefs.weekly_summary === "boolean") setWeeklySummary(data.prefs.weekly_summary);
        if (typeof data.prefs.quest_nudges === "boolean") setQuestNudges(data.prefs.quest_nudges);
      }
    } catch (e) {
      setError((e as Error).message || "Failed to load preferences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (wantsUnsub && token) {
        setLoading(true);
        try {
          await call("POST", { unsubscribe_all: true });
          setWeeklySummary(false);
          setQuestNudges(false);
          setDone(true);
          toast({ title: "Unsubscribed", description: "You won't receive quest email updates." });
        } catch (e) {
          setError((e as Error).message || "Failed to unsubscribe.");
        } finally {
          setLoading(false);
        }
        return;
      }
      await fetchPrefs();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, wantsUnsub]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await call("POST", { weekly_summary: weeklySummary, quest_nudges: questNudges });
      setDone(true);
      toast({ title: "Preferences saved" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <>
              {email ? (
                <p className="text-xs text-muted-foreground">
                  Managing preferences for <span className="font-semibold">{email}</span>
                </p>
              ) : null}

              <label className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm">
                  <span className="font-semibold block">Weekly quest summary</span>
                  <span className="text-xs text-muted-foreground">Monday recap of your learner's adventures.</span>
                </span>
                <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
              </label>

              <label className="flex items-center justify-between gap-4 py-2 border-t">
                <span className="text-sm">
                  <span className="font-semibold block">Quest milestone nudges</span>
                  <span className="text-xs text-muted-foreground">Occasional highlights after big wins.</span>
                </span>
                <Switch checked={questNudges} onCheckedChange={setQuestNudges} />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" disabled={saving} onClick={() => { setWeeklySummary(false); setQuestNudges(false); }}>
                  Turn all off
                </Button>
                <Button size="sm" disabled={saving} onClick={save}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>

              {done ? <p className="text-xs text-emerald-600 pt-1">Preferences updated.</p> : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
