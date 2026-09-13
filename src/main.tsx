
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './playground-blueprint/styles.css'
// Creator Studio workspace fonts
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import i18n from '@/lib/i18n';
import { clearAllCaches, optimizeForProduction } from '@/utils/productionCleanup';
import { clearInsecureRoleStorage } from '@/utils/roleValidation';
import { installVocabArcObserver } from '@/lib/vocabArcObserver';
import { reloadOnceForChunkError } from '@/lib/chunkLoadRecovery';

// A stale page can reference JS chunk files a newer deploy has already
// replaced — Vite fires this event on the window when that happens. One
// reload fetches the current chunk manifest and almost always fixes it;
// see chunkLoadRecovery.ts for why this exists (it was silently crashing
// the homepage for real visitors and Googlebot, plus at least one live
// classroom, before this was wired up).
window.addEventListener('vite:preloadError', () => {
  reloadOnceForChunkError();
});

// Route Academy vocab-gamification arc completions into the intelligence observer
installVocabArcObserver({ defaultHub: 'academy' });

// Optimize for production environment
if (import.meta.env.PROD) {
  optimizeForProduction();
}

// Clear stale caches on app start
const CACHE_VERSION = 'v7';
const lastCacheVersion = localStorage.getItem('cache_version');
if (lastCacheVersion !== CACHE_VERSION) {
  clearAllCaches().then(() => {
    localStorage.setItem('cache_version', CACHE_VERSION);
  });
}

// Clear insecure role data on app start
clearInsecureRoleStorage();

// Register the offline-shell service worker via the single guarded wrapper.
// The wrapper refuses registration in dev, iframe previews, Lovable preview
// hosts, and when `?sw=off` is present (kill switch).
import { registerServiceWorker } from '@/pwa/registerServiceWorker';
registerServiceWorker();

// Initialize document language and direction based on i18n
const setDocLangDir = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};
setDocLangDir(i18n.language);
i18n.on('languageChanged', setDocLangDir);

// Wire vocab-games quiz-failure reinforcement queue.
import('@/lib/vocabGamesReinforcement').then((m) =>
  m.installVocabGamesReinforcement(),
);

// Auto-aggregate vocab-arc completions per unit for the Unit Progress Report.
// Renderers can pass `unit_id` inside `telemetry_tag` as "unit:<id>|..." or
// dispatch a companion `unit_id` field via CustomEvent detail.
import('@/lib/unitProgressReport').then(({ recordVocabArcForUnit }) => {
  window.addEventListener('vocab-arc:complete', (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail) return;
    const tag: string = detail.telemetry_tag ?? '';
    const match = /unit:([^|;\s]+)/.exec(tag);
    const unitId = detail.unit_id ?? (match ? match[1] : null);
    if (unitId) recordVocabArcForUnit(unitId, detail);
  });
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>
);
