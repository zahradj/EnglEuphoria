/**
 * CodeViewerModal — shows the current PlaygroundUnit as JSON so the user
 * can copy or download the full lesson/unit code. Read-only.
 */
import { useEffect, useMemo, useState } from "react";
import { Copy, Download, X, Check } from "lucide-react";
import type { PlaygroundUnit } from "@/playground-blueprint/types";

interface Props {
  open: boolean;
  unit: PlaygroundUnit;
  lessonNumber: number;
  onClose: () => void;
}

type Scope = "unit" | "lesson";

export function CodeViewerModal({ open, unit, lessonNumber, onClose }: Props) {
  const [scope, setScope] = useState<Scope>("lesson");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    const payload =
      scope === "unit"
        ? unit
        : unit.lessons.find((l) => l.lesson_number === lessonNumber) ?? unit.lessons[0];
    return JSON.stringify(payload, null, 2);
  }, [scope, unit, lessonNumber]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — user can still select & copy */
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = scope === "unit"
      ? `playground-unit-${(unit.unit_topic || "unit").replace(/\s+/g, "-").toLowerCase()}.json`
      : `playground-lesson-${lessonNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-2 border-b border-orange-100 bg-orange-50/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-orange-900">Lesson code</h2>
            <div className="inline-flex rounded-full border border-orange-200 bg-white p-0.5 text-xs font-semibold">
              {(["lesson", "unit"] as Scope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`rounded-full px-3 py-1 capitalize transition ${
                    scope === s ? "bg-[#FE6A2F] text-white shadow" : "text-orange-900 hover:bg-orange-50"
                  }`}
                >
                  {s === "lesson" ? `Lesson ${lessonNumber}` : "Full unit"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-3 py-1.5 text-xs font-bold text-orange-900 hover:bg-orange-50"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={download}
              className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-3 py-1.5 text-xs font-bold text-orange-900 hover:bg-orange-50"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-orange-900 hover:bg-orange-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <pre className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
