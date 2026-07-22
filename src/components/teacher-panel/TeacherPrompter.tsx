// TeacherPrompter — right sidebar. Surfaces `teacher_notes` and `target_chunk`
// from the active activity JSON in large, readable text + override controls.
import { BookOpen, Target } from 'lucide-react';
import { OverrideControls } from './OverrideControls';

export interface ActiveBlock {
  id?: string;
  type?: string;
  teacher_notes?: string;
  target_chunk?: string;
  title?: string;
}

export interface TeacherPrompterProps {
  block: ActiveBlock | null;
  onTriggerReward: () => void;
  onTriggerFallback: () => void;
  onForceNextBlock: () => void;
  disabled?: boolean;
}

export function TeacherPrompter({
  block,
  onTriggerReward,
  onTriggerFallback,
  onForceNextBlock,
  disabled,
}: TeacherPrompterProps) {
  return (
    <aside className="flex flex-col gap-4 h-full">
      <div className="rounded-2xl bg-white/80 backdrop-blur p-4 ring-1 ring-border shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
          <Target className="h-3.5 w-3.5 text-primary" /> Target chunk
        </div>
        <div className="mt-2 text-2xl font-bold leading-snug text-foreground">
          {block?.target_chunk ?? <span className="text-muted-foreground/60">—</span>}
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 backdrop-blur p-4 ring-1 ring-border shadow-sm flex-1 min-h-0 overflow-auto">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
          <BookOpen className="h-3.5 w-3.5 text-primary" /> Teacher notes
        </div>
        <p className="mt-2 text-lg leading-relaxed text-foreground whitespace-pre-wrap">
          {block?.teacher_notes ?? (
            <span className="text-muted-foreground/60">No notes for this block.</span>
          )}
        </p>
      </div>

      <div className="rounded-2xl bg-white/80 backdrop-blur p-4 ring-1 ring-border shadow-sm">
        <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3">
          Overrides
        </div>
        <OverrideControls
          onTriggerReward={onTriggerReward}
          onTriggerFallback={onTriggerFallback}
          onForceNextBlock={onForceNextBlock}
          disabled={disabled}
        />
      </div>
    </aside>
  );
}

export default TeacherPrompter;
