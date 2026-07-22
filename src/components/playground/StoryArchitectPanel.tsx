/**
 * StoryArchitectPanel — one-click "Craft Story" trigger for the Hub Story
 * Architect agent. Sends the active lesson + a default cast to the agent and
 * displays the returned StoryPlan beat-by-beat. The plan persists onto
 * `curriculum_lessons.story_plan`; `derivePages.ts` then renders the L4
 * storybook directly from it.
 */
import { useState } from "react";
import { useStoryArchitect } from "@/hooks/useStoryArchitect";
import type { Cefr, Hub, StoryArchitectInput } from "@/agents/storyArchitect";
import { CAST_ROSTER, CAST_LOOK } from "@/playground-blueprint/derivePages";

interface Props {
  hub?: Hub;
  cefr?: Cefr;
  lesson: {
    id?: string;
    lesson_number?: number;
    title?: string;
    focus_label?: string;
    communication_goal?: string;
    grammar_target?: string;
    vocab: string[];
    review_targets?: string[];
    unit_theme?: string;
  };
  /** Override the cast (defaults to the Playground roster). */
  cast?: StoryArchitectInput["cast"];
  onCrafted?: () => void;
}

export function StoryArchitectPanel({ hub = "playground", cefr = "A1", lesson, cast, onCrafted }: Props) {
  const { craft, loading, result, error, reset } = useStoryArchitect();
  const [open, setOpen] = useState(false);

  const resolvedCast: StoryArchitectInput["cast"] =
    cast ??
    CAST_ROSTER.map((c) => ({
      name: c.name,
      species: c.species,
      voice_id: c.voice,
      bubble: c.bubble,
      look_book: CAST_LOOK[c.name],
    }));

  const handleCraft = async () => {
    setOpen(true);
    try {
      await craft({ hub, cefr, lesson, cast: resolvedCast });
      onCrafted?.();
    } catch {
      /* error captured in hook */
    }
  };

  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCraft}
          disabled={loading || !lesson.vocab?.length}
          className="rounded-full bg-[#FE6A2F] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow disabled:opacity-60"
        >
          {loading ? "Crafting…" : "🪄 Craft Story with Architect"}
        </button>
        <span className="text-[11px] font-semibold text-orange-900">
          Hub: {hub} · CEFR: {cefr}
        </span>
        {result && (
          <button
            type="button"
            onClick={() => { setOpen(false); reset(); }}
            className="ml-auto rounded-full bg-white px-3 py-1 text-[11px] font-bold text-orange-700 ring-1 ring-orange-200"
          >
            Close
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {open && result && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-sm font-bold text-orange-950">{result.plan.title}</p>
            <p className="text-[11px] italic text-orange-700">{result.plan.logline}</p>
            <p className="text-[11px] text-orange-700">
              Backdrop: <strong>{result.plan.backdrop?.setting}</strong> · {result.plan.backdrop?.mood}
            </p>
            {result.persisted && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                ✓ Saved to lesson — storybook will render from this plan.
              </p>
            )}
          </div>

          <div className="space-y-2">
            {result.plan.beats.map((beat, i) => (
              <div key={beat.id ?? i} className="rounded-lg border border-orange-200 bg-white/70 p-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-900">
                  {i + 1}. {beat.beat_label}
                </p>
                <p className="mt-1 text-xs text-orange-950">{beat.narration}</p>
                <div className="mt-2 space-y-1">
                  {beat.dialogue.map((d, j) => {
                    const char = result.plan.characters.find((c) => c.name?.toLowerCase() === d.speaker?.toLowerCase());
                    const outline = char?.bubble?.outline ?? "#FE6A2F";
                    return (
                      <div
                        key={j}
                        className="rounded-2xl px-2 py-1 text-[12px]"
                        style={{ border: `2px solid ${outline}`, background: char?.bubble?.fill ?? "#fff7e6" }}
                      >
                        <strong>{d.speaker}:</strong> {d.line}{" "}
                        {d.emotion && <em className="text-[10px] text-orange-700">({d.emotion})</em>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {result.issues.length > 0 && (
            <details className="rounded-md bg-amber-50 p-2 text-[11px] text-amber-900">
              <summary className="cursor-pointer font-bold">Validator notes ({result.issues.length})</summary>
              <ul className="mt-1 list-disc pl-4">
                {result.issues.map((iss, k) => (
                  <li key={k}>[{iss.severity}] {iss.code} — {iss.message}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
