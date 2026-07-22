import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props<T> {
  items: T[];
  onChange: (next: T[]) => void;
  newItem: () => T;
  renderRow: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel?: string;
  emptyLabel?: string;
}

/**
 * Excel-style add-row + trash list editor. Reusable across creators
 * for any slide field that's an array (options, pairs, examples, activities…).
 */
export function DynamicListEditor<T>({
  items, onChange, newItem, renderRow,
  addLabel = '+ Add new item',
  emptyLabel = 'No items yet.',
}: Props<T>) {
  const update = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, newItem()]);

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">{emptyLabel}</p>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          data-item-index={i}
          className="group flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2"
        >
          <div className="flex-1 min-w-0">{renderRow(item, i, (p) => update(i, p))}</div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="opacity-50 hover:opacity-100 hover:text-destructive transition p-1"
            aria-label="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

export default DynamicListEditor;
