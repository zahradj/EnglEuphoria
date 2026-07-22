import { Eye, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PreviewMode = 'editor' | 'play';

interface Props {
  value: PreviewMode;
  onChange: (mode: PreviewMode) => void;
  hub: 'playground' | 'academy' | 'success';
}

/**
 * Segmented control for switching the right-column preview between
 * a static "Editor View" (single slide snapshot) and an interactive
 * "Play Mode" (deck navigation, answer checking, audio).
 */
export function PreviewModeToggle({ value, onChange, hub }: Props) {
  const activeClass =
    hub === 'playground'
      ? 'bg-orange-500 text-white shadow-sm'
      : 'bg-indigo-600 text-white shadow-sm';
  const inactiveClass = 'text-slate-500 hover:text-slate-700';

  return (
    <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5 text-[11px] font-semibold">
      <button
        type="button"
        onClick={() => onChange('editor')}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition',
          value === 'editor' ? activeClass : inactiveClass,
        )}
      >
        <Eye className="w-3 h-3" /> Editor
      </button>
      <button
        type="button"
        onClick={() => onChange('play')}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition',
          value === 'play' ? activeClass : inactiveClass,
        )}
      >
        <Play className="w-3 h-3" /> Play
      </button>
    </div>
  );
}
