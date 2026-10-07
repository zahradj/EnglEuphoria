import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
}

interface Props {
  learner: FamilyLearner | null;
  onOpenChange: (open: boolean) => void;
}

/** A parent picks a pack for one child; checkout is paid by the parent and the credits go to the child. */
export function BuyForChildDialog({ learner, onOpenChange }: Props) {
  const { toast } = useToast();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    if (!learner) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from('credit_packs')
      .select('id, name, session_count, price_eur, savings_eur, sort_order')
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
  }, [learner, toast]);

  const buy = async (pack: Pack) => {
    if (!learner) return;
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

  return (
    <Dialog open={!!learner} onOpenChange={(next) => { if (!buyingId) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy lessons for {learner?.name}</DialogTitle>
          <DialogDescription>
            You pay once and the lessons go straight to {learner?.name}. Each lesson is 25 minutes.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : packs.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No lesson packages are available right now.</p>
        ) : (
          <ul className="grid gap-2">
            {packs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="min-w-0">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.session_count} lessons · 25 minutes each
                    {p.savings_eur > 0 ? ` · save €${p.savings_eur}` : ''}
                  </p>
                </div>
                <Button onClick={() => buy(p)} disabled={!!buyingId} className="shrink-0">
                  {buyingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `€${p.price_eur}`}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Prefer to pay another way?{' '}
          <a className="underline" href={contactToBuyHref({ studentEmail: undefined })}>Contact us to buy</a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
