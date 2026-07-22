/**
 * ActivityTab — Playground Creator V2
 *
 * Lets authors pick from a catalog of activities and games (including the
 * brain-break games BalloonPhonicsPop & FamilyTreeBuilder), edit the config
 * via friendly defaults OR raw JSON, and one-click ✨ AI fill the config
 * using the page topic + lesson vocab.
 *
 * To add a new activity: append a row to ACTIVITY_CATALOG below.
 */
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  usePlaygroundUnit,
  usePlaygroundUnitMutators,
} from "@/playground-blueprint/PlaygroundUnitContext";
import type { PlaygroundBlock, PlaygroundPage } from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";

type ActivityBlock = Extract<PlaygroundBlock, { kind: "activity" }>;
type EngineSlotBlock = Extract<PlaygroundBlock, { kind: "language_engine_slot" }>;

export type CatalogEntry = {
  type: string;
  label: string;
  emoji: string;
  group: "core" | "phonics" | "speaking" | "listening" | "grammar" | "story" | "break" | "review";
  hint: string;
  /** Sensible defaults so the activity is playable before AI fill. */
  defaultConfig: Record<string, unknown>;
};

export const ACTIVITY_CATALOG: CatalogEntry[] = [
  // Core
  { type: "multiple", label: "Picture Choice", emoji: "🎯", group: "core", hint: "Tap the right picture.", defaultConfig: { prompt: "What is this?", options: ["cat", "dog", "pig"], answer: "cat" } },
  { type: "match", label: "Drag Match", emoji: "🧩", group: "core", hint: "Match word ↔ picture.", defaultConfig: { prompt: "Match the words.", pairs: [{ left: "cat", right: "🐱" }, { left: "dog", right: "🐶" }] } },
  { type: "fill", label: "Word Gap", emoji: "🏗️", group: "core", hint: "Drop the missing word.", defaultConfig: { prompt: "Fill the blank.", sentence: "I see a ____.", answer: "cat", options: ["cat", "sun", "ball"] } },
  { type: "memory", label: "Memory Pairs", emoji: "🧠", group: "core", hint: "Flip to find pairs.", defaultConfig: { prompt: "Find the pairs!", pairs: [{ id: "cat", label: "cat", emoji: "🐱" }, { id: "dog", label: "dog", emoji: "🐶" }] } },
  { type: "tap_order", label: "Tap Order", emoji: "🔢", group: "core", hint: "Tap in order.", defaultConfig: { prompt: "Tap 1–5.", items: [{ label: "1", emoji: "1️⃣" }, { label: "2", emoji: "2️⃣" }, { label: "3", emoji: "3️⃣" }] } },
  { type: "sort", label: "Sort Buckets", emoji: "🗂️", group: "core", hint: "Drag into bucket.", defaultConfig: { prompt: "Sort them!", buckets: [{ id: "farm", label: "Farm", emoji: "🚜" }, { id: "jungle", label: "Jungle", emoji: "🌴" }], items: [{ label: "cow", emoji: "🐄", bucket: "farm" }, { label: "tiger", emoji: "🐯", bucket: "jungle" }] } },
  { type: "true_false", label: "True or False", emoji: "✅", group: "core", hint: "Tap true or false.", defaultConfig: { prompt: "A cat says meow.", answer: true } },
  { type: "yes_no", label: "Yes / No", emoji: "👍", group: "core", hint: "Quick yes/no question.", defaultConfig: { prompt: "Is this a dog?", emoji: "🐶", answer: "yes" } },
  { type: "spin_wheel", label: "Spin the Wheel", emoji: "🎡", group: "core", hint: "Random prompt picker.", defaultConfig: { prompt: "Spin and say it!", items: ["cat", "dog", "pig", "cow"] } },
  { type: "scratch_reveal", label: "Scratch Reveal", emoji: "🪙", group: "core", hint: "Scratch to discover.", defaultConfig: { prompt: "Scratch to reveal!", answer: "cat", hint_emoji: "🐱" } },

  // Phonics
  { type: "word_builder", label: "CVC Builder", emoji: "🔤", group: "phonics", hint: "Build a 3-letter word.", defaultConfig: { prompt: "Build the word.", word: "cat", extras: ["s", "o"] } },
  { type: "sound_blend", label: "Sound Blending", emoji: "🔊", group: "phonics", hint: "Blend sounds.", defaultConfig: { prompt: "Blend the sounds.", word: "cat", sounds: ["c", "a", "t"] } },
  { type: "missing_letter", label: "Missing Letter", emoji: "🔎", group: "phonics", hint: "Pick the missing letter.", defaultConfig: { prompt: "Which letter is missing?", word: "cat", missing_letter: "a", missing_position: 1 } },
  { type: "phonics_hunt", label: "Phonics Hunt", emoji: "👂", group: "phonics", hint: "Find the sound.", defaultConfig: { prompt: "Find words with /k/.", letter: "c", items: [{ word: "cat", has_letter: true }, { word: "dog", has_letter: false }] } },
  { type: "trace", label: "Trace Letter", emoji: "✍️", group: "phonics", hint: "Trace with finger.", defaultConfig: { prompt: "Trace c.", letter: "c", word: "cat", phoneme: "/k/" } },
  { type: "rhyme_match", label: "Rhyme Match", emoji: "🎵", group: "phonics", hint: "Match rhyming words.", defaultConfig: { prompt: "Match the rhymes.", pairs: [{ left: "cat", right: "hat" }, { left: "dog", right: "log" }] } },
  { type: "syllable_clap", label: "Syllable Clap", emoji: "👏", group: "phonics", hint: "Count syllables.", defaultConfig: { prompt: "How many claps?", word: "elephant", syllables: 3 } },

  // Listening
  { type: "listen_match", label: "Listen & Match", emoji: "🎧", group: "listening", hint: "Hear it · tap it.", defaultConfig: { prompt: "Listen and tap.", audio_word: "cat", options: ["cat", "dog", "pig"], answer: "cat" } },
  { type: "dictation", label: "Mini Dictation", emoji: "📝", group: "listening", hint: "Type what you hear.", defaultConfig: { prompt: "Type the word.", audio_word: "cat", answer: "cat" } },
  { type: "sound_discrim", label: "Same or Different?", emoji: "🔔", group: "listening", hint: "Compare two sounds.", defaultConfig: { prompt: "Same or different?", word_a: "cat", word_b: "cat", answer: "same" } },

  // Speaking
  { type: "echo", label: "Echo Repeat", emoji: "🦜", group: "speaking", hint: "Hear it · say it back.", defaultConfig: { prompt: "Say it after Pip.", word: "hello" } },
  { type: "speaking_mission", label: "Speaking Mission", emoji: "🎤", group: "speaking", hint: "Say-it-out-loud task.", defaultConfig: { prompt: "Say one thing you like!" } },
  { type: "shadowing", label: "Shadow Speak", emoji: "🗣️", group: "speaking", hint: "Repeat with rhythm.", defaultConfig: { prompt: "Shadow Pip!", sentence: "I have a cat." } },
  { type: "role_play", label: "Role Play", emoji: "🎭", group: "speaking", hint: "Talk with a character.", defaultConfig: { prompt: "Greet Bella.", character: "Bella", lines: ["Hello!", "How are you?"] } },
  { type: "describe_picture", label: "Describe Picture", emoji: "🖼️", group: "speaking", hint: "Say what you see.", defaultConfig: { prompt: "What do you see?", image_prompt: "A cat on a mat", sentence_frame: "I see a ___." } },

  // Grammar
  { type: "sentence_builder", label: "Sentence Builder", emoji: "🧱", group: "grammar", hint: "Drag words in order.", defaultConfig: { prompt: "Build the sentence.", words: ["I", "have", "a", "cat"], answer: "I have a cat" } },
  { type: "transform", label: "Transform It", emoji: "🔁", group: "grammar", hint: "Change the sentence.", defaultConfig: { prompt: "Make it negative.", input: "I have a cat.", answer: "I don't have a cat." } },
  { type: "tap_word", label: "Find the Word", emoji: "🔍", group: "grammar", hint: "Tap the target word.", defaultConfig: { prompt: "Tap the verb.", sentence: "I see a cat.", answer: "see" } },

  // Story
  { type: "storybook", label: "Storybook", emoji: "📖", group: "story", hint: "Multi-scene story.", defaultConfig: { prompt: "Listen and tap.", scenes: [{ text: "Pip walks on the farm.", taps: ["cow", "pig"] }] } },
  { type: "canvas_game", label: "Canvas Game", emoji: "🎯", group: "story", hint: "Free placement scene.", defaultConfig: { prompt: "Tap the animals!", targets: [{ label: "cat", x: 30, y: 40 }] } },
  { type: "branching_dialogue", label: "Branching Dialogue", emoji: "💬", group: "story", hint: "Choose what to say.", defaultConfig: { prompt: "What do you say?", line: "Hello!", choices: [{ text: "Hi!", next: "good" }, { text: "Bye!", next: "oops" }] } },
  { type: "comic_panel", label: "Comic Panels", emoji: "🗯️", group: "story", hint: "Order the panels.", defaultConfig: { prompt: "Put the story in order.", panels: [{ id: "a", emoji: "🌅" }, { id: "b", emoji: "🐱" }, { id: "c", emoji: "🌙" }], answer: ["a", "b", "c"] } },

  // Review
  { type: "flashcard_review", label: "Flashcard Review", emoji: "🃏", group: "review", hint: "Flip & recall.", defaultConfig: { prompt: "Flip the cards.", cards: [{ front: "cat", back: "🐱" }, { front: "dog", back: "🐶" }] } },
  { type: "quick_quiz", label: "Quick Quiz", emoji: "⚡", group: "review", hint: "5-question recap.", defaultConfig: { prompt: "Quick quiz!", questions: [{ q: "What is 🐱?", options: ["cat", "dog"], answer: "cat" }] } },
  { type: "exit_ticket", label: "Exit Ticket", emoji: "🎟️", group: "review", hint: "One-tap self check.", defaultConfig: { prompt: "How do you feel?", options: ["😀 Got it", "🙂 Okay", "🤔 Help"] } },

  // Brain Break Games
  { type: "balloon_pop", label: "Balloon Phonics Pop", emoji: "🎈", group: "break", hint: "Pop balloons, hear sounds.", defaultConfig: { prompt: "Pop the pink balloons!", targetSound: "/b/", associatedWords: ["boy", "ball", "book"], balloonColor: "bg-pink-400" } },
  { type: "family_tree", label: "Family Tree Builder", emoji: "🏡", group: "break", hint: "Map relationships + color.", defaultConfig: { prompt: "Tap each family member.", themeColor: "#FEFBDD", members: [{ role: "man", label: "Father" }, { role: "woman", label: "Mother" }, { role: "boy", label: "Boy" }, { role: "girl", label: "Girl" }, { role: "baby", label: "Baby" }] } },
  { type: "doodle_break", label: "Doodle Break", emoji: "🎨", group: "break", hint: "Free drawing rest.", defaultConfig: { prompt: "Draw anything you like!" } },
  { type: "stretch_break", label: "Stretch Break", emoji: "🧘", group: "break", hint: "30-second move.", defaultConfig: { prompt: "Stand up and stretch!", seconds: 30 } },
  { type: "dance_break", label: "Dance Break", emoji: "💃", group: "break", hint: "Mini dance party.", defaultConfig: { prompt: "Dance with Pip!", seconds: 30 } },
];

