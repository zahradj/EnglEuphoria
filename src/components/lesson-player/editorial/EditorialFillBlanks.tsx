import React, { useState, useCallback, useMemo } from 'react';
import { PenLine, Check, X, RotateCcw, Lightbulb } from 'lucide-react';
import WhyWrongButton from './WhyWrongButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSlideHub } from '../SlideHubContext';
import TeacherDiscussionFallback from './TeacherDiscussionFallback';
import { evaluateAnswer } from '@/utils/fuzzyAnswerEvaluator';

interface BlankSentence {
  text_with_blank: string;
  hint?: string;
  correct_answer: string;
}

interface EditorialFillBlanksProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function EditorialFillBlanks({ slide, onCorrect, onIncorrect }: EditorialFillBlanksProps) {
  const { accent, accentSoft } = useSlideHub();
  const payload = slide?.interactive_data || slide?.content || {};
  const sentences: BlankSentence[] = useMemo(() => {
    const list = Array.isArray(payload.sentences) ? payload.sentences : [];
    return list.slice(0, 5);
  }, [payload.sentences]);

  const [answers, setAnswers] = useState<string[]>(() => new Array(sentences.length).fill(''));
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [showHints, setShowHints] = useState<boolean[]>(() => new Array(sentences.length).fill(false));

  const handleCheck = useCallback(() => {
    // Fuzzy match (RoadWords-distilled): tolerates 1-2 char typos so kids
    // don't get marked wrong for "happi" vs "happy".
    const newResults = sentences.map(
      (s, i) => evaluateAnswer(answers[i] ?? '', [s.correct_answer]).isCorrect,
    );
    setResults(newResults);
    setChecked(true);
    if (newResults.every(Boolean)) onCorrect?.();
    else onIncorrect?.();
  }, [sentences, answers, onCorrect, onIncorrect]);

  const handleRetry = () => {
    setAnswers(new Array(sentences.length).fill(''));
    setChecked(false);
    setResults([]);
  };

  const toggleHint = (i: number) => {
    setShowHints((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  if (sentences.length === 0) {
    return <TeacherDiscussionFallback slide={slide} />;
  }

  const score = checked ? results.filter(Boolean).length : 0;
  const allFilled = answers.every((a) => a.trim().length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentSoft }}>
          <PenLine className="w-5 h-5" style={{ color: accent }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
            {slide.title || 'Fill in the Blanks'}
          </h2>
          {slide.description && <p className="text-slate-500 text-sm mt-0.5">{slide.description}</p>}
        </div>
      </div>

      <div className="space-y-3">
        {sentences.map((sentence, i) => {
          const parts = sentence.text_with_blank.split('___');
          const hasHint = !!sentence.hint;
          return (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 border-2 bg-white transition-all ${
                checked ? (results[i] ? 'border-emerald-300' : 'border-red-300') : ''
              }`}
              style={!checked ? { borderColor: `${accent}33` } : undefined}
            >
              <div className="flex flex-wrap items-center gap-2 text-base text-slate-900 leading-relaxed">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: accent }}
                >
                  {i + 1}
                </span>
                <span>{parts[0]}</span>
                <Input
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  disabled={checked}
                  className={`inline-block w-36 h-9 mx-1 text-center font-semibold text-base border-2 rounded-md text-slate-900 ${
                    checked
                      ? results[i]
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-red-400 bg-red-50 text-red-700'
                      : 'border-slate-300'
                  }`}
                  style={!checked ? ({ ['--tw-ring-color' as any]: accent } as React.CSSProperties) : undefined}
                  placeholder="type…"
                />
                <span>{parts[1] || ''}</span>

                {hasHint && !checked && (
                  <button
                    onClick={() => toggleHint(i)}
                    className="ml-auto inline-flex items-center gap-1 text-xs hover:underline"
                    style={{ color: accent }}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHints[i] ? 'hide' : 'hint'}
                  </button>
                )}
              </div>

              {hasHint && showHints[i] && !checked && (
                <p className="mt-2 text-xs italic" style={{ color: accent }}>💡 {sentence.hint}</p>
              )}

              {checked && !results[i] && (
                <div className="mt-2">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Correct: <strong className="ml-1">{sentence.correct_answer}</strong>
                  </p>
                  <WhyWrongButton
                    questionText={sentence.text_with_blank}
                    correctAnswer={sentence.correct_answer}
                    userAnswer={answers[i]}
                  />
                </div>
              )}
              {checked && results[i] && (
                <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Correct!
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        {!checked && (
          <Button
            onClick={handleCheck}
            disabled={!allFilled}
            className="px-8 py-2.5 text-sm font-semibold text-white"
            style={{ background: allFilled ? accent : undefined }}
          >
            Check All Answers
          </Button>
        )}
        {checked && (
          <>
            <div
              className={`rounded-lg px-4 py-2 font-semibold text-sm border ${
                score === sentences.length
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {score === sentences.length ? '🎉 Perfect!' : `${score}/${sentences.length} correct`}
            </div>
            {score < sentences.length && (
              <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
