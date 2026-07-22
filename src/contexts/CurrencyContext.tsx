/**
 * CurrencyContext — global localized pricing.
 *
 * Resolution priority on mount:
 *   1. Saved user preference (localStorage)
 *   2. Region's default currency (LocaleContext)
 *   3. Browser locale
 *   4. GeoIP fallback (async, applied if nothing above matched)
 *
 * Users can override anytime via `setCurrency()`; choice persists.
 * Region changes propose (but do not force) the region's default currency.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useLocale } from './LocaleContext';
import {
  CURRENCIES, CurrencyCode, convert, formatMoney, priceFromUsd,
  persistCurrency, readPersistedCurrency,
  currencyFromBrowserLocale, detectCurrencyFromGeoIp,
} from '@/lib/currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  /** Render a USD-base amount in the active currency. */
  format: (amountUsd: number) => string;
  /** Display USD + approximate localized: "3,500 DZD (~$25)" */
  formatWithUsdHint: (amountUsd: number) => string;
  /** Raw converted number (no symbol). */
  convert: (amountUsd: number) => number;
  /** Whether user explicitly chose this currency. */
  isUserChoice: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const REGION_DEFAULT: Record<string, CurrencyCode> = {
  INTL: 'EUR', TR: 'TRY', ES: 'EUR', FR: 'EUR', AR: 'EUR', DZ: 'DZD',
};

// Only override the EUR default for currencies we explicitly want to honor
// via browser locale / GeoIP. Random English/other locales stay on EUR.
const AUTO_DETECT_ALLOWED: ReadonlySet<CurrencyCode> = new Set<CurrencyCode>([
  'DZD', 'TRY', 'GBP', 'USD',
]);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const { region } = useLocale();
  const userChoiceRef = useRef<boolean>(false);

  const initial = useMemo<CurrencyCode>(() => {
    const saved = readPersistedCurrency();
    if (saved) { userChoiceRef.current = true; return saved; }
    return REGION_DEFAULT[region] ?? 'EUR';
  }, [region]);

  const [currency, setCurrencyState] = useState<CurrencyCode>(initial);

  // Browser locale + GeoIP fallback (only if no user choice yet).
  useEffect(() => {
    if (userChoiceRef.current) return;
    const fromBrowser = currencyFromBrowserLocale();
    if (fromBrowser && AUTO_DETECT_ALLOWED.has(fromBrowser) && fromBrowser !== currency) {
      setCurrencyState(fromBrowser);
      return;
    }
    let cancelled = false;
    detectCurrencyFromGeoIp().then((geo) => {
      if (!cancelled && geo && AUTO_DETECT_ALLOWED.has(geo) && !userChoiceRef.current && geo !== currency) {
        setCurrencyState(geo);
      }
    });
    return () => { cancelled = true; };
    // intentionally one-shot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Soft-sync currency when region changes (only if user hasn't chosen).
  useEffect(() => {
    if (userChoiceRef.current) return;
    const proposed = REGION_DEFAULT[region];
    if (proposed && proposed !== currency) setCurrencyState(proposed);
  }, [region, currency]);

  const setCurrency = useCallback((c: CurrencyCode) => {
    if (!CURRENCIES[c]) return;
    userChoiceRef.current = true;
    persistCurrency(c);
    setCurrencyState(c);
  }, []);

  const value: CurrencyContextValue = useMemo(() => ({
    currency,
    setCurrency,
    convert: (usd) => convert(usd, currency),
    format: (usd) => priceFromUsd(usd, currency),
    formatWithUsdHint: (usd) => {
      const local = priceFromUsd(usd, currency);
      if (currency === 'EUR') return local;
      const eurStr = priceFromUsd(usd, 'EUR');
      return `${local} (~${eurStr})`;
    },
    isUserChoice: userChoiceRef.current,
  }), [currency, setCurrency]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
};

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx;
}
