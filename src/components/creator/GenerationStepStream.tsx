/**
 * GenerationStepStream — Academy-style live timeline of what the
 * unit/lesson generator is doing right now. Drop-in component used by
 * the Playground Creator (and reusable by other hubs).
 *
 * Steps are controlled by the parent via the `steps` prop. Each step
 * has an id, label, status ("pending" | "active" | "done" | "error"),
 * and optional `payload` (the partial JSON for that step). When the
 * user clicks a done step it expands so they can review the slice the
 * brain produced.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Check, AlertCircle, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "active" | "done" | "error";

export interface GenerationStep {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
  payload?: unknown;
}

interface Props {
  open: boolean;
  title?: string;
  steps: GenerationStep[];
  onClose?: () => void;
}

export function GenerationStepStream({ open, title = "Generating unit…", steps, onClose }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#FE6A2F]" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <ol className="mt-2 space-y-2">
          {steps.map((s) => {
            const isOpen = !!expanded[s.id];
            const hasPayload = s.payload !== undefined && s.payload !== null;
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-xl border bg-white/70 px-3 py-2 text-sm transition",
                  s.status === "active" && "border-[#FE6A2F]/60 shadow-sm",
                  s.status === "done" && "border-emerald-200",
                  s.status === "error" && "border-red-300 bg-red-50/70",
                  s.status === "pending" && "border-gray-200 opacity-60",
                )}
              >
                <button
                  type="button"
                  onClick={() => hasPayload && toggle(s.id)}
                  className="flex w-full items-center gap-2 text-left"
                  disabled={!hasPayload}
                >
                  <StatusIcon status={s.status} />
                  <span className="flex-1 font-medium text-[#3a1d0a]">{s.label}</span>
                  {s.detail && <span className="text-xs text-gray-500">{s.detail}</span>}
                  {hasPayload &&
                    (isOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    ))}
                </button>
                {isOpen && hasPayload && (
                  <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                    {safeStringify(s.payload)}
                  </pre>
                )}
              </li>
            );
          })}
        </ol>
      </DialogContent>
    </Dialog>
  );
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "active") return <Loader2 className="h-4 w-4 animate-spin text-[#FE6A2F]" />;
  if (status === "done") return <Check className="h-4 w-4 text-emerald-600" />;
  if (status === "error") return <AlertCircle className="h-4 w-4 text-red-600" />;
  return <Circle className="h-4 w-4 text-gray-300" />;
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
