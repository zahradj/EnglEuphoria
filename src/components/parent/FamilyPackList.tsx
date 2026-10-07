import { useEffect, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { contactToBuyHref } from '@/config/payments';

export interface FamilyLearner {
  studentId: string;
  name: string;
  hub: 'playground' | 'academy' | 'professional';
}

interface Pack {
  id: string;
  name: string;
  session_count: number;
  price_eur: number;
  savings_eur: number;
  family_only: boolean;
}

/**
 * The lesson packs a parent can buy for one child: the ordinary packs, then the family packs (bigger
 * packs to share between children with "Move lessons"). Paying opens Stripe; the lessons go to the child.
 */
export function FamilyPackList({ learner }: { learner: FamilyLearner }) {
  const { toast } = useToast();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('credit_packs')
      .select('id, name, session_count, price_eur, savings_eur, family_only, sort_order')
      .eq('student_level', learner.hub)
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast({ title: 'Could not load lesson packages', description: error.message, variant: 'destructive' });
        setPacks((data ?? []).map((p: any) => ({ ...p, price_eur: Number(p.price_eur), savings_eur: Number(p.savings_eur) })));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [learner.hub, toast]);

  const buy = async (pack: Pack) => {
    setBuyingId(pack.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-pack-checkout', {
        body: { packId: pack.id, studentId: learner.studentId },
      });
      if (error || !data?.url) throw new Error('Could not start checkout');
      window.location.href = data.url;
    } catch {
      toast({
        title: 'Checkout failed',
        description: 'Please try again in a moment, or contact us to buy.',
        variant: 'destructive',
      });
      setBuyingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (packs.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No lesson packages are available right now.</p>;
  }

  const row = (p: Pack) => (
    <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-semibold">
          {p.name}
          {p.family_only && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
              <Users className="h-3 w-3" aria-hidden /> Family
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {p.session_count} lessons · 25 minutes each · €{(p.price_eur / p.session_count).toFixed(2)} a lesson
        </p>
      </div>
      <Button onClick={() => buy(p)} disabled={!!buyingId} className="shrink-0">
        {buyingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `€${p.price_eur}`}
      </Button>
    </li>
  );

  const regular = packs.filter((p) => !p.family_only);
  const family = packs.filter((p) => p.family_only);

  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">{regular.map(row)}</ul>
      {family.length > 0 && (
        <div className="grid gap-2">
          <div>
            <p className="text-sm font-bold">Family packs</p>
            <p className="text-xs text-muted-foreground">
              Bigger packs for several children. Buy once, then share the lessons with “Move lessons”.
            </p>
          </div>
          <ul className="grid gap-2">{family.map(row)}</ul>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Prefer to pay another way?{' '}
        <a className="underline" href={contactToBuyHref({})}>Contact us to buy</a>
      </p>
    </div>
  );
}
