// src/components/lesson/phases/BasketSort.tsx
// Topic-container sorting phase. Grid columns + completion target scale
// dynamically from the vocab array passed by the orchestrator manifest.

import { useState } from "react";
import { speak } from "@/lib/lesson/speech";

interface BasketSortProps {
  vocabList: string[];
  /** Tailwind grid-cols class string from CurriculumQualityOfficer layout map. */
  gridClass: string;
  allowedEmojis: string[];
  onPhaseComplete: () => void;
}

export function BasketSortPhase({
  vocabList,
  gridClass,
  allowedEmojis,
  onPhaseComplete,
}: BasketSortProps) {
  const [storedCount, setStoredCount] = useState(0);
  const [shake, setShake] = useState(false);

  const handleItemTap = (item: string) => {
    if (vocabList.includes(item)) {
      speak(`Put the ${item} into the basket!`, { rate: 0.85 });
      const next = storedCount + 1;
      setStoredCount(next);
      if (next >= vocabList.length) {
        setTimeout(onPhaseComplete, 1000);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div
      className={`space-y-6 text-center py-4 ${
        shake ? "animate-shake bg-red-50/20 rounded-3xl" : ""
      }`}
    >
      <div>
        <h2 className="text-3xl font-black text-gray-800">Dynamic Storage Room 🧺</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tap items to store them safely inside your matching topic container.
        </p>
      </div>

      <div className="w-full max-w-md mx-auto bg-amber-50/50 border-4 border-dashed border-amber-200 rounded-3xl p-10 min-h-[160px] flex items-center justify-center shadow-inner">
        <span className="text-7xl">🧺</span>
        <span className="text-xl font-bold text-amber-800 ml-4">
          Items Stored: {storedCount} / {vocabList.length}
        </span>
      </div>

      <div className={`grid gap-4 max-w-2xl mx-auto ${gridClass}`}>
        {vocabList.map((item, idx) => (
          <button
            key={item}
            type="button"
            onClick={() => handleItemTap(item)}
            className="bg-white border-2 border-gray-100 hover:border-[#FE6A2F] p-4 rounded-2xl font-extrabold text-gray-700 shadow-sm transition transform active:scale-95 flex flex-col items-center justify-center min-h-[80px]"
          >
            <span className="text-3xl">{allowedEmojis[idx] || "🌱"}</span>
            <span className="text-xs text-gray-400 mt-1 block">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BasketSortPhase;
