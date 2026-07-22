import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { READING_PASSAGE } from './content';
import { accentFor } from '../hubAccent';
import type { Hub } from '../questionBanks';

export interface ReadingResult {
  qid: string;
  choice: number;
  correct: boolean;
}

interface Props {
  hub?: Hub;
  onComplete: (results: ReadingResult[]) => void;
}

const ReadingPhase: React.FC<Props> = ({ hub, onComplete }) => {
  const accent = accentFor(hub);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered =
    READING_PASSAGE.questions.every((q) => answers[q.qid] !== undefined);

  const submit = () => {
    const results = READING_PASSAGE.questions.map((q) => ({
      qid: q.qid,
      choice: answers[q.qid],
      correct: answers[q.qid] === q.correctIndex,
    }));
    onComplete(results);
  };

  return (
    <div className="h-full flex flex-col p-5 sm:p-6 text-white overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold mb-1">Reading</h2>
      <p className="text-xs text-white/70 mb-3">
        Read the passage, then answer all 3 questions.
      </p>

      <div className="flex-1 overflow-auto pr-1 space-y-4">
        <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4 leading-relaxed text-sm sm:text-base">
          {READING_PASSAGE.passage}
        </div>

        {READING_PASSAGE.questions.map((q, qi) => (
          <div key={q.qid} className="space-y-2">
            <div className="text-sm font-semibold">
              {qi + 1}. {q.question}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.qid] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers({ ...answers, [q.qid]: oi })}
                    className={[
                      'text-left rounded-xl px-3 py-2 text-sm border transition',
                      selected
                        ? accent.selected
                        : 'bg-white/5 border-white/15 text-white hover:bg-white/10',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3">
        <Button
          onClick={submit}
          disabled={!allAnswered}
          className={`w-full text-white border-0 bg-gradient-to-r ${accent.cta} shadow-lg ${accent.ctaShadow}`}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ReadingPhase;
