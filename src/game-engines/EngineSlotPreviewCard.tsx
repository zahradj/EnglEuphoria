/**
 * EngineSlotPreviewCard
 *
 * Creator-side preview + Pin controls for the Language Engine Slot.
 * Mirrors VocabGamesSlotPreviewCard for parity across creators.
 *
 * Pin scope = `{hub}:l{lessonNumber}` (falls back to lessonId). Deterministic
 * rotation (Story → Escape → Detective → Hidden Object) remains the default
 * when Auto is selected. Overrides are advisory: eligibility validators may
 * still swap the engine if the target CEFR/hub can't support it.
 */

import { useMemo } from "react";
import {
  LANGUAGE_ENGINE_SLOT_TYPES,
  type LanguageEngineSlotType,
} from "@/lib/engineSlotInjector";
import {
  getPinnedEngine,
  pinEngine,
  unpinEngine,
} from "@/lib/engineSlotOverrides";

interface EngineSlotPreviewCardProps {
  hub: "playground" | "academy" | "success";
  lessonNumber?: number;
  lessonId?: string;
  engineType: LanguageEngineSlotType | string;
  title?: string;
  objective?: string;
  targetWords?: string[];
  mode?: "lesson" | "review" | "quiz";
  onChange?: () => void;
}

const LABEL: Record<LanguageEngineSlotType, string> = {
  story_engine_slot: "Story Quest",
  escape_room_slot: "Escape Room",
  detective_mystery_slot: "Detective",
  hidden_object_slot: "Hidden Object",
};

const EMOJI: Record<LanguageEngineSlotType, string> = {
  story_engine_slot: "📖",
  escape_room_slot: "🔐",
  detective_mystery_slot: "🕵️",
  hidden_object_slot: "🔍",
};

function buildPeek(
  engine: LanguageEngineSlotType,
  words: string[],
): { label: string; body: string } {
  const w1 = words[0] ?? "the clue";
  const w2 = words[1] ?? "the path";
  switch (engine) {
    case "story_engine_slot":
      return {
        label: "Opening node",
        body: `You spot ${w1} on the trail. Do you follow it, or wait for ${w2}?`,
      };
    case "escape_room_slot":
      return {
        label: "First puzzle",
        body: `Unlock the door: match "${w1}" to its clue, then combine with "${w2}".`,
      };
    case "detective_mystery_slot":
      return {
        label: "Case file",
        body: `Witness mentions "${w1}" near the scene. Cross-check with "${w2}" to narrow suspects.`,
      };
    case "hidden_object_slot":
      return {
        label: "Scene brief",
        body: `Find "${w1}" and "${w2}" hidden in the room. Tap each object as you spot it.`,
      };
  }
}

export function EngineSlotPreviewCard({
  hub,
  lessonNumber,
  lessonId,
  engineType,
  title,
  objective,
  targetWords = [],
  mode = "lesson",
  onChange,
}: EngineSlotPreviewCardProps) {
  const scopeId = useMemo(
    () =>
      lessonNumber != null
        ? `${hub}:l${lessonNumber}`
        : lessonId
          ? `${hub}:${lessonId}`
          : `${hub}:unknown`,
    [hub, lessonNumber, lessonId],
  );
  const pinned = getPinnedEngine(scopeId);
  const active = (engineType as LanguageEngineSlotType) || "story_engine_slot";

  const handlePin = (next: LanguageEngineSlotType | null) => {
    if (next) pinEngine(scopeId, next);
    else unpinEngine(scopeId);
    onChange?.();
  };

  return (
    <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{EMOJI[active] ?? "🧭"}</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-700">
              Language Engine · {mode}
            </p>
            <p className="text-base font-extrabold text-[#3a1d0a]">
              {title || LABEL[active] || "Language Engine"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-purple-700">
          {pinned ? "Pinned" : "Auto"}
        </span>
      </div>

      {objective ? (
        <p className="mt-2 text-sm font-semibold text-[#3a1d0a]/80">{objective}</p>
      ) : null}

      {targetWords.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {targetWords.slice(0, 8).map((w) => (
            <span
              key={w}
              className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-bold text-purple-700"
            >
              {w}
            </span>
          ))}
        </div>
      ) : null}



      {(() => {
        const peek = buildPeek(active, targetWords);
        return (
          <div className="mt-3 rounded-xl border border-purple-200 bg-white/70 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-700">
              Peek · {peek.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3a1d0a]/90">
              {peek.body}
            </p>
          </div>
        );
      })()}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => handlePin(null)}
          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest transition ${
            pinned == null
              ? "bg-purple-600 text-white"
              : "bg-white text-purple-700 hover:bg-purple-100"
          }`}
        >
          Auto
        </button>
        {LANGUAGE_ENGINE_SLOT_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handlePin(t)}
            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest transition ${
              pinned === t
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-700 hover:bg-purple-100"
            }`}
          >
            {EMOJI[t]} {LABEL[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EngineSlotPreviewCard;
