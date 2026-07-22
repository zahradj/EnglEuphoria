import { History, RotateCcw, X, Send, Save, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { LessonRevision } from '@/hooks/useAutoSaveAndHistory';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  revisions: LessonRevision[];
  loading: boolean;
  onRestore: (rev: LessonRevision) => void;
}

function fmt(d: string) {
  const date = new Date(d);
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const KIND_META = {
  manual: { label: 'Draft', icon: Save, tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  publish: { label: 'Published', icon: Send, tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  auto: { label: 'Auto-save', icon: Sparkles, tone: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
} as const;

export function RevisionHistoryModal({ open, onClose, revisions, loading, onRestore }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" /> Revision History
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          The last 5 saved snapshots of this lesson. Restoring will overwrite your current edits.
        </p>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : revisions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No snapshots yet — Save Draft or Publish to create one.
          </div>
        ) : (
          <ul className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto">
            {revisions.map((r) => {
              const meta = KIND_META[r.kind] ?? KIND_META.manual;
              const Icon = meta.icon;
              const slideCount = Array.isArray(r.content?.slides) ? r.content.slides.length : 0;
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', meta.tone)}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{slideCount} slides</span>
                    </div>
                    <div className="text-sm font-medium truncate mt-1">{r.title || 'Untitled'}</div>
                    <div className="text-[11px] text-muted-foreground">{fmt(r.created_at)}</div>
                  </div>
                  <button
                    onClick={() => onRestore(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold hover:opacity-90 transition shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button onClick={onClose} className="absolute right-3 top-3 rounded-md p-1 hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
