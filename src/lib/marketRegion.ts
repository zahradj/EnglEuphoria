/**
 * Regional architecture for the adaptive globalization layer.
 *
 * A single codebase serves every market. The active region is resolved in this
 * priority order:
 *   1. URL path prefix      /tr  /es  /fr  /ar          (highest — explicit nav)
 *   2. localStorage         eu_region                    (sticky user choice)
 *   3. Hostname             *.dz, tr.*, es.*, fr.*, ar.*
 *   4. navigator.language   tr → TR, es → ES, ar → AR, fr → FR
 *   5. Default              INTL
 *
 * `DZ` is preserved for backwards compatibility with the existing Algeria
 * deployment. New regions added: TR (Turkey), ES (Spain + LatAm),
 * AR (Gulf, RTL), FR (France + Maghreb francophone).
 */

export type MarketRegion = 'INTL' | 'DZ' | 'TR' | 'ES' | 'AR' | 'FR';

export type LearningMode = 'international' | 'local';

export type PaymentMethod =
  | 'card'        // Visa / Mastercard
  | 'paypal'
  | 'applepay'
  | 'googlepay'
  | 'iyzico'      // TR
  | 'papara'      // TR
  | 'sepa'        // EU
  | 'pix'         // BR / LatAm
  | 'mada'        // KSA
  | 'stcpay'      // KSA / UAE
  | 'bank_dz';    // DZ wire

export interface RegionConfig {
  /** Two-letter region code used throughout the app. */
  code: MarketRegion;
  /** Localized region label. */
  label: string;
  /** Display flag emoji (UI hint only). */
  flag: string;
  /** Default UI language code (matches i18n resources). */
  language: 'en' | 'tr' | 'es' | 'ar' | 'fr';
  /** Acceptable UI languages — switcher will show these. */
  languages: Array<'en' | 'tr' | 'es' | 'ar' | 'fr'>;
  /** Text direction. */
  dir: 'ltr' | 'rtl';
  /** Currency ISO code. */
  currency: string;
  /** Currency display symbol. */
  symbol: string;
  /** BCP-47 locale used for Intl.NumberFormat / DateTimeFormat. */
  locale: string;
  /** Allowed payment methods in checkout. */
  paymentMethods: PaymentMethod[];
  /** Local curriculum frameworks to overlay on Cambridge/CEFR. */
  frameworks: string[];
  /** URL path prefix when the region is forced (empty for INTL default). */
  pathPrefix: '' | '/tr' | '/es' | '/fr' | '/ar' | '/dz';
  /** Hreflang attribute for SEO. */
  hreflang: string;
  /** Default learning mode for new signups in this region. */
  defaultMode: LearningMode;
  /** Short cultural greeting shown on adaptive landing hero. */
  greeting: string;
}

export const REGION_CONFIG: Record<MarketRegion, RegionConfig> = {
  INTL: {
    code: 'INTL', label: 'International', flag: '🌍',
    language: 'en', languages: ['en', 'es', 'fr', 'ar', 'tr'], dir: 'ltr',
    currency: 'EUR', symbol: '€', locale: 'en-IE',
    paymentMethods: ['card', 'paypal', 'applepay', 'googlepay'],
    frameworks: ['cefr', 'cambridge'],
    pathPrefix: '', hreflang: 'en',
    defaultMode: 'international',
    greeting: 'Learn English with the world.',
  },
  TR: {
    code: 'TR', label: 'Türkiye', flag: '🇹🇷',
    language: 'tr', languages: ['tr', 'en'], dir: 'ltr',
    currency: 'TRY', symbol: '₺', locale: 'tr-TR',
    paymentMethods: ['iyzico', 'papara', 'card'],
    frameworks: ['meb', 'cefr', 'cambridge', 'yds'],
    pathPrefix: '/tr', hreflang: 'tr-TR',
    defaultMode: 'local',
    greeting: 'MEB uyumlu, dünya standartlarında İngilizce.',
  },
  ES: {
    code: 'ES', label: 'España & LatAm', flag: '🇪🇸',
    language: 'es', languages: ['es', 'en'], dir: 'ltr',
    currency: 'EUR', symbol: '€', locale: 'es-ES',
    paymentMethods: ['card', 'sepa', 'paypal', 'pix'],
    frameworks: ['mcer', 'cambridge', 'cefr'],
    pathPrefix: '/es', hreflang: 'es',
    defaultMode: 'local',
    greeting: 'Inglés con maestros reales, a tu ritmo.',
  },
  AR: {
    code: 'AR', label: 'Saudi Arabia & Gulf', flag: '🇸🇦',
    language: 'ar', languages: ['ar', 'en'], dir: 'rtl',
    currency: 'EUR', symbol: '€', locale: 'ar-SA',
    paymentMethods: ['mada', 'stcpay', 'applepay', 'card'],
    frameworks: ['igcse', 'cambridge', 'cefr'],
    pathPrefix: '/ar', hreflang: 'ar',
    defaultMode: 'local',
    greeting: 'إنجليزية عالمية بمنهج محلي.',
  },
  FR: {
    code: 'FR', label: 'France', flag: '🇫🇷',
    language: 'fr', languages: ['fr', 'en'], dir: 'ltr',
    currency: 'EUR', symbol: '€', locale: 'fr-FR',
    paymentMethods: ['card', 'sepa', 'paypal', 'applepay'],
    frameworks: ['cecrl', 'delf', 'cambridge', 'cefr'],
    pathPrefix: '/fr', hreflang: 'fr',
    defaultMode: 'local',
    greeting: 'L\'anglais sérieux, à la française.',
  },
  DZ: {
    code: 'DZ', label: 'الجزائر', flag: '🇩🇿',
    language: 'ar', languages: ['ar', 'fr', 'en'], dir: 'rtl',
    currency: 'DZD', symbol: 'DA', locale: 'ar-DZ',
    paymentMethods: ['bank_dz', 'card'],
    frameworks: ['onefd', 'cefr', 'cambridge'],
    pathPrefix: '/dz', hreflang: 'ar-DZ',
    defaultMode: 'local',
    greeting: 'الإنجليزية في متناول الجميع في الجزائر.',
  },
};

