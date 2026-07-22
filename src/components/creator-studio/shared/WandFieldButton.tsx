import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { LessonBlueprint } from './LessonBlueprintPanel';
import type { Hub } from './hubTheme';

interface Props {
  field: string;
  currentValue: string;
  slideType?: string;
  hub: Hub;
  cefrLevel?: string;
  blueprint?: LessonBlueprint | null;
  instruction?: string;
  onResult: (value: string) => void;
  /** Optional override label for accessibility / tooltip */
  title?: string;
  className?: string;
}

/**
 * Inline magic-wand icon: rewrites a single text field via the
 * `rewrite-slide-field` edge function so it stays aligned with the
 * lesson blueprint (vocabulary + grammar).
 */
export function WandFieldButton({
  field, currentValue, slideType, hub, cefrLevel = 'A2', blueprint,
  instruction, onResult, title, className,
}: Props) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-slide-field', {
        body: {
          field,
          current_value: currentValue,
          slide_type: slideType,
          hub,
          cefr_level: cefrLevel,
          blueprint: blueprint || undefined,
          instruction,
        },
      });
      if (error) throw error;
      const value = (data as any)?.value;
      if (typeof value !== 'string' || !value.trim()) throw new Error('Empty AI response');
      onResult(value);
      toast.success(`✨ Rewrote ${field}`);
    } catch (e: any) {
      toast.error(e?.message || `Could not rewrite ${field}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      title={title || `🪄 Rewrite ${field} with AI`}
      className={
        'inline-flex items-center justify-center w-7 h-7 rounded-md border border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-orange-50 text-fuchsia-600 hover:from-fuchsia-100 hover:to-orange-100 active:scale-95 transition disabled:opacity-50 ' +
        (className || '')
      }
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
    </button>
  );
}

export default WandFieldButton;
