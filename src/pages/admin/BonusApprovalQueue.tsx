import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Check, X, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useBonusPolicy } from "@/hooks/useBonusPolicy";

type LedgerRow = {
  id: string;
  teacher_user_id: string;
  amount: number;
  currency: string;
  period_start: string;
  period_end: string;
  classes_count: number;
  rate_applied: number;
  status: string;
  notes: string | null;
  created_at: string;
  teacher_name?: string;
  teacher_email?: string;
  teacher_first_name?: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  paid: "bg-emerald-500",
  rejected: "bg-red-500",
};

const POLICY_FIELDS: Array<{ key: string; label: string; suffix?: string }> = [
  { key: "tier_elite_threshold", label: "Elite ≥", suffix: "score" },
  { key: "tier_elite_pct", label: "Elite bonus", suffix: "%" },
  { key: "tier_excellent_threshold", label: "Excellent ≥", suffix: "score" },
  { key: "tier_excellent_pct", label: "Excellent bonus", suffix: "%" },
  { key: "tier_strong_threshold", label: "Strong ≥", suffix: "score" },
  { key: "tier_strong_pct", label: "Strong bonus", suffix: "%" },
  { key: "tier_ontrack_threshold", label: "On-Track ≥", suffix: "score" },
  { key: "tier_ontrack_pct", label: "On-Track bonus", suffix: "%" },
  { key: "kicker_threshold", label: "Kicker sub-score ≥", suffix: "score" },
  { key: "kicker_pct_each", label: "Kicker each", suffix: "%" },
  { key: "kicker_max_pct", label: "Kicker cap", suffix: "%" },
];

export default function BonusApprovalQueue() {
  const { user } = useAuth();
  const { policy, save: savePolicy } = useBonusPolicy();
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyDraft, setPolicyDraft] = useState<Record<string, number>>({});
  const [rejectFor, setRejectFor] = useState<LedgerRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    const q = supabase
      .from("teacher_payouts_ledger")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter === "pending") q.eq("status", "pending");
    const { data: ledger, error } = await q;
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const ids = Array.from(new Set((ledger ?? []).map((r: any) => r.teacher_user_id)));
    const { data: users } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const byId = new Map((users ?? []).map((u: any) => [u.id, u]));
    setRows((ledger ?? []).map((r: any) => {
      const u: any = byId.get(r.teacher_user_id) ?? {};
      return {
        ...r,
        teacher_name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email || "Unknown",
        teacher_email: u.email,
        teacher_first_name: u.first_name,
      };
    }));
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const sendNotification = async (row: LedgerRow, decision: "paid" | "rejected", reason?: string) => {
    if (!row.teacher_email) return;
    const template = decision === "paid" ? "teacher-bonus-approved" : "teacher-bonus-rejected";
    const templateData: Record<string, unknown> = {
      teacherName: row.teacher_first_name ?? row.teacher_name,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      dashboardUrl: "https://engleuphoria.com/teacher/kpi",
    };
    if (decision === "paid") {
      Object.assign(templateData, {
        amount: Number(row.amount),
        currency: row.currency ?? "USD",
        ratePct: Number(row.rate_applied),
        notes: row.notes ?? undefined,
      });
    } else if (reason) {
      templateData.reason = reason;
    }
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: template,
        recipientEmail: row.teacher_email,
        idempotencyKey: `bonus-${decision}-${row.id}`,
        templateData,
      },
    });
  };

  const decide = async (row: LedgerRow, decision: "paid" | "rejected", reason?: string) => {
    setBusy(row.id);
    const patch: Record<string, unknown> = { status: decision, paid_by: user?.id ?? null };
    if (decision === "paid") patch.paid_at = new Date().toISOString();
    if (decision === "rejected" && reason) {
      patch.notes = row.notes ? `${row.notes}\n[Rejected]: ${reason}` : `[Rejected]: ${reason}`;
    }
    const { error } = await supabase
      .from("teacher_payouts_ledger")
      .update(patch)
      .eq("id", row.id);
    if (error) {
      setBusy(null);
      toast.error(error.message);
      return;
    }
    await sendNotification(row, decision, reason);
    setBusy(null);
    toast.success(decision === "paid" ? "Bonus approved & teacher notified" : "Bonus rejected & teacher notified");
    await load();
  };

  const openPolicy = () => {
    setPolicyDraft(POLICY_FIELDS.reduce((acc, f) => {
      acc[f.key] = Number((policy as any)[f.key]);
      return acc;
    }, {} as Record<string, number>));
    setPolicyOpen(true);
  };

  const commitPolicy = async () => {
    const { error } = await savePolicy(policyDraft as any);
    if (error) toast.error(error.message);
    else {
      toast.success("Bonus policy updated");
      setPolicyOpen(false);
    }
  };

  const totalPending = rows.filter((r) => r.status === "pending")
    .reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary" /> Bonus Approval Queue
          </h1>
          <p className="text-muted-foreground">
            Review KPI-driven bonuses queued from the Teacher KPI dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openPolicy}>
            <Settings2 className="w-4 h-4 mr-1" /> Policy
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} size="sm"
            onClick={() => setFilter("pending")}>Pending</Button>
          <Button variant={filter === "all" ? "default" : "outline"} size="sm"
            onClick={() => setFilter("all")}>All</Button>
        </div>
      </header>

      {filter === "pending" && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Pending total</div>
              <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
            </div>
            <Badge variant="secondary">{rows.length} awaiting approval</Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              {filter === "pending" ? "No pending bonuses." : "No bonus records yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.teacher_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.period_start} → {r.period_end}
                      </TableCell>
                      <TableCell>{r.classes_count}</TableCell>
                      <TableCell className="font-mono">{Number(r.rate_applied).toFixed(0)}%</TableCell>
                      <TableCell className="font-mono font-bold text-emerald-600">
                        ${Number(r.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[r.status] ?? "bg-muted"} text-white border-0`}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {r.notes ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" disabled={busy === r.id}
                              onClick={() => { setRejectFor(r); setRejectReason(""); }}>
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                            <Button size="sm" disabled={busy === r.id}
                              onClick={() => decide(r, "paid")}>
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bonus Policy</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Tier thresholds (0–100) and payout percentages of last-30-day earnings.
            Kickers add a bonus per sub-score above the threshold.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {POLICY_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number" step="0.5"
                    value={policyDraft[f.key] ?? 0}
                    onChange={(e) =>
                      setPolicyDraft((d) => ({ ...d, [f.key]: Number(e.target.value) }))}
                  />
                  <span className="text-xs text-muted-foreground w-10">{f.suffix}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyOpen(false)}>Cancel</Button>
            <Button onClick={commitPolicy}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject bonus for {rejectFor?.teacher_name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Add a short, kind note. It's included in the teacher's notification email.
          </p>
          <Textarea
            placeholder="e.g. Below threshold this cycle — keep going, next period resets."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={busy === rejectFor?.id}
              onClick={async () => {
                if (!rejectFor) return;
                const row = rejectFor;
                setRejectFor(null);
                await decide(row, "rejected", rejectReason.trim() || undefined);
              }}
            >
              Reject & notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
