import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      manifest: false, // keep existing public/manifest.json
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-navigations",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // JS/CSS use StaleWhileRevalidate rather than CacheFirst: content-hashed
            // filenames mean a stale entry only lingers if the browser never gets a
            // chance to re-fetch it, but CacheFirst blindly trusts whatever's cached
            // for up to 30 days with no revalidation at all — the exact mechanism
            // behind repeated "I cleared my cache and still don't see the update"
            // reports, since a hard clear was needed to force it. StaleWhileRevalidate
            // still serves instantly from cache, but always fires a background fetch
            // that updates the cache for the *next* load — no manual clear needed.
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /\.(?:js|css)$/.test(url.pathname),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets-js",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Images/fonts are safe to keep on CacheFirst — they're content-hashed
            // too but change far less often, and re-fetching them on every load has
            // no benefit worth the bandwidth.
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:woff2|png|svg|jpg|jpeg|webp)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets-media",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

