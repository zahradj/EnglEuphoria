import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Gamepad2, BookMarked, Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SupplementalKind = 'game' | 'storybook' | 'extra_practice';

export interface SupplementalRef {
  kind: SupplementalKind;
  refId: string;
  title: string;
}

interface Props {
  hub: 'playground' | 'academy' | 'success';
  hasActiveSupplemental: boolean;
  onLoad: (ref: SupplementalRef) => void;
  onResume: () => void;
}

const CEFR_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

const HUB_TO_TARGET_SYSTEM: Record<Props['hub'], string[]> = {
  playground: ['playground', 'kids'],
  academy: ['academy', 'teens'],
  success: ['success', 'professional', 'adults'],
};

interface LibItem { id: string; title: string; cefr: string; kind: SupplementalKind }

/**
 * Teacher's 'Briefcase' — supplemental library organized by:
 *   CEFR Level → Material Type (Games / Storybooks / Extra Practice) → Item.
 * Selecting an item pauses the core lesson and pushes the supplemental to
 * the shared canvas via the parent's onLoad callback.
 */
export function TeacherBriefcase({ hub, hasActiveSupplemental, onLoad, onResume }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LibItem[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const targets = HUB_TO_TARGET_SYSTEM[hub];
      const [{ data: games }, { data: books }, { data: extras }] = await Promise.all([
        supabase
          .from('iron_games')
          .select('id, title, cefr_level, target_group')
          .eq('status', 'published')
          .in('target_group', targets)
          .limit(200),
        supabase
          .from('storybooks')
          .select('id, title, cefr_level, hub')
          .eq('published', true)
          .eq('hub', hub)
          .limit(200),
        supabase
          .from('curriculum_lessons')
          .select('id, title, slot_cefr_level, target_system, cycle_type')
          .in('target_system', targets)
          .eq('is_published', true)
          .in('cycle_type', ['supplemental', 'extra_practice', 'review'])
          .limit(200),
      ]);
      if (cancelled) return;
      const out: LibItem[] = [];
      (games ?? []).forEach((g: any) =>
        out.push({ id: g.id, title: g.title, cefr: normalizeCefr(g.cefr_level), kind: 'game' }));
      (books ?? []).forEach((b: any) =>
        out.push({ id: b.id, title: b.title, cefr: normalizeCefr(b.cefr_level), kind: 'storybook' }));
      (extras ?? []).forEach((l: any) =>
        out.push({ id: l.id, title: l.title, cefr: normalizeCefr(l.slot_cefr_level), kind: 'extra_practice' }));
      setItems(out);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, hub]);

  const byLevel = useMemo(() => {
    const map = new Map<string, { game: LibItem[]; storybook: LibItem[]; extra_practice: LibItem[] }>();
    CEFR_LEVELS.forEach(l => map.set(l, { game: [], storybook: [], extra_practice: [] }));
    items.forEach(it => {
      const bucket = map.get(it.cefr) ?? map.get('A1')!;
      bucket[it.kind].push(it);
    });
    return map;
  }, [items]);

  const dispatch = (item: LibItem) => {
    onLoad({ kind: item.kind, refId: item.id, title: item.title });
    toast.success(`Loaded "${item.title}" onto the canvas`);
  };

  return (
    <div className="border-r border-border bg-card flex flex-col">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-muted/50"
      >
        <Briefcase className="h-3.5 w-3.5" />
        Briefcase {open ? '−' : '+'}
      </button>

      {open && (
        <div className="w-72 flex-1 overflow-y-auto p-3 space-y-2">
          {hasActiveSupplemental && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onResume}
              className="w-full justify-start gap-2"
            >
              <X className="h-4 w-4" /> Return to Core Lesson
            </Button>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading library…
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {CEFR_LEVELS.map(level => {
                const bucket = byLevel.get(level)!;
                const total = bucket.game.length + bucket.storybook.length + bucket.extra_practice.length;
                if (!total) return null;
                return (
                  <AccordionItem value={level} key={level}>
                    <AccordionTrigger className="text-xs py-2">
                      {level} <span className="text-muted-foreground ml-2">({total})</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Accordion type="multiple" className="w-full pl-2">
                        <KindSection title="Games" icon={Gamepad2} items={bucket.game} onPick={dispatch} valueKey={`${level}-g`} />
                        <KindSection title="Storybooks" icon={BookMarked} items={bucket.storybook} onPick={dispatch} valueKey={`${level}-b`} />
                        <KindSection title="Extra Practice" icon={Sparkles} items={bucket.extra_practice} onPick={dispatch} valueKey={`${level}-e`} />
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">No supplemental items found for this hub yet.</p>
              )}
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}

function KindSection({
  title, icon: Icon, items, onPick, valueKey,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: LibItem[];
  onPick: (i: LibItem) => void;
  valueKey: string;
}) {
  if (!items.length) return null;
  return (
    <AccordionItem value={valueKey}>
      <AccordionTrigger className="text-xs py-1.5">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" /> {title} <span className="text-muted-foreground">({items.length})</span>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-1">
          {items.map(it => (
            <li key={it.id}>
              <button
                onClick={() => onPick(it)}
                className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted truncate"
              >
                {it.title}
              </button>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

function normalizeCefr(v?: string | null): string {
  if (!v) return 'A1';
  const cleaned = v.trim().toUpperCase().replace('PRE_A1', 'Pre-A1').replace('PRE-A1', 'Pre-A1');
  if (cleaned.startsWith('PRE')) return 'Pre-A1';
  const match = CEFR_LEVELS.find(l => l.toUpperCase() === cleaned);
  return match ?? 'A1';
}
