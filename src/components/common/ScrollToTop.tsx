import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll AND the nearest [data-app-main] scroll container
 * on every route change so the bottom of a page is never hidden behind
 * sticky chrome from the previous view.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    document.querySelectorAll<HTMLElement>('[data-app-main]').forEach((el) => {
      el.scrollTo({ top: 0, left: 0 });
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
