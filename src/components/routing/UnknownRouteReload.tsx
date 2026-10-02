import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hardReload } from '@/lib/chunkLoadRecovery';

/**
 * Catch-all route. A tab opened before a deploy runs the old bundle, which
 * doesn't know routes added since (e.g. a new lesson's
 * /playground-scene/castle-lesson-3) — clicking it from the Playground
 * Library used to bounce straight to "/" and look like an empty, broken
 * lesson. So the first time an unknown path is hit, reload once (service
 * worker + caches cleared, see hardReload) to pick up the current deploy;
 * only if the path is still unknown after that is it treated as a real 404.
 */
export default function UnknownRouteReload() {
  const { pathname } = useLocation();
  const key = `unknown_route_reload:${pathname}`;
  const [giveUp] = useState(() => {
    try { return sessionStorage.getItem(key) === '1'; } catch { return true; }
  });
  useEffect(() => {
    if (giveUp) return;
    try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ }
    void hardReload();
  }, [giveUp, key]);
  if (giveUp) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-dvh items-center justify-center text-sm font-semibold text-neutral-500">Loading the latest version…</div>
  );
}
