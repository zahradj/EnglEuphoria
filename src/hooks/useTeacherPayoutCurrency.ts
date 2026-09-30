import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { asPayoutCurrency, type PayoutCurrency } from '@/lib/teacherPay';

/**
 * The currency a teacher is paid in (local → DZD, international → EUR).
 * Defaults to the signed-in teacher. EUR while loading.
 */
export function useTeacherPayoutCurrency(teacherId?: string | null): PayoutCurrency {
  const { user } = useAuth();
  const id = teacherId ?? user?.id ?? null;
  const { data } = useQuery({
    queryKey: ['teacher-payout-currency', id],
    enabled: !!id,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      // payout_currency isn't in the generated Supabase types yet.
      const { data } = await (supabase as any)
        .from('teacher_profiles')
        .select('payout_currency')
        .eq('user_id', id)
        .maybeSingle();
      return asPayoutCurrency(data?.payout_currency);
    },
  });
  return data ?? 'EUR';
}

/** Batched lookup for admin tables: teacher user id → payout currency. */
export async function fetchTeacherPayoutCurrencies(teacherIds: string[]): Promise<Map<string, PayoutCurrency>> {
  const map = new Map<string, PayoutCurrency>();
  if (!teacherIds.length) return map;
  const { data } = await (supabase as any)
    .from('teacher_profiles')
    .select('user_id, payout_currency')
    .in('user_id', teacherIds);
  for (const r of (data ?? []) as { user_id: string; payout_currency: string | null }[]) {
    map.set(r.user_id, asPayoutCurrency(r.payout_currency));
  }
  return map;
}
