/**
 * Renders <link rel="alternate" hreflang="…"> tags for the current path
 * across all supported regions, plus a self-canonical for the active region.
 *
 * Used at the app root so every page gets correct hreflang annotations.
 */
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { REGION_CONFIG, stripLocalePrefix, withLocalePath, MarketRegion } from '@/lib/marketRegion';

const SITE = 'https://www.engleuphoria.com';
const ORDER: MarketRegion[] = ['INTL', 'TR', 'ES', 'FR', 'AR', 'DZ'];

export const HreflangTags = () => {
  const { pathname } = useLocation();
  const clean = stripLocalePrefix(pathname);

  return (
    <Helmet>
      {ORDER.map((code) => {
        const url = SITE + withLocalePath(code, clean);
        return (
          <link
            key={code}
            rel="alternate"
            hrefLang={REGION_CONFIG[code].hreflang}
            href={url}
          />
        );
      })}
      <link rel="alternate" hrefLang="x-default" href={SITE + clean} />
    </Helmet>
  );
};
