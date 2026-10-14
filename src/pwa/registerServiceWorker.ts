/**
 * Guarded service-worker registration.
 * Registers /sw.js only in production, top-level, non-Lovable-preview contexts.
 * Provides ?sw=off kill switch and unregisters stale app SWs in refused contexts.
 */

const SW_PATH = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterMatching(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL ?? r.installing?.scriptURL ?? r.waiting?.scriptURL ?? "";
          return url.endsWith(SW_PATH) || url.endsWith("/service-worker.js");
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* ignore */
  }
}

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    void unregisterMatching();
    return;
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_PATH, { scope: "/" })
      .then((reg) => keepFresh(reg))
      .catch(() => {
        /* silent — offline is best-effort */
      });
  });
}

/* ---------- New versions reach every open tab (owner 2026-10-13: "the fixes of A1 Unit 1 Lesson 2 are not there") ----------
 * The service worker serves the saved app first, and a tab that stays open never asked for a newer one, so a deploy could
 * stay invisible for hours. Now: check for a new version on load, every 15 minutes and whenever the tab comes back into
 * view; when the new version takes over, reload — but never in the middle of a lesson or a class: there the reload waits
 * until the user leaves the lesson page. */
const UPDATE_EVERY_MS = 15 * 60 * 1000;
/** Pages where a reload would interrupt a lesson, a class or a game. */
export const LIVE_PAGE = /(classroom|playground-scene|playground\/|lesson|homework|quest|game|\/play\/|placement|arcade|storybook|test)/i;

function keepFresh(reg: ServiceWorkerRegistration): void {
  const check = () => {
    void reg.update().catch(() => {
      /* offline */
    });
  };
  window.setInterval(check, UPDATE_EVERY_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });

  let hadController = !!navigator.serviceWorker.controller;
  let pending = false;
  const reloadIfSafe = () => {
    if (pending && !LIVE_PAGE.test(window.location.pathname)) {
      pending = false;
      window.location.reload();
    }
  };
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // The first install takes control without a new version: nothing to reload.
    if (!hadController) {
      hadController = true;
      return;
    }
    pending = true;
    reloadIfSafe();
  });
  // In a lesson: reload as soon as the user moves to another page.
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history);
    history[method] = ((...args: Parameters<History["pushState"]>) => {
      original(...args);
      reloadIfSafe();
    }) as History["pushState"];
  }
  window.addEventListener("popstate", reloadIfSafe);
}
