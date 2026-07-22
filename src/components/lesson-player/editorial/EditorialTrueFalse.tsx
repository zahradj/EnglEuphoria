import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ListChecks } from 'lucide-react';
import WhyWrongButton from './WhyWrongButton';
import { Button } from '@/components/ui/button';

interface TFStatement {
  text: string;
  is_true: boolean;
}

interface EditorialTrueFalseProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function EditorialTrueFalse({ slide, onCorrect, onIncorrect }: EditorialTrueFalseProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const statements: TFStatement[] = Array.isArray(payload.statements) ? payload.statements : [];

  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});

  const handleSelect = (index: number, value: boolean) => {
    if (checked) return;
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleCheck = useCallback(() => {
    const newResults: Record<number, boolean> = {};
    let allCorrect = true;
    statements.forEach((stmt, i) => {
      const isCorrect = answers[i] === stmt.is_true;
      newResults[i] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });
    setResults(newResults);
    setChecked(true);
    if (allCorrect) onCorrect?.();
    else onIncorrect?.();
  }, [statements, answers, onCorrect, onIncorrect]);

  const handleReset = () => {
    setAnswers({});
    setChecked(false);
    setResults({});
  };

  if (statements.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-4">{slide.title}</h2>
        <p className="text-slate-600">{slide.description}</p>
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  const allAnswered = statements.every((_, i) => answers[i] !== undefined && answers[i] !== null);
  const score = checked ? Object.values(results).filter(Boolean).length : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <ListChecks className="w-8 h-8 text-orange-500 mt-1 flex-shrink-0" />
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
            {slide.title || 'True or False?'}
          </h2>
          {slide.description && (
            <p className="mt-1 text-slate-500 text-base">{slide.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {statements.map((stmt, i) => {
          const selected = answers[i];
          const wasChecked = checked && results[i] !== undefined;

          return (
            <div
              key={i}
              className={`bg-white rounded-xl p-5 border transition-all ${
                wasChecked
                  ? results[i]
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-red-200 bg-red-50/30'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5">
                  {i + 1}
                </span>
                <p className="flex-1 text-base text-slate-700 font-medium leading-relaxed">{stmt.text}</p>
              </div>

              <div className="flex items-center gap-3 mt-4 ml-11">
                <button
                  onClick={() => handleSelect(i, true)}
                  disabled={checked}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    selected === true
                      ? checked
                        ? results[i]
                          ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                          : 'border-red-400 bg-red-100 text-red-700'
                        : 'border-sky-400 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  } ${checked ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  ✓ True
                </button>
                <button
                  onClick={() => handleSelect(i, false)}
                  disabled={checked}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    selected === false
                      ? checked
                        ? results[i]
                          ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                          : 'border-red-400 bg-red-100 text-red-700'
                        : 'border-sky-400 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  } ${checked ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  ✗ False
                </button>

                {checked && !results[i] && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-red-500">
                      Answer: <strong>{stmt.is_true ? 'True' : 'False'}</strong>
                    </span>
                    <WhyWrongButton
                      questionText={stmt.text}
                      correctAnswer={stmt.is_true ? 'True' : 'False'}
                      userAnswer={answers[i] === true ? 'True' : 'False'}
                    />
                  </div>
                )}
                {checked && results[i] && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4">
        {!checked && allAnswered && (
          <Button onClick={handleCheck} className="px-10 py-3 text-base font-semibold">
            Check Answers
          </Button>
        )}
        {checked && (
          <>
            <div className={`rounded-xl px-6 py-3 font-semibold text-sm ${
              score === statements.length
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {score === statements.length
                ? '🎉 Perfect! All correct!'
                : `${score}/${statements.length} correct`}
            </div>
            {score < statements.length && (
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
