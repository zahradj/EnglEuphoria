/**
 * Global localized pricing — USD is the internal base.
 *
 * Every price in the codebase is authored in USD. Display conversion happens
 * at render time via `convert()` + `formatMoney()` using the FX rates below.
 *
 * Rates are approximate and meant for *display only*. Real charges go through
 * the payment provider in the customer's currency at the live FX rate.
 *
 * To add a new currency: append to CURRENCIES + USD_FX. To add purchasing
 * power parity later, layer a `pppMultiplier` into the `convert()` result.
 */

export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'TRY' | 'DZD' | 'SAR' | 'AED' | 'MAD' | 'EGP';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  /** BCP-47 locale used by Intl.NumberFormat. */
  locale: string;
  /** Display fraction digits (0 for currencies where decimals look noisy). */
  fractionDigits: 0 | 2;
  flag: string;
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$',   locale: 'en-US', fractionDigits: 2, flag: '🇺🇸', label: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€',   locale: 'en-IE', fractionDigits: 2, flag: '🇪🇺', label: 'Euro' },
  GBP: { code: 'GBP', symbol: '£',   locale: 'en-GB', fractionDigits: 2, flag: '🇬🇧', label: 'Pound Sterling' },
  TRY: { code: 'TRY', symbol: '₺',   locale: 'tr-TR', fractionDigits: 0, flag: '🇹🇷', label: 'Turkish Lira' },
  DZD: { code: 'DZD', symbol: 'DA',  locale: 'fr-DZ', fractionDigits: 0, flag: '🇩🇿', label: 'Algerian Dinar' },
  SAR: { code: 'SAR', symbol: 'ر.س', locale: 'ar-SA', fractionDigits: 0, flag: '🇸🇦', label: 'Saudi Riyal' },
  AED: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', fractionDigits: 0, flag: '🇦🇪', label: 'UAE Dirham' },
  MAD: { code: 'MAD', symbol: 'DH',  locale: 'fr-MA', fractionDigits: 0, flag: '🇲🇦', label: 'Moroccan Dirham' },
  EGP: { code: 'EGP', symbol: 'E£',  locale: 'ar-EG', fractionDigits: 0, flag: '🇪🇬', label: 'Egyptian Pound' },
};

/**
 * 1 EUR = X target currency. Authored prices in the codebase are in EUR
 * (the `usd` prop name on <Price /> is a legacy alias kept for compatibility).
 * Refresh quarterly or via an FX edge function.
 */
export const USD_FX: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.087,
  GBP: 0.86,
  TRY: 42.9,
  DZD: 145.65,
  SAR: 4.08,
  AED: 3.99,
  MAD: 10.76,
  EGP: 52.2,
};

/** ISO country → preferred display currency. Used by GeoIP fallback. */
export const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  US: 'USD', GB: 'GBP', IE: 'EUR',
  FR: 'EUR', ES: 'EUR', DE: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR',
  TR: 'TRY',
  DZ: 'DZD', MA: 'MAD', TN: 'EUR', EG: 'EGP',
  SA: 'SAR', AE: 'AED', QA: 'SAR', KW: 'SAR', BH: 'SAR', OM: 'SAR',
};

/** Convert a USD amount to a target currency for display. */
export function convert(amountUsd: number, to: CurrencyCode): number {
  const rate = USD_FX[to] ?? 1;
  const raw = amountUsd * rate;
  // Smart rounding: zero-decimal currencies snap to nearest 5/10/50/100
  // depending on magnitude so prices look intentional, not robotic.
  if (CURRENCIES[to].fractionDigits === 0) {
    if (raw >= 5000) return Math.round(raw / 100) * 100;
    if (raw >= 500)  return Math.round(raw / 50) * 50;
    if (raw >= 50)   return Math.round(raw / 5) * 5;
    return Math.round(raw);
  }
  return Math.round(raw * 100) / 100;
}

/** Format an amount already in its target currency. */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  const meta = CURRENCIES[currency];
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: meta.code,
      maximumFractionDigits: meta.fractionDigits,
      minimumFractionDigits: meta.fractionDigits,
    }).format(amount);
  } catch {
    const num = new Intl.NumberFormat(meta.locale).format(amount);
    return `${num} ${meta.symbol}`;
  }
}

/** One-shot helper: USD → localized display string. */
export function priceFromUsd(amountUsd: number, currency: CurrencyCode): string {
  return formatMoney(convert(amountUsd, currency), currency);
}

const PREF_KEY = 'eu_currency';

export function persistCurrency(c: CurrencyCode) {
  try { window.localStorage.setItem(PREF_KEY, c); } catch { /* ignore */ }
}
export function readPersistedCurrency(): CurrencyCode | null {
  try {
    const v = window.localStorage.getItem(PREF_KEY) as CurrencyCode | null;
    return v && CURRENCIES[v] ? v : null;
  } catch { return null; }
}

/** Browser locale → currency guess (e.g. fr-FR → EUR, en-GB → GBP). */
export function currencyFromBrowserLocale(): CurrencyCode | null {
  if (typeof navigator === 'undefined') return null;
  const lang = navigator.language || '';
  const country = lang.split('-')[1]?.toUpperCase();
  if (country && COUNTRY_CURRENCY[country]) return COUNTRY_CURRENCY[country];
  const root = lang.split('-')[0].toLowerCase();
  if (root === 'tr') return 'TRY';
  if (root === 'ar') return 'SAR';
  if (root === 'fr') return 'EUR';
  if (root === 'es') return 'EUR';
  if (root === 'en') return 'USD';
  return null;
}

/** GeoIP fallback. Lazy, best-effort, never blocks rendering. */
export async function detectCurrencyFromGeoIp(): Promise<CurrencyCode | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    const code = (data?.country_code || '').toUpperCase();
    return COUNTRY_CURRENCY[code] ?? null;
  } catch {
    return null;
  }
}
