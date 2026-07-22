/**
 * Captures `/tr/*`, `/es/*`, `/fr/*`, `/ar/*`, `/dz/*` entries — persists the
 * region choice, then rewrites the URL to the un-prefixed path. The rest of
 * the app keeps a flat route table while still honouring region-prefixed
 * deep links (SEO, marketing, sharing).
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MarketRegion, persistRegionChoice, stripLocalePrefix } from '@/lib/marketRegion';

export const LocalePrefixSync = ({ region }: { region: MarketRegion }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    persistRegionChoice(region);
    const clean = stripLocalePrefix(location.pathname);
    navigate(clean + location.search + location.hash, { replace: true });
  }, [region, navigate, location.pathname, location.search, location.hash]);

  return null;
};
