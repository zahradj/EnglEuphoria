import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type MapNodeState = "locked" | "available" | "current" | "complete";

interface MapNodeProps {
  emoji: string;
  label: string;
  sublabel?: string;
  state: MapNodeState;
  onClick?: () => void;
  badgeCount?: number;
}

/**
 * A single themed node on the Playground Adventure Map.
 * Visual states: locked (dim) / available (soft) / current (orange glow) / complete (check).
 */
export function MapNode({ emoji, label, sublabel, state, onClick, badgeCount }: MapNodeProps) {
  const isLocked = state === "locked";
  const isCurrent = state === "current";
  const isComplete = state === "complete";

  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={cn(
        "group relative flex flex-col items-center gap-2 transition-transform",
        !isLocked && "hover:-translate-y-1 active:translate-y-0",
      )}
      aria-label={`${label} ${state}`}
    >
      <div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center rounded-full text-5xl",
          "border-4 transition-all",
          isLocked && "border-muted bg-muted/40 text-muted-foreground/50 grayscale",
          state === "available" &&
            "border-[#FE6A2F]/30 bg-[#FEFBDD] text-foreground shadow-md",
          isCurrent &&
            "border-[#FE6A2F] bg-[#FEFBDD] text-foreground shadow-[0_0_0_8px_rgba(254,106,47,0.18),0_10px_30px_-10px_rgba(254,106,47,0.6)] animate-pulse",
          isComplete && "border-emerald-400 bg-emerald-50 text-foreground shadow-md",
        )}
      >
        <span aria-hidden>{emoji}</span>
        {isComplete && (
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
            <Check className="h-4 w-4" />
          </span>
        )}
        {isLocked && (
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground shadow">
            <Lock className="h-3.5 w-3.5" />
          </span>
        )}
        {!!badgeCount && badgeCount > 0 && (
          <span className="absolute -bottom-1 -right-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#FE6A2F] px-1.5 text-xs font-bold text-white shadow">
            {badgeCount}
          </span>
        )}
      </div>
      <div className="text-center">
        <div
          className={cn(
            "text-sm font-extrabold tracking-tight",
            isLocked ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {label}
        </div>
        {sublabel && (
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
    </button>
  );
}
