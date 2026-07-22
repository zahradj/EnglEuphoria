import React, { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Volume2, X } from 'lucide-react';

interface Entry {
  word: string;
  definition?: string;
  translation?: string;
  image_url?: string | null;
  loading: boolean;
  error?: string;
}

interface Props {
  entry: Entry | null;
  rect: DOMRect | null;
  hub: string;
  onClose: () => void;
}

const accentRing: Record<string, string> = {
  playground: 'ring-orange-300/70',
  academy: 'ring-purple-300/70',
  professional: 'ring-emerald-300/70',
};

export const DictionaryPopover: React.FC<Props> = ({ entry, rect, hub, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entry) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [entry, onClose]);

  if (!entry || !rect) return null;

  // Position above the selection if there's room, else below
  const top = rect.top > 280 ? rect.top - 16 : rect.bottom + 12;
  const placement: 'above' | 'below' = rect.top > 280 ? 'above' : 'below';
  const left = Math.min(Math.max(rect.left + rect.width / 2 - 160, 12), window.innerWidth - 332);

  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(entry.word);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch {}
  };

  return (
    <div
      ref={ref}
      className={`fixed z-[9999] w-80 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl ring-2 ${accentRing[hub] || accentRing.academy} border border-white/60`}
      style={{
        top,
        left,
        transform: placement === 'above' ? 'translateY(-100%)' : 'none',
      }}
      role="dialog"
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate">{entry.word}</h3>
          <button
            type="button"
            onClick={speak}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Pronounce"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-3">
        <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center">
          {entry.loading ? (
            <Skeleton className="w-full h-full" />
          ) : entry.image_url ? (
            <img src={entry.image_url} alt={entry.word} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl select-none" aria-hidden>📖</span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {entry.loading ? (
            <>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </>
          ) : entry.error ? (
            <p className="text-xs text-destructive">{entry.error}</p>
          ) : (
            <>
              <p className="text-sm text-slate-800 leading-snug">{entry.definition}</p>
              {entry.translation && (
                <p className="text-sm font-semibold text-purple-700 leading-snug">{entry.translation}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
