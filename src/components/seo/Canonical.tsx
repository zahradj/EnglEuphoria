import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Maintains a single <link rel="canonical"> tag pointing to the apex
 * https://engleuphoria.com origin for whatever route the user is on.
 *
 * Fixes Google Search Console "Duplicate without user-selected canonical"
 * caused by the same content being reachable from:
 *   - https://engleuphoria.com
 *   - https://www.engleuphoria.com
 *   - https://engleuphoria.lovable.app
 *   - https://id-preview--<id>.lovable.app
 *
 * Routes that are private (auth, dashboards, classroom, etc.) are marked
 * noindex so Google does not try to crawl/index them at all.
 */
const CANONICAL_ORIGIN = 'https://engleuphoria.com';

const NOINDEX_PREFIXES = [
  '/dashboard',
  '/admin',
  '/teacher-dashboard',
  '/teacher',
  '/student',
  '/parent',
  '/playground',
  '/academy',
  '/hub',
  '/classroom',
  '/auth',
  '/login',
  '/sign-up',
  '/signup',
  '/student-signup',
  '/email-verification',
  '/auth/callback',
  '/profile',
  '/hub-confirmation',
  '/playground-creator',
  '/academy-creator',
  '/success-creator',
  '/academy-classroom',
];

const shouldNoindex = (pathname: string) =>
  NOINDEX_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const upsertMeta = (name: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const removeMeta = (name: string) => {
  const el = document.head.querySelector(`meta[name="${name}"]`);
  if (el) el.remove();
};

export const Canonical = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Normalize: strip trailing slash except for root, drop query/hash
    const normalized =
      pathname !== '/' && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname;

    upsertLink('canonical', `${CANONICAL_ORIGIN}${normalized}`);

    if (shouldNoindex(pathname)) {
      upsertMeta('robots', 'noindex, nofollow');
    } else {
      // Ensure public pages are explicitly indexable
      removeMeta('robots');
    }
  }, [pathname]);

  return null;
};

export default Canonical;
