import React, { useState, useCallback } from 'react';
import { ArrowDownUp, Check, X, RotateCcw, GripVertical } from 'lucide-react';
import WhyWrongButton from './WhyWrongButton';
import { Button } from '@/components/ui/button';

interface SortingItem {
  word: string;
  correct_category: string;
}

interface EditorialSortingGameProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

const CATEGORY_COLORS = [
  { border: 'border-sky-300', bg: 'bg-sky-50', activeBg: 'bg-sky-100', label: 'text-sky-600', tag: 'bg-sky-100 text-sky-700 border-sky-200' },
  { border: 'border-violet-300', bg: 'bg-violet-50', activeBg: 'bg-violet-100', label: 'text-violet-600', tag: 'bg-violet-100 text-violet-700 border-violet-200' },
  { border: 'border-amber-300', bg: 'bg-amber-50', activeBg: 'bg-amber-100', label: 'text-amber-600', tag: 'bg-amber-100 text-amber-700 border-amber-200' },
  { border: 'border-rose-300', bg: 'bg-rose-50', activeBg: 'bg-rose-100', label: 'text-rose-600', tag: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export default function EditorialSortingGame({ slide, onCorrect, onIncorrect }: EditorialSortingGameProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const categories: string[] = Array.isArray(payload.categories) ? payload.categories : [];
  const items: SortingItem[] = Array.isArray(payload.items) ? payload.items : [];

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleDrop = useCallback((word: string, category: string) => {
    if (checked) return;
    setPlacements(prev => ({ ...prev, [word]: category }));
    setDragOver(null);
    setDragItem(null);
  }, [checked]);

  const handleRemove = useCallback((word: string) => {
    if (checked) return;
    setPlacements(prev => {
      const next = { ...prev };
      delete next[word];
      return next;
    });
  }, [checked]);

  const handleCheck = useCallback(() => {
    const newResults: Record<string, boolean> = {};
    let allCorrect = true;
    items.forEach(item => {
      const isCorrect = placements[item.word] === item.correct_category;
      newResults[item.word] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });
    setResults(newResults);
    setChecked(true);
    if (allCorrect) onCorrect?.();
    else onIncorrect?.();
  }, [items, placements, onCorrect, onIncorrect]);

  const handleReset = () => {
    setPlacements({});
    setChecked(false);
    setResults({});
  };

  if (categories.length === 0 || items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-4">{slide.title}</h2>
        <p className="text-slate-600">{slide.description}</p>
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  const unplaced = items.filter(item => !placements[item.word]);
  const allPlaced = Object.keys(placements).length === items.length;
  const score = checked ? Object.values(results).filter(Boolean).length : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <ArrowDownUp className="w-8 h-8 text-emerald-500 mt-1 flex-shrink-0" />
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
            {slide.title || 'Sort the Words'}
          </h2>
          {slide.description && (
            <p className="mt-1 text-slate-500 text-base">{slide.description}</p>
          )}
        </div>
      </div>

      {/* Draggable word bank */}
      {unplaced.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Drag each word into the correct category</p>
          <div className="flex flex-wrap gap-3">
            {unplaced.map((item) => (
              <span
                key={item.word}
                className={`inline-flex items-center gap-1.5 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-slate-200 cursor-grab shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-95 ${
                  dragItem === item.word ? 'opacity-50 scale-95' : ''
                }`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.word);
                  setDragItem(item.word);
                }}
                onDragEnd={() => setDragItem(null)}
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                {item.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category drop zones */}
      <div className={`grid gap-5 ${categories.length === 2 ? 'grid-cols-1 md:grid-cols-2' : categories.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
        {categories.map((cat, ci) => {
          const color = CATEGORY_COLORS[ci % CATEGORY_COLORS.length];
          const catItems = items.filter(item => placements[item.word] === cat);
          const isOver = dragOver === cat;

          return (
            <div
              key={cat}
              className={`rounded-xl p-5 min-h-[140px] border-2 border-dashed transition-all duration-200 ${
                isOver
                  ? `${color.border} ${color.activeBg} scale-[1.02]`
                  : `${color.border} ${color.bg}`
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(cat);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                const word = e.dataTransfer.getData('text/plain');
                if (word) handleDrop(word, cat);
              }}
            >
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${color.label}`}>{cat}</h3>
              {catItems.length === 0 && !isOver && (
                <p className="text-xs text-slate-300 italic">Drop words here…</p>
              )}
              <div className="flex flex-wrap gap-2">
                {catItems.map((item) => {
                  let tagClass = `${color.tag} border`;
                  if (checked) {
                    tagClass = results[item.word]
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-red-100 text-red-700 border-red-300';
                  }

                  return (
                    <span
                      key={item.word}
                      onClick={() => handleRemove(item.word)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${tagClass} ${!checked ? 'cursor-pointer hover:opacity-75' : ''}`}
                    >
                      {item.word}
                      {checked && results[item.word] && <Check className="w-3.5 h-3.5" />}
                      {checked && !results[item.word] && <X className="w-3.5 h-3.5" />}
                      {!checked && <X className="w-3 h-3 opacity-40" />}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        {!checked && allPlaced && (
          <Button onClick={handleCheck} className="px-10 py-3 text-base font-semibold">
            Check Answers
          </Button>
        )}
        {checked && (
          <>
            <div className={`rounded-xl px-6 py-3 font-semibold text-sm ${
              score === items.length
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {score === items.length
                ? '🎉 Perfect! All correct!'
                : `${score}/${items.length} correct — try again!`}
            </div>
            {score < items.length && (
              <div className="flex items-center gap-2">
                <WhyWrongButton
                  questionText="Sort words into categories"
                  correctAnswer={items.filter(it => !results[it.word]).map(it => `${it.word} → ${it.correct_category}`).join(', ')}
                  userAnswer={items.filter(it => !results[it.word]).map(it => `${it.word} → ${placements[it.word] || '(none)'}`).join(', ')}
                />
                <Button variant="outline" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
