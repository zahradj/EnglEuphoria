/**
 * LessonIntroBar — sits at the very top of the editor for the currently
 * selected lesson and provides:
 *   1. The branded "intro card" preview (EnglEuphoria logo + Playground
 *      brand colors + Level / Unit / Lesson chips + lesson title).
 *   2. A character picker — choose any Playground cast member to "star"
 *      in this lesson. The pick is stored on the lesson object as
 *      `starring_character` so it autosaves with the unit and is forwarded
 *      to every image-generation call as the locked lead.
 *   3. A live thumbnail of the chosen character impersonating the lesson
 *      topic (uses their preset image_prompt seed).
 */
import { useMemo } from "react";
import logoUrl from "@/assets/engleuphoria-logo.png";
import {
  PLAYGROUND_CAST_PRESETS,
  type PlaygroundCastPreset,
} from "@/constants/playgroundCastPresets";
import type {
  PlaygroundUnit,
  PlaygroundLessonContent,
} from "@/playground-blueprint/types";
import { PLAYGROUND_UNIT_LESSONS } from "@/playground-blueprint/unitTemplate";

const NO_CHARACTER = "__none__";

/**
 * Theme → preferred lead mascot. Matches the world to a personality:
 * adventure worlds → Charlie (brave), story/magic → Hoot (wise),
 * gentle/home → Bella (sweet), water/play → Daisy (splashy),
 * otherwise → Pip (signature).
 */
const THEME_LEAD: Array<{ test: RegExp; leadName: string }> = [
  { test: /space|rocket|planet|astronaut|galaxy|star|adventure|explore|jungle|dinosaur/i, leadName: "Charlie the Chick" },
  { test: /castle|dragon|fairy|magic|wizard|forest|woods|night|dream|story/i, leadName: "Hoot the Owl" },
  { test: /ocean|sea|beach|water|rain|puddle|swim|bath/i, leadName: "Daisy the Duckling" },
  { test: /family|home|garden|flower|kitchen|food|storytime|feelings|hug|friend/i, leadName: "Bella the Bunny" },
];

export function suggestLeadForTheme(theme?: string): PlaygroundCastPreset | null {
  const t = (theme || "").trim();
  if (!t) return null;
  const hit = THEME_LEAD.find((m) => m.test.test(t));
  const name = hit?.leadName ?? "Pip the Fox";
  return PLAYGROUND_CAST_PRESETS.find((c) => c.name === name) ?? null;
}

export interface LessonIntroBarProps {
  unit: PlaygroundUnit;
  lessonNumber: number;
  cefr?: string;
  onUnitChange: (next: PlaygroundUnit) => void;
}

