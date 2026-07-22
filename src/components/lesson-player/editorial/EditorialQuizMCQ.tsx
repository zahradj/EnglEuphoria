import React, { useState } from 'react';
import { HelpCircle, Check, X, PartyPopper, RotateCcw } from 'lucide-react';
import WhyWrongButton from './WhyWrongButton';
import { Button } from '@/components/ui/button';

interface EditorialQuizMCQProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function EditorialQuizMCQ({ slide, onCorrect, onIncorrect }: EditorialQuizMCQProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const question = payload.question || slide?.title || '';
  const options: string[] = Array.isArray(payload.options) ? payload.options : [];
  const correctIndex = typeof payload.correct_index === 'number' ? payload.correct_index : 0;
  const explanation = payload.explanation || '';

  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = selected === correctIndex;

  const handleSelect = (i: number) => {
    if (checked) return;
    setSelected(i);
  };

  const handleSubmit = () => {
    if (selected === null || checked) return;
    setChecked(true);
    if (selected === correctIndex) onCorrect?.();
    else onIncorrect?.();
  };

  const handleRetry = () => {
    setSelected(null);
    setChecked(false);
  };

  if (options.length === 0) {
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
        <HelpCircle className="w-8 h-8 text-sky-500 mt-1 flex-shrink-0" />
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
          {slide.title || 'Quiz'}
        </h2>
      </div>

      {question && question !== slide.title && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
          <p className="text-xl text-slate-700 font-medium leading-relaxed">{question}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          const isThisSelected = selected === i;
          const isThisCorrect = i === correctIndex;

          let ringClass = 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm';
          let letterBg = 'bg-slate-100 text-slate-500';
          let textColor = 'text-slate-700';

          if (!checked && isThisSelected) {
            ringClass = 'border-sky-400 bg-sky-50 ring-2 ring-sky-200 shadow-md';
            letterBg = 'bg-sky-500 text-white';
            textColor = 'text-sky-800';
          }

          if (checked) {
            if (isThisCorrect) {
              ringClass = 'border-emerald-400 bg-emerald-50 shadow-md';
              letterBg = 'bg-emerald-500 text-white';
              textColor = 'text-emerald-800';
            } else if (isThisSelected && !isThisCorrect) {
              ringClass = 'border-red-400 bg-red-50';
              letterBg = 'bg-red-500 text-white';
              textColor = 'text-red-700';
            } else {
              ringClass = 'border-slate-100 bg-slate-50 opacity-50';
              letterBg = 'bg-slate-100 text-slate-400';
              textColor = 'text-slate-400';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={checked}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all duration-200 ${ringClass} ${!checked ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${letterBg}`}>
                {LETTERS[i]}
              </span>
              <span className={`text-base font-medium flex-1 ${textColor}`}>{opt}</span>
              {checked && isThisCorrect && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              {checked && isThisSelected && !isThisCorrect && <X className="w-5 h-5 text-red-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      {!checked && selected !== null && (
        <Button onClick={handleSubmit} className="self-center px-10 py-3 text-base font-semibold">
          Submit Answer
        </Button>
      )}

      {/* Feedback banner */}
      {checked && (
        <div className={`rounded-xl p-5 flex items-start gap-4 border ${
          isCorrect
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {isCorrect ? (
            <PartyPopper className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          ) : (
            <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-semibold text-base ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
              {isCorrect ? '🎉 Correct! Well done!' : `✗ Not quite. The answer is "${options[correctIndex]}".`}
            </p>
            {explanation && (
              <p className="mt-1 text-sm text-slate-600">{explanation}</p>
            )}
          </div>
          {!isCorrect && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <WhyWrongButton
                questionText={question}
                correctAnswer={options[correctIndex]}
                userAnswer={selected !== null ? options[selected] : ''}
              />
              <Button variant="ghost" size="sm" onClick={handleRetry} className="flex-shrink-0">
                <RotateCcw className="w-4 h-4 mr-1" /> Retry
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
