import React, { useState, useCallback } from 'react';
import { Puzzle, Check, RotateCcw, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorialSentenceBuilderProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function EditorialSentenceBuilder({ slide, onCorrect, onIncorrect }: EditorialSentenceBuilderProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const targetSentence: string = payload.target_sentence || '';
  const scrambledWords: string[] = Array.isArray(payload.scrambled_words) ? payload.scrambled_words : [];

  const [placed, setPlaced] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>(scrambledWords);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAddWord = (word: string, index: number) => {
    if (checked) return;
    setPlaced(prev => [...prev, word]);
    setRemaining(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleRemoveWord = (index: number) => {
    if (checked) return;
    const word = placed[index];
    setPlaced(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    setRemaining(prev => [...prev, word]);
  };

  const normalize = (str: string) =>
    str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').replace(/\s{2,}/g, ' ').trim();

  const handleCheck = useCallback(() => {
    const normalizedPlaced = placed.map(w => normalize(w));
    const normalizedTarget = normalize(targetSentence).split(' ').filter(Boolean);

    // Check if the core word order matches (allow extra trailing filler words)
    let correct = true;
    if (normalizedPlaced.length < normalizedTarget.length) {
      correct = false;
    } else {
      for (let i = 0; i < normalizedTarget.length; i++) {
        if (normalizedPlaced[i] !== normalizedTarget[i]) {
          correct = false;
          break;
        }
      }
    }

    setIsCorrect(correct);
    setChecked(true);
    if (correct) onCorrect?.();
    else onIncorrect?.();
  }, [placed, targetSentence, onCorrect, onIncorrect]);

  const handleReset = () => {
    setPlaced([]);
    setRemaining([...scrambledWords]);
    setChecked(false);
    setIsCorrect(false);
  };

  if (scrambledWords.length === 0 || !targetSentence) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-4">{slide.title}</h2>
        <p className="text-slate-600">{slide.description}</p>
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <Puzzle className="w-8 h-8 text-teal-500 mt-1 flex-shrink-0" />
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
            {slide.title || 'Build the Sentence'}
          </h2>
          {slide.description && (
            <p className="mt-1 text-slate-500 text-base">{slide.description}</p>
          )}
        </div>
      </div>

      {/* Sentence construction zone */}
      <div className={`min-h-[80px] rounded-xl p-5 border-2 transition-all ${
        checked
          ? isCorrect
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-red-300 bg-red-50'
          : 'border-dashed border-slate-300 bg-slate-50'
      }`}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {placed.length === 0 ? 'Tap words below to build the sentence' : 'Your sentence'}
        </p>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {placed.map((word, i) => (
            <button
              key={`${word}-${i}`}
              onClick={() => handleRemoveWord(i)}
              disabled={checked}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                checked
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                    : 'border-red-300 bg-red-100 text-red-700'
                  : 'border-sky-300 bg-sky-50 text-sky-700 cursor-pointer hover:bg-sky-100'
              }`}
            >
              {word}
              {!checked && <span className="text-sky-400 text-xs ml-1">×</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Word bank */}
      {remaining.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Available words</p>
          <div className="flex flex-wrap gap-3">
            {remaining.map((word, i) => (
              <button
                key={`${word}-${i}`}
                onClick={() => handleAddWord(word, i)}
                disabled={checked}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-slate-200 bg-white text-slate-700 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all active:scale-95"
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        {!checked && placed.length > 0 && (
          <Button onClick={handleCheck} className="px-10 py-3 text-base font-semibold">
            Check Sentence
          </Button>
        )}
        {checked && (
          <>
            <div className={`rounded-xl px-6 py-3 font-semibold text-sm ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {isCorrect
                ? '🎉 Perfect sentence!'
                : <>✗ Not quite. Correct: <strong>"{targetSentence}"</strong></>}
            </div>
            {!isCorrect && (
              <Button variant="outline" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
