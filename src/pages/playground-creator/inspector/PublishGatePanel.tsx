/**
 * PublishGatePanel — inline verdict strip showing whether the currently-
 * opened lesson would pass the publish gate.
 *
 * Reads from `curriculum_lessons` for the given lessonId:
 *   • qa_verdict / qa_report        → QA pipeline
 *   • governance_status / _report   → Governance
 *   • lesson_state.stabilization    → Stabilization engine
 *   • lesson_state.coherence        → Coherence engine
 *
 * No writes. Renders read-only pills the teacher can scan before hitting
 * publish. If the lesson has not been saved yet (no lessonId), the panel
 * shows an inert placeholder.
 */
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Verdict = "publish" | "repair" | "block" | "unknown";

interface GateRow {
  qa_verdict: string | null;
  qa_report: unknown;
  governance_status: string | null;
  governance_report: unknown;
  lesson_state: unknown;
  is_published: boolean | null;
}

interface EnginePill {
  key: string;
  label: string;
  verdict: Verdict;
  detail?: string;
}

function toVerdict(v: string | null | undefined): Verdict {
  if (!v) return "unknown";
  const s = v.toLowerCase();
  if (s === "publish" || s === "pass" || s === "ok") return "publish";
  if (s === "block" || s === "fail" || s === "blocked") return "block";
  if (s === "repair" || s === "warn" || s === "warning") return "repair";
  return "unknown";
}

function extractEngine(state: unknown, key: string): { verdict: Verdict; detail?: string } | null {
  if (!state || typeof state !== "object") return null;
  const bag = (state as Record<string, unknown>)[key];
  if (!bag || typeof bag !== "object") return null;
  const b = bag as Record<string, unknown>;
  const verdict = toVerdict(String(b.verdict ?? b.status ?? ""));
  const errors = Array.isArray(b.errors) ? (b.errors as unknown[]).length : 0;
  const warnings = Array.isArray(b.warnings) ? (b.warnings as unknown[]).length : 0;
  const detail = errors || warnings
    ? `${errors} error${errors === 1 ? "" : "s"} · ${warnings} warning${warnings === 1 ? "" : "s"}`
    : undefined;
  return { verdict, detail };
}

export function PublishGatePanel({ lessonId }: { lessonId?: string | null }) {
  const [row, setRow] = useState<GateRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId) { setRow(null); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("curriculum_lessons")
        .select("qa_verdict,qa_report,governance_status,governance_report,lesson_state,is_published")
        .eq("id", lessonId)
        .maybeSingle();
      if (!cancelled) {
        setRow((data as GateRow | null) ?? null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  if (!lessonId) {
    return (
      <div className="rounded-xl border border-orange-200 bg-white/60 px-3 py-2 text-[11px] text-orange-700">
        Publish gate: not saved yet. Save the lesson to see QA / governance / stabilization verdicts.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white/60 px-3 py-2 text-[11px] text-orange-700">
        <Loader2 className="h-3 w-3 animate-spin" /> Checking publish gate…
      </div>
    );
  }

  if (!row) {
    return (
      <div className="rounded-xl border border-orange-200 bg-white/60 px-3 py-2 text-[11px] text-orange-700">
        No verdict recorded yet — trigger a QA run to populate.
      </div>
    );
  }

  const qaReport = (row.qa_report ?? {}) as Record<string, unknown>;
  const govReport = (row.governance_report ?? {}) as Record<string, unknown>;
  const qaErrors = Array.isArray(qaReport.errors) ? (qaReport.errors as unknown[]).length : 0;
  const qaWarnings = Array.isArray(qaReport.warnings) ? (qaReport.warnings as unknown[]).length : 0;
  const govErrors = Array.isArray(govReport.errors) ? (govReport.errors as unknown[]).length : 0;

  const pills: EnginePill[] = [
    {
      key: "qa",
      label: "QA",
      verdict: toVerdict(row.qa_verdict),
      detail: qaErrors || qaWarnings ? `${qaErrors} err · ${qaWarnings} warn` : undefined,
    },
    {
      key: "governance",
      label: "Governance",
      verdict: toVerdict(row.governance_status),
      detail: govErrors ? `${govErrors} err` : undefined,
    },
  ];

  const stab = extractEngine(row.lesson_state, "stabilization");
  if (stab) pills.push({ key: "stab", label: "Stabilization", verdict: stab.verdict, detail: stab.detail });
  const coh = extractEngine(row.lesson_state, "coherence");
  if (coh) pills.push({ key: "coh", label: "Coherence", verdict: coh.verdict, detail: coh.detail });

  const overall: Verdict = pills.some((p) => p.verdict === "block")
    ? "block"
    : pills.some((p) => p.verdict === "repair")
      ? "repair"
      : pills.every((p) => p.verdict === "publish")
        ? "publish"
        : "unknown";

  return (
    <div className="rounded-xl border border-orange-200 bg-white/70 p-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
          Publish gate
        </div>
        <OverallBadge verdict={overall} published={!!row.is_published} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {pills.map((p) => <Pill key={p.key} pill={p} />)}
      </div>
    </div>
  );
}

function Pill({ pill }: { pill: EnginePill }) {
  const tone = TONE[pill.verdict];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.bg} ${tone.text}`}>
      {tone.icon}
      <span>{pill.label}</span>
      {pill.detail && <span className="opacity-70">· {pill.detail}</span>}
    </span>
  );
}

function OverallBadge({ verdict, published }: { verdict: Verdict; published: boolean }) {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
        <CheckCircle2 className="h-3 w-3" /> Published
      </span>
    );
  }
  const tone = TONE[verdict];
  const label = verdict === "publish" ? "Ready" : verdict === "repair" ? "Needs repair" : verdict === "block" ? "Blocked" : "Unknown";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone.bg} ${tone.text}`}>
      {tone.icon} {label}
    </span>
  );
}

const TONE: Record<Verdict, { bg: string; text: string; icon: JSX.Element }> = {
  publish: { bg: "bg-emerald-100", text: "text-emerald-800", icon: <CheckCircle2 className="h-3 w-3" /> },
  repair:  { bg: "bg-amber-100",   text: "text-amber-800",   icon: <AlertTriangle className="h-3 w-3" /> },
  block:   { bg: "bg-rose-100",    text: "text-rose-800",    icon: <ShieldAlert className="h-3 w-3" /> },
  unknown: { bg: "bg-orange-100",  text: "text-orange-700",  icon: <Loader2 className="h-3 w-3" /> },
};
