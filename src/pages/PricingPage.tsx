import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { useStudentCredits } from '@/hooks/useStudentCredits';

interface CreditPack {
  id: string;
  name: string;
  student_level: string;
  session_count: number;
  price_eur: number;
  original_price_eur: number;
  savings_eur: number;
  sort_order: number;
}

const LEVEL_LABEL: Record<string, string> = {
  academy: 'Academy',
  professional: 'Success',
};

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { availableCredits, refresh } = useStudentCredits(user?.id ?? null);

  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('credit_packs')
        .select('id, name, student_level, session_count, price_eur, original_price_eur, savings_eur, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) {
        console.error('Failed to load credit packs:', error);
      } else {
        setPacks((data ?? []) as CreditPack[]);
      }
      setLoading(false);
    })();
  }, []);

  // Post-Stripe-redirect handling
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    const sessionId = searchParams.get('session_id');

    if (checkout === 'success' && sessionId) {
      setVerifying(true);
      supabase.functions
        .invoke('verify-pack-checkout', { body: { sessionId } })
        .then(({ data, error }) => {
          if (error || !data?.success) {
            toast({
              title: 'Could not confirm payment',
              description: "We couldn't verify this checkout — contact support if you were charged.",
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Payment received! 🎉',
              description: `${data.credits_granted} credit${data.credits_granted !== 1 ? 's' : ''} added to your account.`,
            });
            void refresh();
          }
        })
        .finally(() => {
          setVerifying(false);
          setSearchParams({}, { replace: true });
        });
    } else if (checkout === 'cancelled') {
      toast({ title: 'Checkout cancelled', description: 'No charge was made.' });
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuy = async (packId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBuyingId(packId);
    try {
      const { data, error } = await supabase.functions.invoke('create-pack-checkout', {
        body: { packId },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || 'Failed to start checkout');
      }
      window.location.href = data.url;
    } catch (err: any) {
      toast({
        title: 'Checkout failed',
        description: err?.message ?? 'Please try again in a moment.',
        variant: 'destructive',
      });
      setBuyingId(null);
    }
  };

  const grouped = packs.reduce<Record<string, CreditPack[]>>((acc, pack) => {
    (acc[pack.student_level] ??= []).push(pack);
    return acc;
  }, {});

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background to-muted/40 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Get more lesson credits</h1>
          <p className="text-muted-foreground">
            {user ? `You currently have ${availableCredits} credit${availableCredits !== 1 ? 's' : ''}.` : 'Sign in to purchase credits.'}
          </p>
        </div>

        {(verifying || loading) && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && !verifying && packs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No credit packs are available right now — please check back soon.
            </CardContent>
          </Card>
        )}

        {!loading &&
          !verifying &&
          Object.entries(grouped).map(([level, levelPacks]) => (
            <div key={level} className="mb-10">
              <h2 className="text-lg font-semibold mb-4">{LEVEL_LABEL[level] ?? level} hub</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levelPacks.map((pack) => {
                  const hasSavings = pack.savings_eur > 0;
                  const perLesson = pack.price_eur / pack.session_count;
                  return (
                    <Card key={pack.id} className="relative flex flex-col">
                      {hasSavings && (
                        <Badge className="absolute -top-2 right-4 bg-emerald-500 hover:bg-emerald-500">
                          Save €{pack.savings_eur.toFixed(0)}
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          {pack.name}
                        </CardTitle>
                        <CardDescription>{pack.session_count} lesson credits</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">€{pack.price_eur.toFixed(0)}</span>
                            {hasSavings && (
                              <span className="text-sm text-muted-foreground line-through">
                                €{pack.original_price_eur.toFixed(0)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            €{perLesson.toFixed(2)} per lesson
                          </p>
                        </div>
                        <ul className="text-sm space-y-1.5 mb-6 flex-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            {pack.session_count} live 1-on-1 lessons
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            Valid for 6 months
                          </li>
                        </ul>
                        <Button
                          onClick={() => handleBuy(pack.id)}
                          disabled={buyingId === pack.id}
                          className="w-full"
                        >
                          {buyingId === pack.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Buy now'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
