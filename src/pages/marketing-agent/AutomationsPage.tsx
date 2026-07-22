import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Play, Trash2, ArrowLeft, Zap, Clock, CheckCircle2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Automation = {
  id: string;
  name: string;
  automation_type: string;
  cron_expression: string;
  params: Record<string, unknown>;
  enabled: boolean;
  last_run_at: string | null;
  last_run_status: string | null;
};

type Run = {
  id: string;
  status: string;
  output: { text?: string } | null;
  error: string | null;
  started_at: string;
  finished_at: string | null;
};

const TYPES = [
  { value: "weekly_seo_audit", label: "Weekly SEO audit" },
  { value: "daily_ad_creative_refresh", label: "Daily ad creative refresh" },
  { value: "onboarding_email_drip", label: "Onboarding email drip" },
  { value: "weekly_content_brief", label: "Weekly content briefs" },
  { value: "monthly_pricing_review", label: "Monthly pricing review" },
  { value: "custom_prompt", label: "Custom prompt" },
];

const CRON_PRESETS = [
  { value: "0 9 * * 1", label: "Weekly (Mon 09:00)" },
  { value: "0 9 * * *", label: "Daily (09:00)" },
  { value: "0 9 1 * *", label: "Monthly (1st, 09:00)" },
  { value: "0 */6 * * *", label: "Every 6 hours" },
];

export default function AutomationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Automation | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("marketing_agent_automations")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as Automation[]) ?? []);
    setLoading(false);
  };

  const loadRuns = async (automationId: string) => {
    const { data } = await supabase
      .from("marketing_agent_automation_runs")
      .select("*")
      .eq("automation_id", automationId)
      .order("started_at", { ascending: false })
      .limit(10);
    setRuns((data as Run[]) ?? []);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (selected) loadRuns(selected.id);
    else setRuns([]);
  }, [selected]);

  const toggle = async (a: Automation, enabled: boolean) => {
    await supabase.from("marketing_agent_automations").update({ enabled }).eq("id", a.id);
    load();
  };

  const remove = async (a: Automation) => {
    if (!confirm(`Delete automation "${a.name}"?`)) return;
    await supabase.from("marketing_agent_automations").delete().eq("id", a.id);
    if (selected?.id === a.id) setSelected(null);
    load();
  };

  const runNow = async (a: Automation) => {
    setRunning(a.id);
    try {
      const { data, error } = await supabase.functions.invoke(
        "marketing-agent-automation-runner",
        { body: { automationId: a.id } },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Automation complete", description: "Latest output ready." });
      load();
      if (selected?.id === a.id) loadRuns(a.id);
      setSelected({ ...a });
    } catch (e: any) {
      toast({ title: "Run failed", description: e?.message ?? "error", variant: "destructive" });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50/50 via-background to-background dark:from-indigo-950/20">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <NavLink to="/marketing-agent" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Back to chat
            </NavLink>
            <h1 className="text-2xl font-semibold mt-1 flex items-center gap-2">
              <Zap className="h-6 w-6 text-indigo-600" /> Marketing Automations
            </h1>
            <p className="text-sm text-muted-foreground">
              Scheduled marketing jobs powered by the agent. Trigger manually or on a schedule.
            </p>
          </div>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New automation</Button>
            </DialogTrigger>
            <NewAutomationDialog onCreated={() => { setOpenNew(false); load(); }} />
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
            {!loading && items.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                No automations yet. Create one to run marketing work on a schedule.
              </Card>
            )}
            {items.map((a) => (
              <Card
                key={a.id}
                onClick={() => setSelected(a)}
                className={`p-4 cursor-pointer transition hover:border-primary/50 ${
                  selected?.id === a.id ? "border-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {TYPES.find((t) => t.value === a.automation_type)?.label ?? a.automation_type}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {a.cron_expression}
                      {a.last_run_at && (
                        <>
                          <span>·</span>
                          {a.last_run_status === "completed" ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-destructive" />
                          )}
                          {new Date(a.last_run_at).toLocaleString()}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={a.enabled} onCheckedChange={(v) => toggle(a, v)} onClick={(e) => e.stopPropagation()} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); runNow(a); }}
                      disabled={running === a.id}
                    >
                      {running === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); remove(a); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            {selected ? (
              <Card className="p-4">
                <div className="font-semibold mb-2">Latest runs — {selected.name}</div>
                {runs.length === 0 && <div className="text-sm text-muted-foreground">No runs yet. Click ▶ to run now.</div>}
                <div className="space-y-3">
                  {runs.map((r) => (
                    <div key={r.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Badge variant={r.status === "completed" ? "default" : r.status === "failed" ? "destructive" : "secondary"}>
                          {r.status}
                        </Badge>
                        {new Date(r.started_at).toLocaleString()}
                      </div>
                      {r.error && <div className="text-xs text-destructive">{r.error}</div>}
                      {r.output?.text && (
                        <div className="prose prose-sm dark:prose-invert max-w-none max-h-72 overflow-y-auto text-sm">
                          <ReactMarkdown>{r.output.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Select an automation to see its run history.
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewAutomationDialog({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("weekly_seo_audit");
  const [cron, setCron] = useState("0 9 * * 1");
  const [paramsText, setParamsText] = useState("{}");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true);
    try {
      let params: any = {};
      try { params = JSON.parse(paramsText || "{}"); } catch { throw new Error("Params must be valid JSON"); }
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not authenticated");
      const { error } = await supabase.from("marketing_agent_automations").insert({
        user_id: uid,
        name: name.trim() || TYPES.find((t) => t.value === type)?.label || "Automation",
        automation_type: type,
        cron_expression: cron,
        params,
        enabled: true,
      });
      if (error) throw error;
      toast({ title: "Automation created" });
      onCreated();
    } catch (e: any) {
      toast({ title: "Could not create", description: e?.message ?? "error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>New marketing automation</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly SEO audit — main site" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Schedule (cron)</label>
          <Select value={cron} onValueChange={setCron}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CRON_PRESETS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-[11px] text-muted-foreground mt-1">Scheduling requires pg_cron setup by an admin. You can always "Run now".</div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Params (JSON)</label>
          <Textarea
            value={paramsText}
            onChange={(e) => setParamsText(e.target.value)}
            className="font-mono text-xs min-h-[120px]"
            placeholder='{ "hub": "Academy", "audience": "adults 25-45" }'
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={create} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create automation
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