export const GROUP_LABEL: Record<CatalogEntry["group"], string> = {
  core: "Core",
  phonics: "Phonics & Trace",
  listening: "Listening",
  speaking: "Speaking",
  grammar: "Grammar",
  story: "Story & Canvas",
  review: "Review & Recap",
  break: "Brain Break Games",
};


export function ActivityTab({
  lessonNumber,
  page,
}: {
  lessonNumber: PlaygroundLessonNumber;
  page: PlaygroundPage;
}) {
  const unit = usePlaygroundUnit();
  const { updatePage, setLessonField } = usePlaygroundUnitMutators();
  const activities = page.blocks.filter(
    (b): b is ActivityBlock => b.kind === "activity",
  );
  const engineSlots = page.blocks.filter(
    (b): b is EngineSlotBlock => b.kind === "language_engine_slot",
  );

  const lesson = useMemo(
    () => unit?.lessons.find((x) => x.lesson_number === lessonNumber),
    [unit, lessonNumber],
  );
  const lessonVocab = useMemo(
    () => lesson?.vocab ?? unit?.vocab_pool ?? [],
    [lesson, unit],
  );
  const lessonContext = useMemo(
    () => ({
      lesson_number: lessonNumber,
      objective: (lesson as any)?.objective ?? "",
      grammar_target: (lesson as any)?.grammar_target ?? "",
      sentence_frame: (lesson as any)?.sentence_frame ?? "",
      phonic: (lesson as any)?.phonic ?? null,
      ace_role: (lesson as any)?.ace_role ?? "",
      page_label: page.title ?? "",
      page_phase: page.phase_id ?? "",
    }),
    [lesson, lessonNumber, page],
  );

  const addActivity = (entry: CatalogEntry) => {
    const id = `${page.id}.act-${Date.now().toString(36)}`;
    const newBlock: ActivityBlock = {
      kind: "activity",
      id,
      label: entry.label,
      type: entry.type,
      config: { ...entry.defaultConfig },
    };
    updatePage?.(lessonNumber, page.id, { blocks: [...page.blocks, newBlock] });
  };

  const patch = (id: string, next: Partial<ActivityBlock>) => {
    const blocks = page.blocks.map((b) =>
      b.kind === "activity" && b.id === id ? { ...b, ...next } : b,
    );
    updatePage?.(lessonNumber, page.id, { blocks });
  };

  const remove = (id: string) => {
    updatePage?.(lessonNumber, page.id, {
      blocks: page.blocks.filter((b) => b.id !== id),
    });
  };

  const patchEngineSlot = (id: string, next: Partial<EngineSlotBlock>) => {
    const blocks = page.blocks.map((b) =>
      b.kind === "language_engine_slot" && b.id === id ? { ...b, ...next } : b,
    );
    updatePage?.(lessonNumber, page.id, { blocks });
  };

  const isQuizPage = page.phase_id === "quiz" && lessonNumber === 6;

  return (
    <div className="space-y-4">
      {isQuizPage && lesson && setLessonField && (
        <QuizSeedPanel
          seed={(lesson as any).quiz_seed ?? {}}
          onChange={(next) => setLessonField(lessonNumber, { quiz_seed: next })}
        />
      )}

      {/* Engine slots (story/escape-room/detective/hidden-object) */}
      {engineSlots.length > 0 && (
        <div className="space-y-3">
          {engineSlots.map((s) => (
            <EngineSlotEditor
              key={s.id}
              block={s}
              lessonVocab={lessonVocab}
              onChange={(next) => patchEngineSlot(s.id, next)}
            />
          ))}
        </div>
      )}

      {/* Existing activities */}
      {activities.length === 0 ? (
        <p className="text-xs text-orange-700">
          No activity on this page yet — pick one below.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <ActivityEditor
              key={a.id}
              block={a}
              topic={unit?.unit_topic ?? ""}
              vocab={lessonVocab}
              context={lessonContext}
              onChange={(next) => patch(a.id, next)}
              onRemove={() => remove(a.id)}
            />
          ))}
        </div>
      )}

      {/* Catalog picker */}
      <ActivityCatalog onAdd={addActivity} />
    </div>
  );
}

