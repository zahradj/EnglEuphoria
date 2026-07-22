import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlaygroundUnit, usePlaygroundUnitMutators, usePlaygroundLesson } from "@/playground-blueprint/PlaygroundUnitContext";
import type { PlaygroundBlock, PlaygroundPage } from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";

export function ContentTab({
  lessonNumber,
  page,
}: {
  lessonNumber: PlaygroundLessonNumber;
  page: PlaygroundPage;
}) {
  const { updatePage, setLessonField } = usePlaygroundUnitMutators();
  const lesson = usePlaygroundLesson(lessonNumber);
  const textBlocks = page.blocks.filter((b): b is Extract<PlaygroundBlock, { kind: "text" }> => b.kind === "text");

  const setBlock = (id: string, value: string) => {
    const blocks = page.blocks.map((b) =>
      b.kind === "text" && b.id === id ? { ...b, value } : b,
    );
    updatePage?.(lessonNumber, page.id, { blocks });
  };

  const setTitle = (title: string) =>
    updatePage?.(lessonNumber, page.id, { title });

  const setNotes = (notes: string) =>
    updatePage?.(lessonNumber, page.id, { notes });

  return (
    <div className="space-y-3">
      {lesson && setLessonField && (
        <PedagogyPanel
          lessonNumber={lessonNumber}
          lesson={lesson as any}
          onPatch={(p) => setLessonField(lessonNumber, p as any)}
        />
      )}

      <label className="block text-xs">
        <span className="mb-1 block font-semibold text-orange-900">Page title</span>
        <input
          value={page.title ?? ""}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
        />
      </label>

      <label className="block text-xs">
        <span className="mb-1 block font-semibold text-orange-900">
          Teacher notes / delivery tip
        </span>
        <textarea
          value={page.notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="One-line delivery cue for this slide (visible to teacher & critic)."
          className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
        />
      </label>

      {textBlocks.length === 0 ? (
        <p className="text-xs text-orange-700">No editable text on this page.</p>
      ) : (
        textBlocks.map((b) => (
          <label key={b.id} className="block text-xs">
            <span className="mb-1 block font-semibold text-orange-900">{b.label ?? "Text"}</span>
            <textarea
              value={b.value}
              onChange={(e) => setBlock(b.id, e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
            />
          </label>
        ))
      )}

      {lessonNumber === 4 && lesson && setLessonField && (
        <>
          <StorySceneEditor
            lessonNumber={lessonNumber}
            story={lesson.story}
            onChange={(story) => setLessonField(lessonNumber, { story })}
          />
          {(lesson as any).story_plan && (
            <StoryArchitectPanel
              plan={(lesson as any).story_plan}
              onChange={(plan) => setLessonField(lessonNumber, { story_plan: plan } as any)}
            />
          )}
        </>
      )}

      {page.phase_id === "warmup" && lesson && setLessonField && (
        <GreetChunksEditor
          value={((lesson as any).greet_chunks as string[] | undefined) ?? []}
          onChange={(next) =>
            setLessonField(lessonNumber, { greet_chunks: next } as any)
          }
        />
      )}

      {lessonNumber === 7 && lesson && setLessonField && (
        <RemediationSourcePanel
          value={(lesson as any).remediation_source ?? ""}
          onChange={(next) =>
            setLessonField(lessonNumber, { remediation_source: next } as any)
          }
        />
      )}
    </div>
  );
}

/* -------- Pedagogy contract (lesson-level) --------
 * Binds `communication_goal`, `grammar_target`, `focus_label`, `sentence_models`.
 * These four fields gate the entire modeling → practice → retell branch in
 * derivePages and are fed to the critic as the lesson's pedagogical contract.
 */

type PedagogyFields = {
  communication_goal?: string | null;
  grammar_target?: string | null;
  focus_label?: string | null;
  sentence_models?: string[] | null;
};

function PedagogyPanel({
  lessonNumber,
  lesson,
  onPatch,
}: {
  lessonNumber: PlaygroundLessonNumber;
  lesson: PedagogyFields;
  onPatch: (patch: PedagogyFields) => void;
}) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const unit = usePlaygroundUnit();
  const fullLesson = usePlaygroundLesson(lessonNumber);
  const models = Array.isArray(lesson.sentence_models) ? lesson.sentence_models : [];
  const setModels = (raw: string) => {
    const next = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    onPatch({ sentence_models: next });
  };

  const regenerate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("playground-activity-ai", {
        body: {
          activity_type: "pedagogy_contract",
          topic: unit?.unit_topic ?? "",
          vocab: fullLesson?.vocab ?? unit?.vocab_pool ?? [],
          cefr: "Pre-A1",
          instructions:
            "Return a Pre-A1 pedagogy contract: { communication_goal (one sentence, learner-facing DO statement), grammar_target (short label), focus_label (≤4 words), sentence_models (3–5 short Pre-A1 sentences bound to the vocab & grammar) }.",
          context: {
            lesson_number: lessonNumber,
            unit_topic: unit?.unit_topic ?? "",
            characters: (fullLesson as any)?.characters ?? [],
          },
          current_config: {
            communication_goal: lesson.communication_goal ?? "",
            grammar_target: lesson.grammar_target ?? "",
            focus_label: lesson.focus_label ?? "",
            sentence_models: models,
          },
        },
      });
      if (error) throw new Error(error.message);
      const cfg = (data as any)?.config ?? {};
      const nextModels = Array.isArray(cfg.sentence_models)
        ? cfg.sentence_models.map((s: any) => String(s)).filter(Boolean)
        : models;
      onPatch({
        communication_goal: cfg.communication_goal ?? lesson.communication_goal ?? null,
        grammar_target: cfg.grammar_target ?? lesson.grammar_target ?? null,
        focus_label: cfg.focus_label ?? lesson.focus_label ?? null,
        sentence_models: nextModels,
      });
    } catch (e: any) {
      setErr(e?.message || "Regenerate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-lg border border-orange-300 bg-orange-50/60 p-2.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center justify-between text-left"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
            Pedagogy contract · Lesson {lessonNumber}
          </span>
          <span className="text-[11px] text-orange-700">{open ? "▾" : "▸"}</span>
        </button>
        <button
          type="button"
          onClick={regenerate}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-md bg-[#FE6A2F] px-2 py-1 text-[11px] font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {busy ? "…" : "AI"}
        </button>
      </div>
      {err && <div className="mb-1 text-[11px] text-red-600">{err}</div>}
      {open && (
        <div className="space-y-2">
          <label className="block text-xs">
            <span className="mb-1 block font-semibold text-orange-900">Communication goal</span>
            <textarea
              value={lesson.communication_goal ?? ""}
              onChange={(e) => onPatch({ communication_goal: e.target.value })}
              rows={2}
              placeholder="What the learner can DO by end of lesson (e.g. 'Greet Pip and say their name')."
              className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-orange-900">Grammar target</span>
              <input
                value={lesson.grammar_target ?? ""}
                onChange={(e) => onPatch({ grammar_target: e.target.value })}
                placeholder="e.g. present simple be"
                className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-orange-900">Focus label</span>
              <input
                value={lesson.focus_label ?? ""}
                onChange={(e) => onPatch({ focus_label: e.target.value })}
                placeholder="Short chip (e.g. 'Say hello')"
                className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
              />
            </label>
          </div>

          <label className="block text-xs">
            <span className="mb-1 block font-semibold text-orange-900">
              Sentence models (one per line)
            </span>
            <textarea
              value={models.join("\n")}
              onChange={(e) => setModels(e.target.value)}
              rows={3}
              placeholder={"Hello, I'm Pip.\nWhat's your name?\nMy name is ___."}
              className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm font-mono"
            />
            <span className="mt-0.5 block text-[10px] text-orange-700/70">
              Drives the modeling dialogue in derivePages.
            </span>
          </label>
        </div>
      )}
    </section>
  );
}

/* -------- L4 storybook arc editor -------- */

type StoryShape = NonNullable<
  ReturnType<typeof usePlaygroundLesson> extends infer T
    ? T extends { story?: infer S }
      ? S
      : never
    : never
>;

function StorySceneEditor({
  lessonNumber,
  story,
  onChange,
}: {
  lessonNumber: PlaygroundLessonNumber;
  story: StoryShape | undefined;
  onChange: (next: StoryShape) => void;
}) {
  const title = story?.title ?? "";
  const scenes = story?.scenes ?? [];
  const qa = story?.qa ?? {};

  const patch = (p: Partial<StoryShape>) => onChange({ title, scenes, qa, ...p } as StoryShape);

  const setScene = (i: number, text: string) => {
    const next = scenes.map((s, idx) => (idx === i ? { ...s, text } : s));
    patch({ scenes: next });
  };

  const setQa = (band: "prea1" | "a1" | "a2", raw: string) => {
    const items = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    patch({ qa: { ...qa, [band]: items } });
  };

  const unit = usePlaygroundUnit();
  const lesson = usePlaygroundLesson(lessonNumber);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const regenerate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("playground-activity-ai", {
        body: {
          activity_type: "storybook",
          topic: unit?.unit_topic ?? "",
          vocab: lesson?.vocab ?? unit?.vocab_pool ?? [],
          cefr: "Pre-A1",
          instructions: "Storybook arc: 3–5 short scenes bound to lesson vocab & grammar. Return { prompt, scenes: [{ text, taps }] }.",
          context: {
            lesson_number: lessonNumber,
            objective: (lesson as any)?.objective ?? "",
            grammar_target: (lesson as any)?.grammar_target ?? "",
            sentence_frame: (lesson as any)?.sentence_frame ?? "",
            characters: (lesson as any)?.characters ?? [],
          },
          current_config: { title, scenes, qa },
        },
      });
      if (error) throw new Error(error.message);
      const cfg = (data as any)?.config;
      const rawScenes = Array.isArray(cfg?.scenes) ? cfg.scenes : [];
      if (rawScenes.length === 0) throw new Error("AI returned no scenes");
      const nextScenes = rawScenes.map((s: any, i: number) => ({
        id: scenes[i]?.id ?? `s${i + 1}`,
        text: String(s?.text ?? ""),
        image_prompt: scenes[i]?.image_prompt,
      }));
      patch({ scenes: nextScenes, title: cfg?.title ?? title });
    } catch (e: any) {
      setErr(e?.message || "Regenerate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-4 rounded-lg border border-orange-200 bg-orange-50/40 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-orange-800">
          Story arc (Lesson {lessonNumber})
        </div>
        <button
          type="button"
          onClick={regenerate}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-md bg-[#FE6A2F] px-2 py-1 text-[11px] font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {busy ? "…" : "AI regenerate"}
        </button>
      </div>
      {err && <div className="mb-2 text-[11px] text-red-600">{err}</div>}

      <label className="mb-2 block text-xs">
        <span className="mb-1 block font-semibold text-orange-900">Story title</span>
        <input
          value={title}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
        />
      </label>

      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-orange-900">Scenes</div>
        {scenes.length === 0 ? (
          <p className="text-[11px] italic text-orange-700/70">No scenes yet — generate the lesson to seed them.</p>
        ) : (
          scenes.map((s, i) => (
            <label key={s.id ?? i} className="block text-xs">
              <span className="mb-1 block text-orange-800">Scene {i + 1}</span>
              <textarea
                value={s.text}
                onChange={(e) => setScene(i, e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
              />
            </label>
          ))
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="text-[11px] font-semibold text-orange-900">Q&amp;A (one question per line)</div>
        {(["prea1", "a1", "a2"] as const).map((band) => (
          <label key={band} className="block text-xs">
            <span className="mb-1 block uppercase text-orange-800">{band}</span>
            <textarea
              value={(qa[band] ?? []).join("\n")}
              onChange={(e) => setQa(band, e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-sm"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

/* -------- Story Architect plan editor (L4 story_plan) --------
 * Edits the deep story_plan shape consumed by derivePages:805–838:
 *   { cover: { title, tagline, illustration_prompt },
 *     beats: [{ beat_label, narration, dialogue: [{speaker,line}], illustration_prompt }],
 *     characters: [{ name, voice_id }] }
 * When story_plan is present it short-circuits the fallback scene renderer,
 * so this editor is the only way for teachers to correct narration text,
 * illustration prompts, speakers, or per-character voices.
 */

type StoryArchitectPlan = {
  title?: string;
  cover?: { title?: string; tagline?: string; illustration_prompt?: string };
  beats?: Array<{
    beat_label?: string;
    narration?: string;
    illustration_prompt?: string;
    dialogue?: Array<{ speaker?: string; line?: string }>;
  }>;
  characters?: Array<{ name?: string; voice_id?: string }>;
};

function StoryArchitectPanel({
  plan,
  onChange,
}: {
  plan: StoryArchitectPlan;
  onChange: (next: StoryArchitectPlan) => void;
}) {
  const beats = plan.beats ?? [];
  const characters = plan.characters ?? [];
  const cover = plan.cover ?? {};

  const patch = (p: Partial<StoryArchitectPlan>) => onChange({ ...plan, ...p });
  const patchCover = (p: Partial<NonNullable<StoryArchitectPlan["cover"]>>) =>
    patch({ cover: { ...cover, ...p } });
  const patchBeat = (i: number, p: Partial<NonNullable<StoryArchitectPlan["beats"]>[number]>) =>
    patch({ beats: beats.map((b, idx) => (idx === i ? { ...b, ...p } : b)) });
  const patchDialogue = (
    i: number,
    j: number,
    p: Partial<{ speaker: string; line: string }>,
  ) => {
    const dialogue = (beats[i]?.dialogue ?? []).map((d, dj) =>
      dj === j ? { ...d, ...p } : d,
    );
    patchBeat(i, { dialogue });
  };
  const patchCharacter = (i: number, p: Partial<{ name: string; voice_id: string }>) =>
    patch({
      characters: characters.map((c, idx) => (idx === i ? { ...c, ...p } : c)),
    });

  return (
    <section className="mt-4 rounded-lg border border-amber-300 bg-amber-50/60 p-2.5">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-900">
        Story Architect plan
      </div>

      {/* Characters + voices */}
      {characters.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] font-semibold text-amber-900">Character voices</div>
          <div className="space-y-1">
            {characters.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <input
                  value={c.name ?? ""}
                  onChange={(e) => patchCharacter(i, { name: e.target.value })}
                  placeholder="Name"
                  className="w-28 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
                />
                <input
                  value={c.voice_id ?? ""}
                  onChange={(e) => patchCharacter(i, { voice_id: e.target.value })}
                  placeholder="voice_id (elevenlabs)"
                  className="flex-1 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cover */}
      <div className="mb-3 rounded-md border border-amber-200 bg-white/70 p-2">
        <div className="mb-1 text-[11px] font-semibold text-amber-900">Cover</div>
        <input
          value={cover.title ?? ""}
          onChange={(e) => patchCover({ title: e.target.value })}
          placeholder="Cover title"
          className="mb-1 w-full rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
        />
        <input
          value={cover.tagline ?? ""}
          onChange={(e) => patchCover({ tagline: e.target.value })}
          placeholder="Tagline"
          className="mb-1 w-full rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
        />
        <textarea
          value={cover.illustration_prompt ?? ""}
          onChange={(e) => patchCover({ illustration_prompt: e.target.value })}
          rows={2}
          placeholder="Cover illustration prompt"
          className="w-full rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
        />
      </div>

      {/* Beats */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-amber-900">Beats</div>
        {beats.length === 0 && (
          <p className="text-[11px] italic text-amber-700/70">No beats yet.</p>
        )}
        {beats.map((b, i) => (
          <div key={i} className="rounded-md border border-amber-200 bg-white/70 p-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-amber-800">
                Beat {i + 1}
              </span>
              <input
                value={b.beat_label ?? ""}
                onChange={(e) => patchBeat(i, { beat_label: e.target.value })}
                placeholder="Label (Setup / Problem / Try / Win …)"
                className="flex-1 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
              />
            </div>
            <textarea
              value={b.narration ?? ""}
              onChange={(e) => patchBeat(i, { narration: e.target.value })}
              rows={2}
              placeholder="Narration"
              className="mb-1 w-full rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
            />
            <textarea
              value={b.illustration_prompt ?? ""}
              onChange={(e) => patchBeat(i, { illustration_prompt: e.target.value })}
              rows={2}
              placeholder="Illustration prompt"
              className="mb-1 w-full rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
            />
            {(b.dialogue ?? []).length > 0 && (
              <div className="mt-1 space-y-1">
                <div className="text-[10px] font-semibold uppercase text-amber-700">
                  Dialogue
                </div>
                {(b.dialogue ?? []).map((d, j) => (
                  <div key={j} className="flex items-center gap-1">
                    <input
                      value={d.speaker ?? ""}
                      onChange={(e) => patchDialogue(i, j, { speaker: e.target.value })}
                      placeholder="Speaker"
                      className="w-24 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
                    />
                    <input
                      value={d.line ?? ""}
                      onChange={(e) => patchDialogue(i, j, { line: e.target.value })}
                      placeholder="Line"
                      className="flex-1 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------- GreetChunksEditor (warm-up chant personalization) --------
 * Writes `lesson.greet_chunks: string[]`. Consumed by derivePages:305–316
 * to splice custom lines into the greeting chant (between the fixed
 * "Hello, hello" opener and the echo lines). Without this, every
 * conversation-unit warm-up chant is identically generic.
 */
function GreetChunksEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const raw = value.join("\n");
  return (
    <section className="mt-4 rounded-lg border border-orange-200 bg-orange-50/40 p-2.5">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-800">
        Warm-up chant lines
      </div>
      <div className="mb-1 text-[11px] text-orange-700/80">
        One line per row. Inserted between the greeting opener and echo lines.
      </div>
      <textarea
        value={raw}
        onChange={(e) =>
          onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))
        }
        rows={4}
        placeholder={"Hello, hello, how are you?\nI'm fine, thank you!"}
        className="w-full rounded-md border border-orange-200 bg-white px-2 py-1.5 text-sm font-mono"
      />
    </section>
  );
}

/* -------- RemediationSourcePanel (L7 Stretch re-drill target) --------
 * Writes `lesson.remediation_source: string` (comma-joined words). Downstream
 * L7 remediation logic reads this to pin the exact vocab items the Stretch
 * lesson should re-drill. Options are populated from unit.vocab_pool.
 */
function RemediationSourcePanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const unit = usePlaygroundUnit();
  const pool = unit?.vocab_pool ?? [];
  const selected = new Set(
    value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  const toggle = (w: string) => {
    const key = w.toLowerCase();
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next).join(","));
  };

  return (
    <section className="mt-4 rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-rose-800">
        Remediation source · L7 Stretch
      </div>
      <div className="mb-2 text-[11px] text-rose-700/80">
        Pin earlier vocab for L7 to re-drill. Click chips to toggle.
      </div>
      {pool.length === 0 ? (
        <div className="text-[11px] italic text-rose-700/70">
          Unit vocab pool is empty.
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {pool.map((w) => {
            const on = selected.has(w.toLowerCase());
            return (
              <button
                key={w}
                type="button"
                onClick={() => toggle(w)}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  on
                    ? "bg-rose-600 text-white"
                    : "bg-white text-rose-900 ring-1 ring-rose-200 hover:bg-rose-100"
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
