import React, { useState, useMemo, useCallback } from 'react';
import { Link2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSlideHub } from '../SlideHubContext';
import TeacherDiscussionFallback from './TeacherDiscussionFallback';

interface MatchPair {
  left_part: string;
  right_part: string;
}

interface EditorialMatchHalvesProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function EditorialMatchHalves({ slide, onCorrect, onIncorrect }: EditorialMatchHalvesProps) {
  const { accent, accentSoft } = useSlideHub();
  const payload = slide?.interactive_data || slide?.content || {};
  const rawPairs: any[] = Array.isArray(payload.pairs) ? payload.pairs : [];
  const pairs: MatchPair[] = useMemo(
    () =>
      rawPairs
        .map((p) => ({
          left_part: p.left_part || p.left || p.left_item || p.term || p.word || '',
          right_part: p.right_part || p.right || p.right_item || p.match || p.definition || '',
        }))
        .filter((p) => p.left_part && p.right_part)
        .slice(0, 6),
    [rawPairs]
  );

  const shuffledRight = useMemo(() => {
    const rights = pairs.map((p) => p.right_part);
    return rights.sort(() => Math.random() - 0.5);
  }, [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});

  const handleRightClick = useCallback(
    (right: string) => {
      if (selectedLeft === null || checked) return;
      setMatches((prev) => {
        // Remove any existing assignment of this right to another left
        const cleaned: Record<number, string> = {};
        for (const [k, v] of Object.entries(prev)) if (v !== right) cleaned[Number(k)] = v;
        cleaned[selectedLeft] = right;
        return cleaned;
      });
      setSelectedLeft(null);
    },
    [selectedLeft, checked]
  );

  const handleCheck = useCallback(() => {
    const newResults: Record<number, boolean> = {};
    let allCorrect = true;
    pairs.forEach((pair, i) => {
      const isCorrect = matches[i] === pair.right_part;
      newResults[i] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });
    setResults(newResults);
    setChecked(true);
    if (allCorrect) onCorrect?.();
    else onIncorrect?.();
  }, [pairs, matches, onCorrect, onIncorrect]);

  const handleReset = () => {
    setMatches({});
    setResults({});
    setChecked(false);
    setSelectedLeft(null);
  };

  if (pairs.length === 0) {
    return <TeacherDiscussionFallback slide={slide} />;
  }

  const usedRights = new Set(Object.values(matches));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentSoft }}>
          <Link2 className="w-5 h-5" style={{ color: accent }} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
          {slide.title || 'Match the Pairs'}
        </h2>
      </div>

      <p className="text-sm text-slate-500">
        Tap an item on the left, then tap its match on the right.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {/* Left column */}
        <div className="space-y-2">
          {pairs.map((pair, i) => {
            const isSelected = selectedLeft === i;
            const correctness = checked ? results[i] : null;
            return (
              <button
                key={i}
                onClick={() => !checked && setSelectedLeft(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm md:text-base font-medium text-slate-900 bg-white transition-all`}
                style={{
                  borderColor:
                    correctness === true
                      ? '#10b981'
                      : correctness === false
                      ? '#ef4444'
                      : isSelected
                      ? accent
                      : `${accent}33`,
                  background: isSelected ? accentSoft : matches[i] ? '#f8fafc' : '#ffffff',
                  boxShadow: isSelected ? `0 0 0 3px ${accent}33` : undefined,
                }}
              >
                {pair.left_part}
                {matches[i] && (
                  <span className="block text-xs mt-1 text-slate-500">→ {matches[i]}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {shuffledRight.map((right, i) => {
            const used = usedRights.has(right);
            return (
              <button
                key={i}
                onClick={() => handleRightClick(right)}
                disabled={used || checked}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm md:text-base font-medium text-slate-900 transition-all ${
                  used ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'
                }`}
                style={{
                  borderColor: used ? '#cbd5e1' : selectedLeft !== null ? accent : `${accent}33`,
                  background: used ? '#f1f5f9' : '#ffffff',
                }}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        {!checked && Object.keys(matches).length === pairs.length && (
          <Button
            onClick={handleCheck}
            className="px-8 py-2.5 font-semibold text-white"
            style={{ background: accent }}
          >
            Check Matches
          </Button>
        )}
        {checked && (
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