export function LessonIntroBar({
  unit,
  lessonNumber,
  cefr,
  onUnitChange,
}: LessonIntroBarProps) {
  const lesson = unit.lessons.find((l) => l.lesson_number === lessonNumber);
  const template = PLAYGROUND_UNIT_LESSONS.find((l) => l.lesson_number === lessonNumber);
  const lessonTitle = template?.title ?? `Lesson ${lessonNumber}`;

  const starring = lesson?.starring_character;
  const supporting = (lesson as any)?.supporting_character as
    | { name: string; visual_blueprint?: string; voice_id?: string }
    | null
    | undefined;

  const selected = useMemo<PlaygroundCastPreset | null>(
    () =>
      PLAYGROUND_CAST_PRESETS.find((c) => c.name === starring?.name) ?? null,
    [starring?.name],
  );
  const selectedSupport = useMemo<PlaygroundCastPreset | null>(
    () =>
      PLAYGROUND_CAST_PRESETS.find((c) => c.name === supporting?.name) ?? null,
    [supporting?.name],
  );

  const unitTheme = (unit as any)?.unit_theme as string | undefined;
  const suggestion = useMemo(() => suggestLeadForTheme(unitTheme), [unitTheme]);
  const suggestionMatches = suggestion && selected?.name === suggestion.name;

  const patchLesson = (patch: Record<string, unknown>) => {
    onUnitChange({
      ...unit,
      lessons: unit.lessons.map((l) =>
        l.lesson_number === lessonNumber
          ? ({ ...l, ...patch } as PlaygroundLessonContent)
          : l,
      ),
    });
  };

  const setCharacter = (name: string) => {
    const character = PLAYGROUND_CAST_PRESETS.find((c) => c.name === name);
    patchLesson({
      starring_character: character
        ? {
            name: character.name,
            visual_blueprint: character.visual_blueprint,
            voice_id: character.voice_id,
          }
        : null,
    });
  };

  const setSupport = (name: string) => {
    if (name === NO_CHARACTER) {
      patchLesson({ supporting_character: null });
      return;
    }
    const character = PLAYGROUND_CAST_PRESETS.find((c) => c.name === name);
    if (!character) return;
    patchLesson({
      supporting_character: {
        name: character.name,
        visual_blueprint: character.visual_blueprint,
        voice_id: character.voice_id,
      },
    });
  };

  const setStarVoice = (voiceId: string) => {
    if (!starring) return;
    patchLesson({
      starring_character: { ...starring, voice_id: voiceId },
    });
  };

  return (
    <div className="mx-3 mb-2 mt-2 rounded-2xl border border-orange-200 bg-gradient-to-r from-[#FE6A2F] to-amber-500 p-[2px] shadow-sm">
      <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-[#FEFBDD] px-4 py-3">
        {/* Brand block */}
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="EnglEuphoria" className="h-8 w-auto" />
          <span className="hidden text-sm font-extrabold tracking-tight text-[#FE6A2F] sm:inline">
            EnglEuphoria · Playground
          </span>
        </div>

        {/* Lesson chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          <Chip label="Level" value={cefr || "Pre-A1"} />
          <Chip label="Unit" value={unit.unit_topic || "—"} />
          <Chip label="Lesson" value={`${lessonNumber} · ${lessonTitle}`} />
        </div>

        <div className="grow" />

        {/* Character picker */}
        <label className="flex items-center gap-2 text-xs font-semibold text-orange-900">
          <span>Star character</span>
          <select
            value={selected?.name ?? NO_CHARACTER}
            onChange={(e) => setCharacter(e.target.value)}
            className="rounded-full border border-orange-300 bg-white px-2 py-1 text-xs font-bold text-orange-900 focus:outline-none focus:ring-2 focus:ring-[#FE6A2F]"
          >
            <option value={NO_CHARACTER}>None (General)</option>
            {PLAYGROUND_CAST_PRESETS.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>

        {/* Auto-cast — recommend a lead that fits the unit's backdrop world. */}
        {suggestion && unitTheme && !suggestionMatches ? (
          <button
            type="button"
            onClick={() => setCharacter(suggestion.name)}
            className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-2 py-1 text-[11px] font-bold text-orange-800 shadow-sm hover:bg-orange-50"
            title={`"${unitTheme}" fits ${suggestion.name}`}
          >
            <span>✨</span>
            <span>Auto-cast: {suggestion.name.replace(/^the /, "")}</span>
          </button>
        ) : null}

        {/* Star voice override */}
        {selected && (
          <label className="flex items-center gap-2 text-xs font-semibold text-orange-900">
            <span>Voice</span>
            <select
              value={starring?.voice_id ?? selected.voice_id}
              onChange={(e) => setStarVoice(e.target.value)}
              className="rounded-full border border-orange-300 bg-white px-2 py-1 text-xs font-bold text-orange-900 focus:outline-none focus:ring-2 focus:ring-[#FE6A2F]"
            >
              {PLAYGROUND_CAST_PRESETS.map((c) => (
                <option key={c.voice_id} value={c.voice_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Supporting character picker */}
        <label className="flex items-center gap-2 text-xs font-semibold text-orange-900">
          <span>Support</span>
          <select
            value={selectedSupport?.name ?? NO_CHARACTER}
            onChange={(e) => setSupport(e.target.value)}
            className="rounded-full border border-orange-300 bg-white px-2 py-1 text-xs font-bold text-orange-900 focus:outline-none focus:ring-2 focus:ring-[#FE6A2F]"
          >
            <option value={NO_CHARACTER}>None</option>
            {PLAYGROUND_CAST_PRESETS.filter((c) => c.name !== selected?.name).map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>

        {/* Character thumbnail "impersonating" the lesson topic */}
        <div
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#FE6A2F] bg-white text-xl"
          title={selected ? `${selected.name} stars in this lesson` : "General educational illustration"}
        >
          {emojiForCharacter(selected?.name)}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-orange-900 ring-1 ring-orange-200">
      <span className="text-orange-500">{label}</span>
      <span className="max-w-[200px] truncate">{value}</span>
    </span>
  );
}

function emojiForCharacter(name?: string): string {
  if (!name) return "✨";
  if (name.includes("Fox")) return "🦊";
  if (name.includes("Bunny")) return "🐰";
  if (name.includes("Chick")) return "🐥";
  if (name.includes("Duck")) return "🦆";
  if (name.includes("Owl")) return "🦉";
  return "✨";
}
