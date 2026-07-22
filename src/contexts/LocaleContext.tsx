/**
 * LocaleContext — the runtime adapter for the regional architecture.
 *
 * Wraps the app, listens to URL changes, resolves the active region via
 * `resolveRegion()`, syncs i18n + <html lang/dir>, exposes a helper to switch
 * region (which persists to localStorage and navigates with the new prefix).
 *
 * Sits ABOVE MarketRegionProvider so existing `useMarketRegion()` callers keep
 * working unchanged — this provider is the new, richer surface.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n from '@/lib/i18n';
import {
  MarketRegion,
  REGION_CONFIG,
  RegionConfig,
  resolveRegion,
  persistRegionChoice,
  withLocalePath,
  stripLocalePrefix,
  detectRegionFromGeoIp,
} from '@/lib/marketRegion';

interface LocaleContextValue {
  region: MarketRegion;
  config: RegionConfig;
  /** Prepend the region prefix to an internal path. */
  localePath: (to: string) => string;
  /** Switch to another region — updates URL, localStorage, i18n, <html>. */
  switchRegion: (next: MarketRegion) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const region = useMemo<MarketRegion>(
    () => resolveRegion({ pathname: location.pathname }),
    [location.pathname],
  );
  const config = REGION_CONFIG[region];

  // Sync i18n + <html> on every region change.
  useEffect(() => {
    if (i18n.language?.split('-')[0] !== config.language) {
      i18n.changeLanguage(config.language).catch(() => {});
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dir = config.dir;
      document.documentElement.lang = config.language;
      document.documentElement.dataset.region = region;
    }
  }, [region, config.language, config.dir]);

  // Geo-IP auto-localization on first visit (runs once per device).
  // Only fires if user has no sticky region choice AND URL has no explicit
  // locale prefix — otherwise the user's explicit signal wins.
  const geoTried = useRef(false);
  useEffect(() => {
    if (geoTried.current) return;
    geoTried.current = true;
    if (typeof window === 'undefined') return;
    const sticky = window.localStorage.getItem('eu_region');
    const seg = location.pathname.split('/')[1]?.toLowerCase();
    const hasPrefix = ['tr', 'es', 'fr', 'ar', 'dz'].includes(seg || '');
    if (sticky || hasPrefix) return;
    detectRegionFromGeoIp().then((geo) => {
      if (!geo || geo === region) return;
      // Persist + flip language immediately so the UI reflects geo even
      // before the URL prefix redirect lands.
      persistRegionChoice(geo);
      const nextLang = REGION_CONFIG[geo].language;
      if (i18n.language?.split('-')[0] !== nextLang) {
        i18n.changeLanguage(nextLang).catch(() => {});
      }
      if (typeof document !== 'undefined') {
        document.documentElement.dir = REGION_CONFIG[geo].dir;
        document.documentElement.lang = nextLang;
      }
      const cleanPath = stripLocalePrefix(location.pathname);
      navigate(withLocalePath(geo, cleanPath) + location.search, { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localePath = useCallback(
    (to: string) => withLocalePath(region, to),
    [region],
  );

  const switchRegion = useCallback(
    (next: MarketRegion) => {
      persistRegionChoice(next);
      const cleanPath = stripLocalePrefix(location.pathname);
      const target = withLocalePath(next, cleanPath) + location.search;
      navigate(target, { replace: false });
    },
    [navigate, location.pathname, location.search],
  );

  const value: LocaleContextValue = { region, config, localePath, switchRegion };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
};

/** Convenience: get the region prefix-aware Link `to`. */
export const useLocalePath = () => useLocale().localePath;
