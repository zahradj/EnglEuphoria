/**
 * VocabTab — editable vocab list + phonic triplet + review targets.
 *
 * - Vocab chips (add/remove) → `lesson.vocab[]` (L1 full list, L2/L3 new words)
 * - Phonic form (letter, sound, words[]) → `lesson.phonic` (L1–L3 only)
 * - Review targets chips → `lesson.review_targets[]` (L4–L7 only)
 *
 * All writes go through `setLessonField` (PlaygroundUnitContext), so the
 * downstream pipelines (derivePages, coherence, memory) pick up the change
 * on the next render / regenerate.
 */
import { useState, KeyboardEvent } from "react";
import { X, Plus, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlaygroundUnit, usePlaygroundUnitMutators } from "@/playground-blueprint/PlaygroundUnitContext";
import type {
  PlaygroundLessonContent,
  PlaygroundPhonic,
  PlaygroundVocabMedia,
} from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";

interface Props {
  lessonNumber: PlaygroundLessonNumber;
  lesson: PlaygroundLessonContent | undefined;
}

export function VocabTab({ lessonNumber, lesson }: Props) {
  const { setLessonField } = usePlaygroundUnitMutators();
  const unit = usePlaygroundUnit();
  const unitTheme = (unit as any)?.unit_theme as string | undefined;

  if (!lesson || !setLessonField) {
    return <div className="text-sm text-orange-700">Lesson not ready to edit.</div>;
  }

  const vocab = lesson.vocab ?? [];
  const phonic = lesson.phonic;
  const reviewTargets = lesson.review_targets ?? [];

  const showPhonic = lessonNumber >= 1 && lessonNumber <= 3;
  const showReview = lessonNumber >= 4 && lessonNumber <= 7;

  const boundImageCount = Object.values(lesson.vocab_media ?? {}).filter(
    (m: any) => !!m?.imageUrl,
  ).length;
  const clearVocabImages = () => {
    const prev = lesson.vocab_media ?? {};
    const next: Record<string, PlaygroundVocabMedia> = {};
    for (const [k, v] of Object.entries(prev)) next[k] = { ...(v as any), imageUrl: "" };
    setLessonField(lessonNumber, { vocab_media: next });
  };

  return (
    <div className="space-y-5">
      {/* Theme rebind banner — clears cached images so the next media pass
          re-renders every vocab card inside the newly-chosen theme world. */}
      {boundImageCount > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs">
          <div className="min-w-0">
            <span className="font-bold text-amber-900">Theme:</span>{" "}
            <span className="text-amber-800">{unitTheme || "auto (from topic)"}</span>
            <span className="ml-1 text-amber-700">
              · {boundImageCount} vocab image{boundImageCount === 1 ? "" : "s"} bound
            </span>
          </div>
          <button
            type="button"
            onClick={clearVocabImages}
            className="shrink-0 rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700"
            title="Clear vocab image URLs so they regenerate against the current theme"
          >
            ↻ Regenerate for theme
          </button>
        </div>
      )}
      {/* Vocab list */}
      <section>
        <SectionHeader
          title="Vocabulary"
          hint={
            lessonNumber === 1
              ? "Full unit vocab list (locked from L1)."
              : `New words introduced in Lesson ${lessonNumber}.`
          }
        />
        <ChipEditor
          values={vocab}
          onChange={(next) => {
            // Prune vocab_media entries for words that no longer exist so
            // removing a vocab word never leaks its old image into the lesson.
            const keep = new Set(next.map((w) => w.toLowerCase()));
            const prevMedia = lesson.vocab_media ?? {};
            const prunedMedia: Record<string, PlaygroundVocabMedia> = {};
            for (const [k, v] of Object.entries(prevMedia)) {
              if (keep.has(k.toLowerCase())) prunedMedia[k] = v;
            }
            setLessonField(lessonNumber, { vocab: next, vocab_media: prunedMedia });
          }}
          placeholder="add a word…"
        />
        {vocab.length > 0 && (
          <VocabSemanticsEditor
            words={vocab}
            media={lesson.vocab_media ?? {}}
            onChange={(next) => setLessonField(lessonNumber, { vocab_media: next })}
          />
        )}
      </section>

      {/* Phonic (L1–L3) */}
      {showPhonic && (
        <section>
          <SectionHeader
            title="Phonic"
            hint="Letter, sound (in slashes) and 2–4 example words that start with the letter."
          />
          <PhonicEditor
            value={phonic}
            onChange={(next) => setLessonField(lessonNumber, { phonic: next })}
          />
        </section>
      )}

      {/* Review targets (L4–L7) */}
      {showReview && (
        <section>
          <SectionHeader
            title="Review targets"
            hint="Earlier vocab to recycle in warm-up and review activities."
          />
          <ChipEditor
            values={reviewTargets}
            onChange={(next) => setLessonField(lessonNumber, { review_targets: next })}
            placeholder="add a review word…"
          />
        </section>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <div className="text-xs font-bold uppercase tracking-wider text-orange-800">
        {title}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-orange-700/80">{hint}</div>}
    </div>
  );
}

function ChipEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const clean = draft.trim().toLowerCase();
    if (!clean) return;
    if (values.some((v) => v.toLowerCase() === clean)) {
      setDraft("");
      return;
    }
    onChange([...values, clean]);
    setDraft("");
  };

  const remove = (i: number) => {
    const next = values.slice();
    next.splice(i, 1);
    onChange(next);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && values.length) {
      remove(values.length - 1);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-900"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-full p-0.5 hover:bg-orange-200"
              aria-label={`Remove ${v}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs italic text-orange-700/60">no items yet</span>
        )}
      </div>
      <div className="mt-2 flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-xs outline-none focus:border-orange-400"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md bg-[#FE6A2F] px-2 py-1 text-xs font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
    </div>
  );
}

function PhonicEditor({
  value,
  onChange,
}: {
  value: PlaygroundPhonic | undefined;
  onChange: (next: PlaygroundPhonic) => void;
}) {
  const letter = value?.letter ?? "";
  const sound = value?.sound ?? "";
  const words = value?.words ?? [];

  const patch = (p: Partial<PlaygroundPhonic>) =>
    onChange({ letter, sound, words, ...p });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-orange-800">Letter</span>
          <input
            value={letter}
            onChange={(e) =>
              patch({ letter: e.target.value.slice(0, 2).toLowerCase() })
            }
            placeholder="c"
            className="rounded-md border border-orange-200 bg-white px-2 py-1 text-xs outline-none focus:border-orange-400"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-orange-800">Sound</span>
          <input
            value={sound}
            onChange={(e) => patch({ sound: e.target.value })}
            placeholder="/k/"
            className="rounded-md border border-orange-200 bg-white px-2 py-1 text-xs outline-none focus:border-orange-400"
          />
        </label>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-semibold text-orange-800">
          Example words
        </div>
        <ChipEditor
          values={words}
          onChange={(next) => patch({ words: next })}
          placeholder="cat, cow, car…"
        />
      </div>
    </div>
  );
}

/* -------- VocabSemanticsEditor --------
 * Per-word `definition` + `example` on `vocab_media[word]`. Feeds
 * derivePages.buildLanguageEnginePage() so engine slot `targets[]` carry
 * semantic context (Cambridge vocab integrity: examples MUST contain headword).
 */
function VocabSemanticsEditor({
  words,
  media,
  onChange,
}: {
  words: string[];
  media: Record<string, PlaygroundVocabMedia>;
  onChange: (next: Record<string, PlaygroundVocabMedia>) => void;
}) {
  const [openWord, setOpenWord] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const unit = usePlaygroundUnit();

  const patch = (word: string, p: Partial<PlaygroundVocabMedia>) => {
    onChange({ ...media, [word]: { ...(media[word] ?? {}), ...p } });
  };

  const regenerateAll = async () => {
    setBusy(true);
    setErr(null);
    try {
      const targets = words.filter((w) => {
        const m = media[w] ?? {};
        const exampleOk = !!m.example && m.example.toLowerCase().includes(w.toLowerCase());
        return !m.definition || !exampleOk;
      });
      if (targets.length === 0) {
        setErr("All entries look good — nothing to fill.");
        return;
      }
      const { data, error } = await supabase.functions.invoke("playground-activity-ai", {
        body: {
          activity_type: "vocab_semantics",
          topic: unit?.unit_topic ?? "",
          vocab: words,
          cefr: "Pre-A1",
          instructions:
            "For each headword, return { word, definition (concrete, ≤6 words, Pre-A1 safe), example (short Pre-A1 sentence that MUST contain the headword literally) }. Return { entries: [...] }.",
          context: { unit_topic: unit?.unit_topic ?? "", targets },
          current_config: { entries: words.map((w) => ({ word: w, ...(media[w] ?? {}) })) },
        },
      });
      if (error) throw new Error(error.message);
      const entries = (data as any)?.config?.entries ?? [];
      if (!Array.isArray(entries) || entries.length === 0) throw new Error("AI returned no entries");
      const next = { ...media };
      for (const e of entries) {
        const w = String(e?.word ?? "").trim();
        if (!w || !words.includes(w)) continue;
        const def = typeof e.definition === "string" ? e.definition.trim() : "";
        const ex = typeof e.example === "string" ? e.example.trim() : "";
        const exOk = ex && ex.toLowerCase().includes(w.toLowerCase());
        next[w] = {
          ...(next[w] ?? {}),
          ...(def ? { definition: def } : {}),
          ...(exOk ? { example: ex } : {}),
        };
      }
      onChange(next);
    } catch (e: any) {
      setErr(e?.message || "Regenerate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase text-orange-800/70">
          Definitions & examples
        </div>
        <button
          type="button"
          onClick={regenerateAll}
          disabled={busy || words.length === 0}
          className="inline-flex items-center gap-1 rounded-md bg-[#FE6A2F] px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {busy ? "…" : "AI fill missing"}
        </button>
      </div>
      {err && <div className="text-[10px] text-red-600">{err}</div>}
      {words.map((w) => {
        const m = media[w] ?? {};
        const open = openWord === w;
        const exampleOk = !m.example || m.example.toLowerCase().includes(w.toLowerCase());
        return (
          <div key={w} className="rounded-md border border-orange-200 bg-white/70">
            <button
              type="button"
              onClick={() => setOpenWord(open ? null : w)}
              className="flex w-full items-center justify-between px-2 py-1 text-left text-xs"
            >
              <span className="font-semibold text-orange-900">{w}</span>
              <span className="flex items-center gap-1 text-[10px] text-orange-700/70">
                {m.definition ? "def✓" : "def—"} · {m.example ? (exampleOk ? "ex✓" : "ex⚠") : "ex—"}
                <span>{open ? "▾" : "▸"}</span>
              </span>
            </button>
            {open && (
              <div className="border-t border-orange-100 p-2 space-y-1">
                <input
                  value={m.definition ?? ""}
                  onChange={(e) => patch(w, { definition: e.target.value })}
                  placeholder="One-line concrete definition (≤6 words at PG)"
                  className="w-full rounded-md border border-orange-200 bg-white px-2 py-1 text-xs"
                />
                <input
                  value={m.example ?? ""}
                  onChange={(e) => patch(w, { example: e.target.value })}
                  placeholder={`Example sentence containing "${w}"`}
                  className={`w-full rounded-md border bg-white px-2 py-1 text-xs ${
                    exampleOk ? "border-orange-200" : "border-red-400"
                  }`}
                />
                {!exampleOk && (
                  <div className="text-[10px] text-red-600">
                    Example must contain the headword "{w}".
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="truncate text-[10px] text-orange-700/70">
                    {m.imageUrl ? "🖼 image bound" : "no image bound (auto-resolves)"}
                  </span>
                  {m.imageUrl && (
                    <button
                      type="button"
                      onClick={() => patch(w, { imageUrl: "" })}
                      className="rounded-md border border-orange-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-orange-800 hover:bg-orange-50"
                    >
                      Clear image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
