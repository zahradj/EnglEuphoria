import { AlertOctagon } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import type { SentinelIncident } from "@/pages/admin/SentinelDashboard";

export function ProblemPanel({ incident }: { incident: SentinelIncident }) {
  const stack = [incident.error_message, incident.error_stack].filter(Boolean).join("\n\n");

  return (
    <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
          <AlertOctagon className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">The Problem</div>
          <div className="text-sm font-semibold">What broke</div>
        </div>
      </div>

      <div className="text-base leading-relaxed text-foreground">
        {incident.cto_explanation || (
          <span className="text-muted-foreground italic">No CTO explanation provided.</span>
        )}
      </div>

      <div className="mt-auto">
        <CodeBlock
          title="Error & Stack Trace"
          content={stack || "(no error captured)"}
          tone="destructive"
        />
      </div>
    </div>
  );
}
