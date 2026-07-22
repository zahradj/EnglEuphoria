import { useMarketRegion } from '@/contexts/MarketRegionContext';
import { MARKET_META } from '@/lib/marketRegion';
import { AlertTriangle } from 'lucide-react';

/**
 * Shown when a signed-in user lands on a domain that doesn't match their market.
 * They can keep using the app, but actions like discovery and pricing follow
 * their stored market — this banner explains why.
 */
export const WrongMarketBanner = () => {
  const { isMismatched, region } = useMarketRegion();
  if (!isMismatched) return null;
  const meta = MARKET_META[region];
  return (
    <div className="w-full bg-amber-50 border-b border-amber-300 text-amber-900 px-4 py-2 text-sm flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Your account is on the <strong>{meta.label}</strong> marketplace. Some content may look different on this domain.
      </span>
    </div>
  );
};
