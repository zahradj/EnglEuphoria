import { useMemo, useRef, useState } from "react";
import { getHiddenObjectProfile } from "./hubProfiles";
import type { HiddenObjectScene } from "./types";

export interface HiddenObjectSlotProps {
  scene: HiddenObjectScene;
  onComplete?: (result: {
    sceneId: string;
    misses: number;
    hintsUsed: number;
    durationMs: number;
    order: string[];
  }) => void;
  /** Optional per-find hook (e.g. Game Intelligence signaling). */
  onSignal?: (event: {
    kind: "hit" | "miss" | "hint";
    label?: string;
    latencyMs: number;
  }) => void;
}

/**
 * Deterministic Hidden Object runner.
 * Renders the AI-generated scene image and overlays invisible normalised hitboxes.
 * Compassionate hint appears after N misses (hub-gated). No text baked into image.
 */
export function HiddenObjectSlot({
  scene,
  onComplete,
  onSignal,
}: HiddenObjectSlotProps) {
  const profile = getHiddenObjectProfile(scene.hub);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());
  const lastClickAt = useRef<number>(Date.now());
  const order = useRef<string[]>([]);

  const currentIndex = useMemo(
    () => scene.targets.findIndex((t) => !found.has(t.label)),
    [scene.targets, found],
  );
  const current = currentIndex >= 0 ? scene.targets[currentIndex] : null;
  const done = currentIndex === -1;

  function handleSceneClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const dx = nx - current.x;
    const dy = ny - current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const now = Date.now();
    const latency = now - lastClickAt.current;
    lastClickAt.current = now;

    if (dist <= current.radius) {
      const next = new Set(found);
      next.add(current.label);
      order.current.push(current.label);
      setFound(next);
      setShowHint(false);
      setFeedback(
        current.definition
          ? `✅ ${current.label} — ${current.definition}`
          : `✅ ${current.label}`,
      );
      onSignal?.({ kind: "hit", label: current.label, latencyMs: latency });

      if (next.size === scene.targets.length) {
        onComplete?.({
          sceneId: scene.id,
          misses,
          hintsUsed,
          durationMs: Date.now() - startedAt.current,
          order: order.current,
        });
      }
    } else {
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      setFeedback("Not quite — look again.");
      onSignal?.({ kind: "miss", label: current.label, latencyMs: latency });
      if (nextMisses > 0 && nextMisses % profile.hintAfterMisses === 0) {
        setShowHint(true);
        setHintsUsed((h) => h + 1);
        onSignal?.({ kind: "hint", label: current.label, latencyMs: latency });
      }
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="rounded-xl border bg-card p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">🔍 Hidden Object</span>
          <span className="text-muted-foreground">
            {found.size}/{scene.targets.length} found · {misses} miss
            {misses === 1 ? "" : "es"}
          </span>
        </div>
        {scene.intro && !found.size ? (
          <p className="mt-2 text-sm text-muted-foreground">{scene.intro}</p>
        ) : null}
        {current ? (
          <p className="mt-2 text-base font-medium">
            {current.prompt}
            {current.preposition ? (
              <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                ({current.preposition})
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-2 text-base font-medium">
            🎉 {scene.outro ?? "You found everything!"}
          </p>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleSceneClick}
        className="relative w-full overflow-hidden rounded-2xl border bg-muted"
        style={{ aspectRatio: "16 / 10", cursor: done ? "default" : "crosshair" }}
      >
        {scene.image_url ? (
          <img
            src={scene.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Scene image pending…
          </div>
        )}

        {/* Found markers */}
        {scene.targets
          .filter((t) => found.has(t.label))
          .map((t) => (
            <div
              key={t.label}
              className="absolute rounded-full border-2 border-emerald-500 bg-emerald-500/20 pointer-events-none"
              style={{
                left: `${(t.x - t.radius) * 100}%`,
                top: `${(t.y - t.radius) * 100}%`,
                width: `${t.radius * 2 * 100}%`,
                height: `${t.radius * 2 * 100}%`,
              }}
            />
          ))}

        {/* Compassionate hint ring */}
        {current && showHint ? (
          <div
            className="absolute rounded-full border-2 border-amber-400 animate-pulse pointer-events-none"
            style={{
              left: `${(current.x - current.radius * 1.6) * 100}%`,
              top: `${(current.y - current.radius * 1.6) * 100}%`,
              width: `${current.radius * 3.2 * 100}%`,
              height: `${current.radius * 3.2 * 100}%`,
            }}
          />
        ) : null}
      </div>

      {feedback ? (
        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

export default HiddenObjectSlot;
