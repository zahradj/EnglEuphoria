import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, RotateCcw } from 'lucide-react';
import { playDing, playBuzz } from '@/lib/gameAudio';

export interface SentenceBuilderContent {
  prompt?: string;
  scrambled: string[]; // shuffled words shown to student
  correctOrder: string[]; // ground truth
}

interface Props {
  content: SentenceBuilderContent;
  onComplete?: () => void;
}

function Chip({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-4 py-2 rounded-xl bg-white border-2 border-indigo-300 text-slate-800 font-semibold shadow-sm hover:border-indigo-500 transition cursor-grab active:cursor-grabbing"
    >
      {label}
    </button>
  );
}

export default function SentenceBuilderGame({ content, onComplete }: Props) {
  const initial = useMemo(
    () => content.scrambled.map((w, i) => ({ id: `${i}-${w}`, label: w })),
    [content.scrambled]
  );
  const [order, setOrder] = useState(initial);
  const [solved, setSolved] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIdx = prev.findIndex((c) => c.id === active.id);
      const newIdx = prev.findIndex((c) => c.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  function check() {
    const built = order.map((c) => c.label);
    const ok = built.length === content.correctOrder.length && built.every((w, i) => w === content.correctOrder[i]);
    if (ok) {
      setSolved(true);
      playDing();
      onComplete?.();
    } else {
      playBuzz();
    }
  }

  function reset() {
    setOrder(initial);
    setSolved(false);
  }

  return (
    <div className="space-y-5">
      {content.prompt && (
        <p className="text-slate-700 text-base">{content.prompt}</p>
      )}

      <div className={`min-h-[72px] p-4 rounded-2xl border-2 border-dashed transition ${solved ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-2 items-center">
              {order.map((c) => (
                <Chip key={c.id} id={c.id} label={c.label} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={check}
          disabled={solved}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-2 text-sm disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Check
        </button>
        <button onClick={reset} className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {solved && <span className="text-emerald-600 font-semibold animate-in fade-in">Perfect! ✨</span>}
      </div>
    </div>
  );
}
