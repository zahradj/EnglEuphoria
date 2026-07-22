import { useNavigate } from "react-router-dom";
import { MapNode, type MapNodeState } from "./MapNode";

export interface AdventureMapNodeDef {
  id: string;
  emoji: string;
  label: string;
  sublabel?: string;
  route: string;
  badgeCount?: number;
}

/**
 * Universal English-learning blueprint — topic-agnostic.
 * Same 9 stages render for Animals, Food, Family, Weather, etc.
 * The route per stage stays stable; the *content* swaps based on the active unit.
 */
const DEFAULT_NODES: AdventureMapNodeDef[] = [
  { id: "warmup",     emoji: "🌟", label: "Warm-Up",         sublabel: "Stage 1", route: "/playground-demo" },
  { id: "vocab",      emoji: "📚", label: "Vocabulary",      sublabel: "Stage 2", route: "/playground-demo" },
  { id: "language",   emoji: "🧩", label: "Language Focus",  sublabel: "Stage 3", route: "/playground-demo" },
  { id: "practice",   emoji: "🎮", label: "Practice",        sublabel: "Stage 4", route: "/playground-demo" },
  { id: "input",      emoji: "📖", label: "Reading & Listening", sublabel: "Stage 5", route: "/playground-demo" },
  { id: "speaking",   emoji: "🎤", label: "Speaking",        sublabel: "Stage 6", route: "/playground-demo" },
  { id: "review",     emoji: "🔄", label: "Review",          sublabel: "Stage 7", route: "/playground-demo" },
  { id: "assessment", emoji: "⚔️", label: "Assessment",      sublabel: "Stage 8", route: "/playground-demo" },
  { id: "reward",     emoji: "🏆", label: "Reward",          sublabel: "Stage 9", route: "/playground-demo" },
];

interface AdventureMapProps {
  /** Index of node the student is currently on (0-based). Earlier nodes = complete, later = locked. */
  currentIndex?: number;
  nodes?: AdventureMapNodeDef[];
  /** Unit title shown in the header — the topic swaps, the blueprint stays. */
  unitTitle?: string;
  unitSubtitle?: string;
}

/**
 * The Playground Hub Adventure Map.
 * Renders a zig-zag path of themed nodes with locked/current/complete states.
 * Hub orange (#FE6A2F) glow marks the current node — Pip stands beside it.
 */
export function AdventureMap({
  currentIndex = 0,
  nodes = DEFAULT_NODES,
  unitTitle = "Your Learning Adventure",
  unitSubtitle = "Every unit follows the same journey — only the topic changes.",
}: AdventureMapProps) {
  const navigate = useNavigate();

  const stateFor = (i: number): MapNodeState => {
    if (i < currentIndex) return "complete";
    if (i === currentIndex) return "current";
    if (i === currentIndex + 1) return "available";
    return "locked";
  };

  return (
    <div className="relative mx-auto w-full max-w-[720px] px-4 py-8">
      {/* Sky background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl"
        style={{
          background:
            "radial-gradient(ellipse at top, #FEFBDD 0%, #FFF4E6 45%, #FFE4CC 100%)",
        }}
      />

      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tight text-foreground">{unitTitle}</h1>
        <p className="text-sm text-muted-foreground">{unitSubtitle}</p>
      </header>

      <ol className="relative flex flex-col items-stretch gap-8">
        {nodes.map((node, i) => {
          const alignRight = i % 2 === 1;
          const state = stateFor(i);
          const isCurrent = state === "current";
          return (
            <li
              key={node.id}
              className={`relative flex ${alignRight ? "justify-end" : "justify-start"}`}
            >
              {/* dashed connector to next */}
              {i < nodes.length - 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-full h-8 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-[#FE6A2F]/40"
                />
              )}
              <div className="relative flex items-end gap-3">
                {/* Pip mascot marker on current node */}
                {isCurrent && (
                  <span
                    aria-label="Pip is here"
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl drop-shadow"
                  >
                    📍
                  </span>
                )}
                <MapNode
                  emoji={node.emoji}
                  label={node.label}
                  sublabel={node.sublabel}
                  state={state}
                  badgeCount={node.badgeCount}
                  onClick={() => navigate(node.route)}
                />
              </div>
            </li>
          );
        })}

        {/* Final reward */}
        <li className="flex justify-center pt-2">
          <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#FE6A2F]/40 bg-[#FEFBDD]/60 px-6 py-3">
            <span className="text-3xl" aria-hidden>🏆</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FE6A2F]">
              Animal Master Badge
            </span>
          </div>
        </li>
      </ol>
    </div>
  );
}
