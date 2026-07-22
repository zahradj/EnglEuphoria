import { useState } from 'react';
import { playDing, playBuzz } from '@/lib/gameAudio';

export interface InterviewTurn {
  question: string;
  options: { text: string; correct: boolean; feedback?: string }[];
}

export interface InterviewContent {
  intro?: string;
  avatar?: string; // emoji or url
  turns: InterviewTurn[];
}

interface Props {
  content: InterviewContent;
  onComplete?: () => void;
}

export default function InterviewGame({ content, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<{ q: string; a: string; correct: boolean }[]>([]);
  const [confused, setConfused] = useState(false);
  const [done, setDone] = useState(false);

  const turn = content.turns[step];
  const avatar = content.avatar || '🧑‍💼';

  function pick(optIdx: number) {
    if (done) return;
    const opt = turn.options[optIdx];
    if (opt.correct) {
      setConfused(false);
      setHistory((h) => [...h, { q: turn.question, a: opt.text, correct: true }]);
      playDing();
      const next = step + 1;
      if (next >= content.turns.length) {
        setDone(true);
        onComplete?.();
      } else {
        setStep(next);
      }
    } else {
      setConfused(true);
      playBuzz();
    }
  }

  return (
    <div className="space-y-4">
      {content.intro && step === 0 && history.length === 0 && (
        <p className="text-slate-700">{content.intro}</p>
      )}

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            <div className="flex gap-2"><span className="text-2xl">{avatar}</span>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2 text-slate-800">{h.q}</div>
            </div>
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%]">{h.a}</div>
            </div>
          </div>
        ))}

        {!done && (
          <div className="flex gap-2">
            <span className={`text-2xl transition ${confused ? 'grayscale' : ''}`}>{confused ? '😕' : avatar}</span>
            <div className={`rounded-2xl rounded-tl-sm px-4 py-2 ${confused ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
              {confused ? "Hmm, that doesn't sound right. Try a different tense." : turn.question}
            </div>
          </div>
        )}
      </div>

      {!done && (
        <div className="grid gap-2">
          {turn.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className="text-left rounded-xl border-2 border-indigo-200 hover:border-indigo-500 bg-white px-4 py-3 text-slate-800 transition"
            >
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {done && (
        <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 p-4 text-emerald-800 font-semibold">
          Interview complete! 🎉 Great grammar awareness.
        </div>
      )}
    </div>
  );
}