/**
 * ISO country code → MarketRegion. Drives geo-IP based auto-localization.
 * Countries not listed fall back to INTL (English + USD).
 */
export const COUNTRY_REGION: Record<string, MarketRegion> = {
  // France & francophone Europe
  FR: 'FR', BE: 'FR', LU: 'FR', MC: 'FR',
  // Spain & Spanish-speaking LatAm
  ES: 'ES', MX: 'ES', AR: 'ES', CO: 'ES', CL: 'ES', PE: 'ES', VE: 'ES',
  UY: 'ES', PY: 'ES', BO: 'ES', EC: 'ES', GT: 'ES', CR: 'ES', PA: 'ES',
  DO: 'ES', HN: 'ES', SV: 'ES', NI: 'ES', CU: 'ES', PR: 'ES',
  // Turkey
  TR: 'TR',
  // Algeria — Arabic + DZD
  DZ: 'DZ',
  // Arabic-speaking countries → AR (Arabic UI + USD per product spec)
  SA: 'AR', AE: 'AR', QA: 'AR', KW: 'AR', BH: 'AR', OM: 'AR',
  YE: 'AR', JO: 'AR', LB: 'AR', SY: 'AR', IQ: 'AR', PS: 'AR',
  EG: 'AR', LY: 'AR', SD: 'AR', MA: 'AR', TN: 'AR', MR: 'AR',
};

/* ---------- back-compat shim for existing callers ---------- */
export const MARKET_META: Record<
  MarketRegion,
  { label: string; currency: string; symbol: string; locale: string }
> = Object.fromEntries(
  (Object.entries(REGION_CONFIG) as Array<[MarketRegion, RegionConfig]>).map(
    ([k, v]) => [k, { label: v.label, currency: v.currency, symbol: v.symbol, locale: v.locale }],
  ),
) as Record<MarketRegion, { label: string; currency: string; symbol: string; locale: string }>;

const STORAGE_KEY = 'eu_region';
const PREFIX_MAP: Record<string, MarketRegion> = {
  tr: 'TR', es: 'ES', fr: 'FR', ar: 'AR', dz: 'DZ',
};

function regionFromPath(pathname: string): MarketRegion | null {
  const seg = pathname.split('/')[1]?.toLowerCase();
  return seg && PREFIX_MAP[seg] ? PREFIX_MAP[seg] : null;
}

function regionFromHost(host: string): MarketRegion | null {
  const h = host.toLowerCase();
  if (h.endsWith('.dz') || h.includes('engleuphoria.dz') || h.startsWith('dz.')) return 'DZ';
  if (h.startsWith('tr.')) return 'TR';
  if (h.startsWith('es.')) return 'ES';
  if (h.startsWith('fr.')) return 'FR';
  if (h.startsWith('ar.') || h.startsWith('ae.') || h.startsWith('sa.')) return 'AR';
  return null;
}

function regionFromBrowserLang(lang: string | undefined): MarketRegion | null {
  if (!lang) return null;
  const root = lang.split('-')[0].toLowerCase();
  if (root === 'tr') return 'TR';
  if (root === 'es') return 'ES';
  if (root === 'fr') return 'FR';
  if (root === 'ar') return 'AR';
  return null;
}

