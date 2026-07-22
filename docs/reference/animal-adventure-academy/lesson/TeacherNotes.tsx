import { useState, type ReactNode } from "react";
import { ClipboardList, ChevronDown } from "lucide-react";

type Props = {
  title?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

/**
 * TeacherNotes — collapsible panel intended for the teacher / facilitator.
 * Hidden by default so students don't see it. Toggle with a tap.
 */
export function TeacherNotes({ title = "Teacher notes", children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 rounded-2xl border border-dashed border-[color:var(--playground-primary)]/40 bg-white/40 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-bold text-[color:var(--playground-ink)]/70 transition hover:text-[color:var(--playground-ink)]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-[color:var(--playground-primary)]/20 px-4 py-3 text-sm leading-relaxed text-[color:var(--playground-ink)]/80">
          {children}
        </div>
      )}
    </div>
  );
}
