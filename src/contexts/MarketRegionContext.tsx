import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { detectMarketRegion, MARKET_META, MarketRegion } from '@/lib/marketRegion';
import { supabase } from '@/lib/supabase';

interface MarketRegionContextValue {
  /** Region from the URL hostname — what new signups will be tagged as. */
  domainRegion: MarketRegion;
  /** Region tied to the signed-in user (DB), falls back to domainRegion when logged out. */
  region: MarketRegion;
  currency: string;
  symbol: string;
  locale: string;
  /** True when a signed-in user is on a domain that doesn't match their stored region. */
  isMismatched: boolean;
  refresh: () => void;
}

const MarketRegionContext = createContext<MarketRegionContextValue | undefined>(undefined);

export const MarketRegionProvider = ({ children }: { children: React.ReactNode }) => {
  const domainRegion = useMemo<MarketRegion>(() => detectMarketRegion(), []);
  const [userRegion, setUserRegion] = useState<MarketRegion | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUserRegion(null); return; }
    const { data } = await supabase
      .from('users')
      .select('market_region')
      .eq('id', user.id)
      .maybeSingle();
    setUserRegion(((data as any)?.market_region as MarketRegion) ?? null);
  };

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      console.log('[AUTH FLOW] MARKET REGION: auth event received', event);
      setTimeout(() => {
        load().catch((error) => console.warn('[AUTH FLOW] MARKET REGION: refresh failed', error));
      }, 0);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const region: MarketRegion = userRegion ?? domainRegion;
  const meta = MARKET_META[region];

  const value: MarketRegionContextValue = {
    domainRegion,
    region,
    currency: meta.currency,
    symbol: meta.symbol,
    locale: meta.locale,
    isMismatched: !!userRegion && userRegion !== domainRegion,
    refresh: load,
  };

  return <MarketRegionContext.Provider value={value}>{children}</MarketRegionContext.Provider>;
};

export const useMarketRegion = () => {
  const ctx = useContext(MarketRegionContext);
  if (!ctx) throw new Error('useMarketRegion must be used inside MarketRegionProvider');
  return ctx;
};
