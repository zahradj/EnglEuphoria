import React, { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useScaffoldedAttempts } from '../feedback/useScaffoldedAttempts';
import HintLightbulb from '../feedback/HintLightbulb';
import ReteachModal from '../feedback/ReteachModal';

interface DraggableItem { text: string; category: string; }
interface ActivityData {
  instruction?: string;
  categories: string[];
  draggable_items: DraggableItem[];
}

interface Props {
  slide: any;
  hub?: 'playground' | 'academy' | 'success';
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onComplete?: () => void;
}

const HUB_TINT: Record<string, string> = {
  playground: 'border-amber-300 bg-amber-50',
  academy: 'border-indigo-300 bg-indigo-50',
  success: 'border-emerald-300 bg-emerald-50',
};

const DragAndDropSortingSlide: React.FC<Props> = ({ slide, hub = 'playground', onCorrect, onIncorrect, onComplete }) => {
  const data: ActivityData = (slide?.activity_data ?? slide?.interactive_data) || { categories: [], draggable_items: [] };
  const tint = HUB_TINT[hub] ?? HUB_TINT.playground;
  const hint: string = slide?.hint || slide?.content?.hint || data.instruction || '';
  const reteach = slide?.reteach || slide?.content?.reteach || null;

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const attempts = useScaffoldedAttempts();

  const remaining = useMemo(
    () => data.draggable_items.filter((it) => !placements[it.text]),
    [data.draggable_items, placements],
  );

  const handleDrop = (cat: string) => {
    if (!dragging || attempts.paused) return;
    const item = data.draggable_items.find((i) => i.text === dragging);
    const correct = item?.category === cat;
    const next = { ...placements, [dragging]: cat };
    setPlacements(next);
    setDragging(null);

    if (item) {
      if (correct) {
        onCorrect?.();
      } else {
        setWrongFlash(item.text);
        setTimeout(() => setWrongFlash(null), 500);
        attempts.registerWrong();
        onIncorrect?.();
      }
    }
    if (Object.keys(next).length === data.draggable_items.length) {
      setReveal(true);
      onComplete?.();
    }
  };

  const reset = () => { setPlacements({}); setReveal(false); attempts.reset(); };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">{slide.title || 'Sort the items'}</h2>
        {attempts.strike === 'hint' && hint && <HintLightbulb hint={hint} />}
      </div>
      {data.instruction && <p className="text-muted-foreground">{data.instruction}</p>}

      <div className={`rounded-2xl border-2 border-dashed p-4 min-h-[100px] ${tint}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</p>
        <div className="flex flex-wrap gap-2">
          {remaining.map((it) => (
            <div
              key={it.text}
              draggable={!attempts.paused}
              onDragStart={() => setDragging(it.text)}
              className={`px-4 py-2 rounded-full bg-white border-2 font-semibold cursor-grab active:cursor-grabbing select-none transition ${
                wrongFlash === it.text ? 'border-destructive animate-pulse' : 'border-foreground/20'
              }`}
            >
              {it.text}
            </div>
          ))}
          {remaining.length === 0 && <p className="text-sm text-muted-foreground">All sorted!</p>}
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, data.categories.length)}, minmax(0, 1fr))` }}>
        {data.categories.map((cat) => {
          const inside = data.draggable_items.filter((it) => placements[it.text] === cat);
          return (
            <div
              key={cat}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(cat)}
              className="rounded-2xl border-2 bg-card p-4 min-h-[180px] hover:border-primary transition"
            >
              <p className="text-sm font-bold text-center mb-3 uppercase tracking-wide">{cat}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {inside.map((it) => {
                  const correct = it.category === cat;
                  return (
                    <span
                      key={it.text}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${
                        reveal
                          ? correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-400 text-rose-800'
                          : 'bg-muted border-foreground/20'
                      }`}
                    >
                      {it.text}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {reveal && (
        <div className="flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-5 h-5" /> Done!
          </span>
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}

      <ReteachModal
        open={attempts.paused}
        reteach={reteach}
        fallbackHint={hint || 'Look at each item and match it to the category it belongs to.'}
        onResume={() => {
          attempts.resume();
          // Remove the most recent mis-placements so the learner can retry cleanly.
          const correctOnly: Record<string, string> = {};
          for (const it of data.draggable_items) {
            if (placements[it.text] && placements[it.text] === it.category) {
              correctOnly[it.text] = it.category;
            }
          }
          setPlacements(correctOnly);
          setReveal(false);
        }}
      />
    </div>
  );
};

export default DragAndDropSortingSlide;
