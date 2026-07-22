/**
 * LessonEditorCanvas — rich, side-by-side editor that replaces the
 * read-only "Preview lesson" view. Shows every page of the active
 * lesson as a card, with inline editing for text, per-block media
 * generation (image / voice / video embed), and add/remove/reorder
 * controls for both pages and blocks.
 *
 * All edits flow through `usePlaygroundUnitMutators().setLessonPages`
 * so they auto-save through CreatorShell's debounced persistence.
 */
import { useMemo } from "react";
import {
  usePlaygroundLesson,
  usePlaygroundUnitMutators,
} from "@/playground-blueprint/PlaygroundUnitContext";
import { derivePages } from "@/playground-blueprint/derivePages";
import type {
  PlaygroundBlock,
  PlaygroundPage,
} from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";
import { MediaSlot } from "./inspector/MediaTab";
import type { ComponentProps } from "react";

/**
 * Wrap MediaSlot so canvas-side image/audio generation mirrors the
 * resulting URL into `lesson.vocab_media`. The live player reads
 * vocabulary visuals from that map (see PlaygroundLessonPlayer →
 * useDynamicVocab), so without this bridge generated images in the
 * canvas never reach the "Play lesson" view.
 */
function MediaSlotWithMirror({
  block,
  lessonNumber,
  onChange,
}: {
  block: ComponentProps<typeof MediaSlot>["block"];
  lessonNumber: PlaygroundLessonNumber;
  onChange: (patch: Partial<PlaygroundBlock>) => void;
}) {
  const { setVocabMedia } = usePlaygroundUnitMutators();
  return (
    <MediaSlot
      block={block}
      onChange={(patch) => {
        const url = (patch as { url?: string }).url;
        if (url && setVocabMedia) {
          if (block.kind === "image") {
            const word = ((block as any).subject || (block as any).label || "").trim();
            if (word) setVocabMedia(lessonNumber, word, { imageUrl: url });
          } else if (block.kind === "audio") {
            const word = ((block as any).text || (block as any).label || "").trim();
            if (word) setVocabMedia(lessonNumber, word, { audioUrl: url });
          }
        }
        onChange(patch as Partial<PlaygroundBlock>);
      }}
    />
  );
}
import { StoryArchitectPanel } from "@/components/playground/StoryArchitectPanel";

type Mutators = ReturnType<typeof usePlaygroundUnitMutators>;

const uid = (prefix: string) =>
  `${prefix}.${Math.random().toString(36).slice(2, 8)}`;

