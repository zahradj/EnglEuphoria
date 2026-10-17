// Push notifications. Imported into the app's service worker (see vite.config.ts `importScripts`).
// The send-push edge function sends { title, body, url, tag }.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'EnglEuphoria';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icons/ee-icon-192.png',
      badge: '/favicon-v2-48.png',
      tag: data.tag || undefined,
      renotify: !!data.tag,
      // Lesson reminders: stay on screen (phone / tablet) and buzz, so a student or teacher does not miss the start.
      requireInteraction: !!data.urgent,
      vibrate: data.urgent ? [250, 120, 250, 120, 250] : [120],
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  const url = new URL(target, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const w of windows) {
        if (w.url === url && 'focus' in w) return w.focus();
      }
      for (const w of windows) {
        if ('navigate' in w && 'focus' in w) return w.navigate(url).then((c) => c && c.focus());
      }
      return self.clients.openWindow(url);
    }),
  );
});
