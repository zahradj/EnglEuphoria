import { useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { Check, RotateCcw } from 'lucide-react';
import { playDing, playBuzz } from '@/lib/gameAudio';

export interface SortingContent {
  prompt?: string;
  buckets: { id: string; label: string }[];
  words: { text: string; correctBucket: string }[];
}

interface Props {
  content: SortingContent;
  onComplete?: () => void;
}

function DraggableWord({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`px-3 py-2 rounded-xl bg-white border-2 border-indigo-300 font-semibold text-slate-800 shadow-sm cursor-grab ${isDragging ? 'opacity-50' : ''}`}
    >
      {text}
    </button>
  );
}

function Bucket({ id, label, items, isCorrectFlash }: { id: string; label: string; items: string[]; isCorrectFlash: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 border-dashed p-3 min-h-[120px] transition ${
        isOver ? 'border-indigo-500 bg-indigo-50' : isCorrectFlash ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50'
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 text-center">{label}</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {items.map((t) => (
          <span key={t} className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold text-sm">{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function GrammarSortingGame({ content, onComplete }: Props) {
  const [placed, setPlaced] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(content.buckets.map((b) => [b.id, []]))
  );
  const [pool, setPool] = useState(() => content.words.map((w, i) => ({ id: `w-${i}`, text: w.text, correctBucket: w.correctBucket })));
  const [flash, setFlash] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const totalWords = content.words.length;
  const placedCount = useMemo(() => Object.values(placed).reduce((n, arr) => n + arr.length, 0), [placed]);
  const solved = placedCount === totalWords;

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const wordId = String(active.id);
    const bucketId = String(over.id);
    const word = pool.find((w) => w.id === wordId);
    if (!word) return;
    if (word.correctBucket !== bucketId) {
      playBuzz();
      return; // snap back (don't move)
    }
    setPool((prev) => prev.filter((w) => w.id !== wordId));
    setPlaced((prev) => ({ ...prev, [bucketId]: [...prev[bucketId], word.text] }));
    setFlash(bucketId);
    setTimeout(() => setFlash(null), 500);
    playDing();
    if (placedCount + 1 === totalWords) onComplete?.();
  }

  function reset() {
    setPlaced(Object.fromEntries(content.buckets.map((b) => [b.id, []])));
    setPool(content.words.map((w, i) => ({ id: `w-${i}`, text: w.text, correctBucket: w.correctBucket })));
  }

  return (
    <div className="space-y-5">
      {content.prompt && <p className="text-slate-700">{content.prompt}</p>}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className={`grid gap-3 grid-cols-1 sm:grid-cols-${Math.min(content.buckets.length, 4)}`}>
          {content.buckets.map((b) => (
            <Bucket key={b.id} id={b.id} label={b.label} items={placed[b.id]} isCorrectFlash={flash === b.id} />
          ))}
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Drag from here</div>
          <div className="flex flex-wrap gap-2">
            {pool.map((w) => (
              <DraggableWord key={w.id} id={w.id} text={w.text} />
            ))}
            {pool.length === 0 && <span className="text-slate-400 text-sm italic">All sorted ✓</span>}
          </div>
        </div>
      </DndContext>

      <div className="flex items-center gap-2">
        <button onClick={reset} className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {solved && (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <Check className="w-4 h-4" /> Nicely sorted!
          </span>
        )}
      </div>
    </div>
  );
}