const newBlock = (kind: PlaygroundBlock["kind"]): PlaygroundBlock => {
  switch (kind) {
    case "text":
      return { kind: "text", id: uid("text"), label: "Text", value: "" };
    case "image":
      return { kind: "image", id: uid("img"), label: "Image", subject: "" };
    case "audio":
      return { kind: "audio", id: uid("audio"), label: "Voice", text: "" };
    case "music":
      return { kind: "music", id: uid("music"), label: "Music", mood: "happy upbeat kids" };
    case "video":
      return { kind: "video", id: uid("video"), label: "Video", url: "", provider: "youtube" };
    case "activity":
      return { kind: "activity", id: uid("act"), label: "Activity", type: "drag_drop", config: {} };
  }
};

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function LessonEditorCanvas({
  lessonNumber,
}: {
  lessonNumber: PlaygroundLessonNumber;
}) {
  const lesson = usePlaygroundLesson(lessonNumber);
  const mutators = usePlaygroundUnitMutators();
  const { setLessonPages } = mutators;

  const pages = useMemo<PlaygroundPage[]>(
    () => (lesson ? derivePages(lesson) : []),
    [lesson],
  );

  if (!lesson) {
    return (
      <div className="grid h-full place-items-center p-6 text-sm text-orange-700">
        Pick a lesson to edit.
      </div>
    );
  }

  const commitPages = (next: PlaygroundPage[]) => {
    setLessonPages?.(lessonNumber, next);
  };

  const patchPage = (idx: number, patch: Partial<PlaygroundPage>) =>
    commitPages(pages.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  const addPage = (afterIdx: number) => {
    const blank: PlaygroundPage = {
      id: uid("page"),
      phase_id: "custom",
      title: "New page",
      blocks: [],
    };
    const next = pages.slice();
    next.splice(afterIdx + 1, 0, blank);
    commitPages(next);
  };

  const removePage = (idx: number) => {
    if (!confirm("Delete this page?")) return;
    commitPages(pages.filter((_, i) => i !== idx));
  };

  const movePage = (idx: number, dir: -1 | 1) =>
    commitPages(move(pages, idx, idx + dir));

  return (
    <div className="space-y-4 p-4">
      <StoryArchitectPanel
        lesson={{
          id: (lesson as any).id,
          lesson_number: lesson.lesson_number,
          title: (lesson as any).title,
          focus_label: (lesson as any).focus_label,
          communication_goal: (lesson as any).communication_goal,
          grammar_target: (lesson as any).grammar_target,
          vocab: lesson.vocab ?? [],
          review_targets: ((lesson as any).review_targets ?? []) as string[],
          unit_theme: (lesson as any).unit_theme ?? (lesson as any).unit_topic,
        }}
      />

      {pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-6 text-center text-sm text-orange-800">
          No pages yet.
          <button
            onClick={() => addPage(-1)}
            className="ml-2 rounded-full bg-[#FE6A2F] px-3 py-1 text-xs font-bold text-white"
          >
            + Add first page
          </button>
        </div>
      ) : (
        pages.map((p, idx) => (
          <PageEditorCard
            key={p.id}
            page={p}
            index={idx}
            total={pages.length}
            lessonNumber={lessonNumber}
            onPatch={(patch) => patchPage(idx, patch)}
            onMoveUp={() => movePage(idx, -1)}
            onMoveDown={() => movePage(idx, 1)}
            onRemove={() => removePage(idx)}
            onAddBelow={() => addPage(idx)}
          />
        ))
      )}
    </div>
  );
}