/** Full resolver — used by the LocaleRouter on every navigation. */
export function resolveRegion(opts?: {
  pathname?: string;
  hostname?: string;
}): MarketRegion {
  const pathname =
    opts?.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const hostname =
    opts?.hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');

  const fromPath = regionFromPath(pathname);
  if (fromPath) return fromPath;

  if (typeof window !== 'undefined') {
    const sticky = window.localStorage?.getItem(STORAGE_KEY) as MarketRegion | null;
    if (sticky && REGION_CONFIG[sticky]) return sticky;
  }

  const fromHost = regionFromHost(hostname);
  if (fromHost) return fromHost;

  if (typeof navigator !== 'undefined') {
    const fromLang = regionFromBrowserLang(navigator.language);
    if (fromLang) return fromLang;
  }

  return 'INTL';
}

/** Legacy entry-point kept for existing callers (hostname-only). */
export function detectMarketRegion(hostname?: string): MarketRegion {
  return resolveRegion({ hostname, pathname: '' });
}

/**
 * The `users.market_region` column (and every other table with a
 * market_region column) is a Postgres enum that only has two values —
 * 'DZ' | 'INTL' — never migrated to match this file's newer 6-region
 * MarketRegion type (TR/ES/AR/FR added later for the adaptive
 * globalization layer, UI-only so far). Writing detectMarketRegion()'s
 * raw result straight into that column fails with a silent Postgres
 * "invalid input value for enum" error for any user resolved to TR/ES/
 * AR/FR — the INSERT/UPSERT throws, but every call site either only
 * console.errors it or doesn't check the error at all, so the account's
 * `users` row (and therefore its role, and anything keyed off it, like
 * being assignable a lesson) silently never gets created. Confirmed live
 * against production for a real account stuck in exactly this state.
 * Use this wherever a region value is written to a market_region DB
 * column; keep using MarketRegion/detectMarketRegion() directly for UI,
 * routing, and localization, which are unaffected.
 */
export function toDbMarketRegion(region: MarketRegion): 'DZ' | 'INTL' {
  return region === 'DZ' ? 'DZ' : 'INTL';
}

export function persistRegionChoice(region: MarketRegion) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, region);
  } catch {
    /* private mode — ignore */
  }
}

/** Strips the locale prefix from a path so we can re-prepend cleanly. */
export function stripLocalePrefix(pathname: string): string {
  const seg = pathname.split('/')[1]?.toLowerCase();
  if (seg && PREFIX_MAP[seg]) {
    const rest = pathname.slice(seg.length + 1);
    return rest === '' ? '/' : rest;
  }
  return pathname;
}

/** Prepends the active region's prefix to a path (INTL adds nothing). */
export function withLocalePath(region: MarketRegion, pathname: string): string {
  const prefix = REGION_CONFIG[region].pathPrefix;
  if (!prefix) return pathname;
  const clean = stripLocalePrefix(pathname);
  return clean === '/' ? prefix : `${prefix}${clean}`;
}

/**
 * Async geo-IP region resolver — used by LocaleProvider on first visit when
 * the user has no sticky choice and the URL has no explicit prefix. Cached in
 * localStorage so we only hit the network once per device.
 */
const GEO_CACHE_KEY = 'eu_geo_country';

/** Multiple providers — fall back if one is blocked / rate-limited / CORS-rejected. */
const GEO_PROVIDERS: Array<{ url: string; pick: (j: any) => string }> = [
  { url: 'https://ipapi.co/json/',                  pick: (j) => j?.country_code },
  { url: 'https://ipwho.is/',                       pick: (j) => j?.country_code },
  { url: 'https://get.geojs.io/v1/ip/country.json', pick: (j) => j?.country },
  { url: 'https://api.country.is/',                 pick: (j) => j?.country },
];

async function fetchCountry(): Promise<string> {
  for (const p of GEO_PROVIDERS) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1800);
      const res = await fetch(p.url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const data = await res.json();
      const code = (p.pick(data) || '').toString().toUpperCase();
      if (code && code.length === 2) return code;
    } catch { /* try next */ }
  }
  return '';
}

export async function detectRegionFromGeoIp(): Promise<MarketRegion | null> {
  if (typeof window === 'undefined') return null;
  try {
    let country = window.localStorage.getItem(GEO_CACHE_KEY) || '';
    if (!country) {
      country = await fetchCountry();
      if (country) {
        try { window.localStorage.setItem(GEO_CACHE_KEY, country); } catch { /* ignore */ }
      }
    }
    if (!country) return null;
    return COUNTRY_REGION[country] ?? 'INTL';
  } catch {
    return null;
  }
}
