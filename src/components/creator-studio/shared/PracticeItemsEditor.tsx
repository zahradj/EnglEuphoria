import { useState, type ReactNode } from 'react';
import { Plus, Trash2, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type SlideType = 'error_detection' | 'correction' | 'fill_blank' | 'multiple' | 'truefalse' | 'sentence_builder';

interface Props<T> {
  slideType: SlideType;
  items: T[];
  onChange: (next: T[]) => void;
  newItem: () => T;
  renderRow: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
  /** Full slide object — used to read blueprint context if attached */
  slide?: any;
  hub?: 'playground' | 'academy' | 'success';
  cefrLevel?: string;
  blueprint?: { vocabulary?: string[]; grammar?: string; title?: string };
}

/**
 * Excel-style editor for array-based practice slides
 * (error_detection / correction / fill_blank) with a ✨ "Generate 3 More"
 * button that appends contextually-aligned items via the
 * `generate-practice-items` edge function.
 */
export function PracticeItemsEditor<T extends Record<string, any>>({
  slideType, items, onChange, newItem, renderRow,
  slide, hub = 'academy', cefrLevel = 'A2', blueprint,
}: Props<T>) {
  const [busy, setBusy] = useState(false);

  const update = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, newItem()]);

  const generateMore = async () => {
    setBusy(true);
    try {
      const bp = blueprint
        ?? slide?.blueprint
        ?? slide?._blueprint
        ?? undefined;
      const { data, error } = await supabase.functions.invoke('generate-practice-items', {
        body: {
          slide_type: slideType,
          count: 3,
          existing_items: items,
          blueprint: bp || {},
          hub,
          cefr_level: cefrLevel,
        },
      });
      if (error) throw error;
      const newOnes: T[] = Array.isArray((data as any)?.items) ? (data as any).items : [];
      if (!newOnes.length) throw new Error('AI returned no items');
      onChange([...items, ...newOnes]);
      toast.success(`✨ Added ${newOnes.length} new practice items`);
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate items');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Practice items ({items.length})
        </span>
        <button
          type="button"
          onClick={generateMore}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-orange-50 px-3 py-1.5 text-xs font-bold text-fuchsia-700 hover:from-fuchsia-100 hover:to-orange-100 disabled:opacity-50 transition"
          title="Generate 3 more practice items aligned with this lesson"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Generate 3 More
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-slate-500 italic">No items yet — add one or generate with AI.</p>
      )}

      {items.map((item, i) => {
        const rewriteOne = async () => {
          try {
            const bp = blueprint ?? slide?.blueprint ?? slide?._blueprint ?? undefined;
            const { data, error } = await supabase.functions.invoke('generate-practice-items', {
              body: {
                slide_type: slideType,
                count: 1,
                existing_items: items.filter((_, k) => k !== i),
                blueprint: bp || {},
                hub,
                cefr_level: cefrLevel,
              },
            });
            if (error) throw error;
            const fresh = (data as any)?.items?.[0];
            if (!fresh) throw new Error('AI returned nothing');
            onChange(items.map((it, k) => (k === i ? fresh : it)));
            toast.success('🔄 Item rewritten');
          } catch (e: any) {
            toast.error(e?.message || 'Rewrite failed');
          }
        };
        return (
          <div
            key={i}
            className="group flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            <span className="mt-1 text-[10px] font-bold text-slate-400 w-5">#{i + 1}</span>
            <div className="flex-1 min-w-0">{renderRow(item, i, (p) => update(i, p))}</div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={rewriteOne}
                className="opacity-50 hover:opacity-100 hover:text-fuchsia-600 transition p-1"
                aria-label="Rewrite this item with AI"
                title="🔄 Rewrite this item with AI"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="opacity-50 hover:opacity-100 hover:text-red-600 transition p-1"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition"
      >
        <Plus className="w-3.5 h-3.5" /> Add new item
      </button>
    </div>
  );
}

export default PracticeItemsEditor;