function PageEditorCard({
  page,
  index,
  total,
  lessonNumber,
  onPatch,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddBelow,
}: {
  page: PlaygroundPage;
  index: number;
  total: number;
  lessonNumber: PlaygroundLessonNumber;
  onPatch: (patch: Partial<PlaygroundPage>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddBelow: () => void;
}) {
  const patchBlock = (id: string, patch: Partial<PlaygroundBlock>) => {
    onPatch({
      blocks: page.blocks.map((b) =>
        b.id === id ? ({ ...b, ...patch } as PlaygroundBlock) : b,
      ),
    });
  };
  const removeBlock = (id: string) =>
    onPatch({ blocks: page.blocks.filter((b) => b.id !== id) });
  const moveBlock = (id: string, dir: -1 | 1) => {
    const i = page.blocks.findIndex((b) => b.id === id);
    if (i < 0) return;
    onPatch({ blocks: move(page.blocks, i, i + dir) });
  };
  const addBlock = (kind: PlaygroundBlock["kind"]) =>
    onPatch({ blocks: [...page.blocks, newBlock(kind)] });

  return (
    <section className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
      {/* Page header */}
      <header className="flex flex-wrap items-center gap-2 border-b border-orange-100 bg-orange-50/60 px-3 py-2">
        <span className="rounded-full bg-orange-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-900">
          {index + 1} / {total} · {page.phase_id.replace(/_/g, " ")}
        </span>
        <input
          value={page.title ?? ""}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="Page title"
          className="min-w-0 flex-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-sm font-bold text-orange-950"
        />
        <div className="flex items-center gap-1">
          <IconBtn title="Move up" onClick={onMoveUp} disabled={index === 0}>↑</IconBtn>
          <IconBtn title="Move down" onClick={onMoveDown} disabled={index === total - 1}>↓</IconBtn>
          <IconBtn title="Add page below" onClick={onAddBelow}>＋</IconBtn>
          <IconBtn title="Delete page" onClick={onRemove} danger>✕</IconBtn>
        </div>
      </header>

      {/* Blocks */}
      <div className="space-y-3 p-3">
        {page.blocks.length === 0 ? (
          <p className="text-xs italic text-orange-600">No blocks yet. Add one below.</p>
        ) : (
          page.blocks.map((b, bi) => (
            <BlockEditor
              key={b.id}
              block={b}
              lessonNumber={lessonNumber}
              page={page}
              onChange={(patch) => patchBlock(b.id, patch)}
              onRemove={() => removeBlock(b.id)}
              onMoveUp={() => moveBlock(b.id, -1)}
              onMoveDown={() => moveBlock(b.id, 1)}
              canMoveUp={bi > 0}
              canMoveDown={bi < page.blocks.length - 1}
            />
          ))
        )}
      </div>

      {/* Add-block toolbar */}
      <footer className="flex flex-wrap items-center gap-1 border-t border-orange-100 bg-orange-50/40 px-3 py-2 text-[11px]">
        <span className="mr-1 font-semibold text-orange-900">Add:</span>
        {(["text", "image", "audio", "video", "music", "activity"] as const).map((k) => (
          <button
            key={k}
            onClick={() => addBlock(k)}
            className="rounded-full bg-white px-2 py-0.5 font-semibold text-orange-900 ring-1 ring-orange-200 hover:bg-orange-100"
          >
            + {k}
          </button>
        ))}
      </footer>
    </section>
  );
}

function BlockEditor({
  block,
  lessonNumber,
  page,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  block: PlaygroundBlock;
  lessonNumber: PlaygroundLessonNumber;
  page: PlaygroundPage;
  onChange: (patch: Partial<PlaygroundBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-2">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-orange-800">
        <span>{block.kind}</span>
        <input
          value={block.label ?? ""}
          onChange={(e) => onChange({ label: e.target.value } as Partial<PlaygroundBlock>)}
          placeholder="label"
          className="min-w-0 flex-1 rounded border border-orange-200 bg-white px-1.5 py-0.5 text-[11px] normal-case tracking-normal text-orange-900"
        />
        <IconBtn title="Move up" onClick={onMoveUp} disabled={!canMoveUp}>↑</IconBtn>
        <IconBtn title="Move down" onClick={onMoveDown} disabled={!canMoveDown}>↓</IconBtn>
        <IconBtn title="Delete block" onClick={onRemove} danger>✕</IconBtn>
      </div>

      {block.kind === "text" && (
        <textarea
          value={block.value}
          onChange={(e) => onChange({ value: e.target.value } as Partial<PlaygroundBlock>)}
          rows={Math.min(8, Math.max(2, block.value.split("\n").length + 1))}
          placeholder="Type the words/instruction shown on the page…"
          className="w-full resize-y rounded-md border border-orange-200 bg-white px-2 py-1.5 text-sm text-orange-950"
        />
      )}

      {(block.kind === "image" ||
        block.kind === "audio" ||
        block.kind === "music" ||
        block.kind === "video") && (
        <MediaSlotWithMirror
          block={block as any}
          lessonNumber={lessonNumber}
          onChange={(patch) => onChange(patch as Partial<PlaygroundBlock>)}
        />
      )}

      {block.kind === "activity" && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold text-orange-900">Type</label>
            <input
              value={block.type}
              onChange={(e) => onChange({ type: e.target.value } as Partial<PlaygroundBlock>)}
              className="flex-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-xs"
            />
          </div>
          <textarea
            value={JSON.stringify(block.config ?? {}, null, 2)}
            onChange={(e) => {
              try {
                onChange({ config: JSON.parse(e.target.value || "{}") } as Partial<PlaygroundBlock>);
              } catch {
                /* keep typing — ignore parse errors mid-edit */
              }
            }}
            rows={6}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-orange-200 bg-white px-2 py-1 font-mono text-[11px] text-orange-950"
          />
          <p className="text-[10px] text-orange-700">
            Edit the activity JSON (words, pairs, prompt…). Saved automatically.
          </p>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`h-6 w-6 rounded-md text-xs font-bold ring-1 transition disabled:opacity-30 ${
        danger
          ? "bg-white text-red-600 ring-red-200 hover:bg-red-50"
          : "bg-white text-orange-800 ring-orange-200 hover:bg-orange-100"
      }`}
    >
      {children}
    </button>
  );
}