// ─── Engine slot editor (story_engine_slot / escape_room_slot / …) ─────
function EngineSlotEditor({
  block,
  lessonVocab,
  onChange,
}: {
  block: EngineSlotBlock;
  lessonVocab: string[];
  onChange: (next: Partial<EngineSlotBlock>) => void;
}) {
  const targetWords = (block.target_words ?? []).join(", ");
  const syncFromVocab = () => onChange({ target_words: lessonVocab.slice(0, 6) });
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-2.5 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rounded-full bg-purple-200 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-900">
            Engine slot
          </span>
          <span className="truncate font-semibold text-purple-900">{block.label ?? block.engineType}</span>
        </div>
        <button
          type="button"
          onClick={syncFromVocab}
          disabled={lessonVocab.length === 0}
          className="rounded-md bg-purple-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          Sync targets ↻
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase text-purple-800">Engine type</span>
          <select
            value={block.engineType}
            onChange={(e) => onChange({ engineType: e.target.value })}
            className="rounded-md border border-purple-200 bg-white px-2 py-1 text-xs"
          >
            {["story_engine_slot", "escape_room_slot", "detective_mystery_slot", "hidden_object_slot"].map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase text-purple-800">Mode</span>
          <select
            value={block.mode ?? "lesson"}
            onChange={(e) => onChange({ mode: e.target.value as EngineSlotBlock["mode"] })}
            className="rounded-md border border-purple-200 bg-white px-2 py-1 text-xs"
          >
            {["lesson", "review", "quiz"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase text-purple-800">CEFR</span>
        <input
          value={block.cefr ?? ""}
          onChange={(e) => onChange({ cefr: e.target.value })}
          placeholder="Pre-A1"
          className="rounded-md border border-purple-200 bg-white px-2 py-1 text-xs"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase text-purple-800">Title</span>
        <input
          value={block.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="rounded-md border border-purple-200 bg-white px-2 py-1 text-xs"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase text-purple-800">Objective</span>
        <textarea
          value={block.objective ?? ""}
          onChange={(e) => onChange({ objective: e.target.value })}
          rows={2}
          className="rounded-md border border-purple-200 bg-white px-2 py-1 text-xs"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase text-purple-800">Target words (comma-separated)</span>
        <input
          value={targetWords}
          onChange={(e) => {
            const words = e.target.value
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean);
            onChange({ target_words: words });
          }}
          placeholder="cat, dog, farm"
          className="rounded-md border border-purple-200 bg-white px-2 py-1 text-xs"
        />
      </label>
    </div>
  );
}

// ─── L6 Quiz seed panel (mastery gate calibration) ─────────────────────
type QuizSeed = {
  pass_score?: number;
  total_questions?: number;
  format_weights?: { picture?: number; text?: number; audio?: number; spell?: number };
  speaking_gate?: {
    enabled?: boolean;
    ladder_rung?: "guided" | "supported" | "independent";
    min_words?: number;
  };
  [k: string]: unknown;
};

function QuizSeedPanel({
  seed,
  onChange,
}: {
  seed: QuizSeed;
  onChange: (next: QuizSeed) => void;
}) {
  const pass = seed.pass_score ?? 80;
  const total = seed.total_questions ?? 24;
  const weights = seed.format_weights ?? { picture: 40, text: 30, audio: 20, spell: 10 };

  const setWeight = (k: keyof NonNullable<QuizSeed["format_weights"]>, v: number) =>
    onChange({ ...seed, format_weights: { ...weights, [k]: v } });

  const balance = () => {
    const keys = ["picture", "text", "audio", "spell"] as const;
    const raw = keys.map((k) => Math.max(0, weights[k] ?? 0));
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    const scaled = raw.map((v) => Math.round((v / sum) * 100));
    const drift = 100 - scaled.reduce((a, b) => a + b, 0);
    scaled[0] += drift;
    onChange({
      ...seed,
      format_weights: Object.fromEntries(keys.map((k, i) => [k, scaled[i]])) as QuizSeed["format_weights"],
    });
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
            Mastery quiz
          </span>
          <span className="font-semibold text-emerald-900">Lesson 6 gate</span>
        </div>
        <button
          type="button"
          onClick={balance}
          className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
        >
          Balance to 100
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase text-emerald-800">
            Pass score (%)
          </span>
          <input
            type="number"
            min={50}
            max={100}
            value={pass}
            onChange={(e) => onChange({ ...seed, pass_score: Number(e.target.value) || 80 })}
            className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase text-emerald-800">
            Total questions
          </span>
          <input
            type="number"
            min={6}
            max={40}
            value={total}
            onChange={(e) => onChange({ ...seed, total_questions: Number(e.target.value) || 24 })}
            className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs"
          />
        </label>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase text-emerald-800">
          <span>Format weights (%)</span>
          <span className="tabular-nums normal-case">
            total {Object.values(weights).reduce((a: number, b) => a + (Number(b) || 0), 0)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["picture", "text", "audio", "spell"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2">
              <span className="w-14 text-[11px] capitalize text-emerald-900">{k}</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={weights[k] ?? 0}
                onChange={(e) => setWeight(k, Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-right text-[11px] tabular-nums text-emerald-900">
                {weights[k] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Speaking gate */}
      <SpeakingGateEditor
        gate={seed.speaking_gate ?? {}}
        onChange={(g) => onChange({ ...seed, speaking_gate: g })}
      />
    </div>
  );
}

function SpeakingGateEditor({
  gate,
  onChange,
}: {
  gate: NonNullable<QuizSeed["speaking_gate"]>;
  onChange: (next: NonNullable<QuizSeed["speaking_gate"]>) => void;
}) {
  const enabled = !!gate.enabled;
  const rung = gate.ladder_rung ?? "guided";
  const minWords = gate.min_words ?? 3;
  return (
    <div className="rounded-md border border-emerald-300 bg-white/60 p-2">
      <label className="flex items-center gap-2 text-[11px] font-semibold text-emerald-900">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange({ ...gate, enabled: e.target.checked })}
        />
        Require speaking to pass
      </label>
      {enabled && (
        <div className="mt-1 grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase text-emerald-800">
              Ladder rung
            </span>
            <select
              value={rung}
              onChange={(e) =>
                onChange({ ...gate, ladder_rung: e.target.value as any })
              }
              className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs"
            >
              <option value="guided">guided</option>
              <option value="supported">supported</option>
              <option value="independent">independent</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase text-emerald-800">
              Min words
            </span>
            <input
              type="number"
              min={1}
              max={40}
              value={minWords}
              onChange={(e) =>
                onChange({ ...gate, min_words: Number(e.target.value) || 3 })
              }
              className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs"
            />
          </label>
        </div>
      )}
    </div>
  );
}





// ─── Catalog picker ─────────────────────────────────────────────────────
function ActivityCatalog({ onAdd }: { onAdd: (e: CatalogEntry) => void }) {
  const groups = (Object.keys(GROUP_LABEL) as CatalogEntry["group"][]).map((g) => ({
    group: g,
    label: GROUP_LABEL[g],
    items: ACTIVITY_CATALOG.filter((c) => c.group === g),
  }));
  return (
    <div className="rounded-xl border border-orange-200 bg-white/70 p-2">
      <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
        <Plus className="h-3 w-3" /> Add activity or game
      </div>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.group}>
            <div className="mb-1 text-[10px] font-semibold uppercase text-orange-600">
              {g.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((c) => (
                <button
                  key={c.type}
                  onClick={() => onAdd(c)}
                  title={c.hint}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-orange-900 hover:border-[#FE6A2F] hover:bg-orange-50"
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Per-activity editor ────────────────────────────────────────────────
export function ActivityEditor({
  block,
  topic,
  vocab,
  context,
  onChange,
  onRemove,
}: {
  block: ActivityBlock;
  topic: string;
  vocab: string[];
  context?: Record<string, unknown>;
  onChange: (next: Partial<ActivityBlock>) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(() => JSON.stringify(block.config ?? {}, null, 2));
  const [err, setErr] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");

  // Resync on upstream change
  useEffect(() => {
    setDraft(JSON.stringify(block.config ?? {}, null, 2));
  }, [block.id, block.config]);

  const commit = (raw: string) => {
    setDraft(raw);
    try {
      const parsed = JSON.parse(raw || "{}");
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        setErr("Config must be a JSON object");
        return;
      }
      setErr(null);
      onChange({ config: parsed });
    } catch (e: any) {
      setErr(e?.message || "Invalid JSON");
    }
  };

  const aiFill = async () => {
    setAiBusy(true);
    setAiErr(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "playground-activity-ai",
        {
          body: {
            activity_type: block.type,
            topic,
            vocab,
            cefr: "Pre-A1",
            instructions: instructions.trim(),
            context: context ?? {},
            current_config: block.config ?? {},
          },
        },
      );
      if (error) throw new Error(error.message);
      const cfg = (data as any)?.config;
      if (!cfg || typeof cfg !== "object") throw new Error("AI returned no config");
      onChange({ config: cfg });
      setDraft(JSON.stringify(cfg, null, 2));
    } catch (e: any) {
      setAiErr(e?.message || "AI fill failed");
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-orange-200 bg-white p-2.5 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <input
            value={block.label ?? ""}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Label"
            className="w-full rounded-md border border-orange-100 bg-orange-50/50 px-2 py-1 text-xs font-bold text-orange-900"
          />
        </div>
        <button
          onClick={onRemove}
          title="Remove activity"
          className="rounded-full p-1 text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-orange-700">
            Type
          </span>
          <input
            value={block.type}
            onChange={(e) => onChange({ type: e.target.value })}
            className="w-full rounded-md border border-orange-200 bg-white px-2 py-1 text-xs"
          />
        </label>
      </div>

      <div className="rounded-lg bg-orange-50/60 p-2">
        <input
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Optional hint to AI (e.g. ‘use farm animals’)"
          className="mb-1.5 w-full rounded-md border border-orange-200 bg-white px-2 py-1 text-[11px]"
        />
        <button
          onClick={aiFill}
          disabled={aiBusy}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FE6A2F] to-amber-500 px-3 py-1 text-[11px] font-bold text-white shadow hover:opacity-90 disabled:opacity-60"
        >
          {aiBusy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {aiBusy ? "Generating…" : "AI fill config"}
        </button>
        {aiErr && (
          <p className="mt-1 text-[10px] font-semibold text-red-600">{aiErr}</p>
        )}
      </div>

      <label className="block">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase text-orange-700">
          Config (JSON — prompt, items, answers…)
        </span>
        <textarea
          value={draft}
          onChange={(e) => commit(e.target.value)}
          rows={10}
          spellCheck={false}
          className={`w-full rounded-md border bg-orange-50/40 px-2 py-1.5 font-mono text-[11px] ${
            err ? "border-red-400" : "border-orange-200"
          }`}
        />
      </label>
      {err && <p className="text-[11px] font-semibold text-red-600">{err}</p>}
    </div>
  );
}
