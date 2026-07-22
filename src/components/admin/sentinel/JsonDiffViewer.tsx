import { useMemo } from "react";

interface Props {
  before: unknown;
  after: unknown;
}

function pretty(v: unknown): string {
  try {
    return JSON.stringify(v ?? {}, null, 2);
  } catch {
    return String(v);
  }
}

export function JsonDiffViewer({ before, after }: Props) {
  const left = useMemo(() => pretty(before), [before]);
  const right = useMemo(() => pretty(after), [after]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 overflow-hidden">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-destructive border-b border-destructive/20">
          Current (broken)
        </div>
        <pre className="p-3 text-xs font-mono overflow-auto max-h-[500px] whitespace-pre-wrap break-words">
          {left}
        </pre>
      </div>
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 border-b border-emerald-500/20">
          Proposed patch
        </div>
        <pre className="p-3 text-xs font-mono overflow-auto max-h-[500px] whitespace-pre-wrap break-words">
          {right}
        </pre>
      </div>
    </div>
  );
}
