import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BonusPolicy {
  tier_elite_threshold: number;
  tier_elite_pct: number;
  tier_excellent_threshold: number;
  tier_excellent_pct: number;
  tier_strong_threshold: number;
  tier_strong_pct: number;
  tier_ontrack_threshold: number;
  tier_ontrack_pct: number;
  kicker_threshold: number;
  kicker_pct_each: number;
  kicker_max_pct: number;
}

export const DEFAULT_BONUS_POLICY: BonusPolicy = {
  tier_elite_threshold: 95, tier_elite_pct: 15,
  tier_excellent_threshold: 85, tier_excellent_pct: 10,
  tier_strong_threshold: 70, tier_strong_pct: 6,
  tier_ontrack_threshold: 55, tier_ontrack_pct: 3,
  kicker_threshold: 90, kicker_pct_each: 1, kicker_max_pct: 5,
};

export function useBonusPolicy() {
  const [policy, setPolicy] = useState<BonusPolicy>(DEFAULT_BONUS_POLICY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("bonus_policy").select("*").limit(1).maybeSingle();
    if (data) setPolicy(data as BonusPolicy);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (patch: Partial<BonusPolicy>) => {
    const { data, error } = await supabase
      .from("bonus_policy")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", true)
      .select("*")
      .single();
    if (!error && data) setPolicy(data as BonusPolicy);
    return { error };
  };

  return { policy, loading, save, reload: load };
}
