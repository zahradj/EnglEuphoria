// Renders a branded SVG social-preview image for a public certificate.
// Public — anyone with the share token can fetch. Uses per-hub × per-CEFR
// `certificate_templates` design tokens when a template exists, otherwise
// falls back to the built-in hub/level palette.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LABEL: Record<string, string> = {
  story: "Story Adventurer",
  escape_room: "Escape Master",
  detective_mystery: "Master Detective",
  hidden_object: "Eagle Eye",
};

type HubKey = "playground" | "academy" | "success";
type CefrLevel = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1";

const HUB_LABEL: Record<string, string> = { playground: "Playground", academy: "Academy", success: "Success" };

const PALETTE: Record<HubKey, Record<CefrLevel, { primary: string; accent: string; text: string }>> = {
  playground: {
    "Pre-A1": { primary: "#FFB874", accent: "#FFF7E6", text: "#7A3B0E" },
    "A1":     { primary: "#FE9A4A", accent: "#FFEDD5", text: "#7A2E00" },
    "A2":     { primary: "#FE6A2F", accent: "#FEE3D0", text: "#6B1F00" },
    "B1":     { primary: "#E5501B", accent: "#FDD3B8", text: "#5C1900" },
    "B2":     { primary: "#C2410C", accent: "#FCC4A1", text: "#4A1200" },
    "C1":     { primary: "#9A3412", accent: "#FBB78F", text: "#3B0D00" },
  },
  academy: {
    "Pre-A1": { primary: "#C4B5FD", accent: "#F5F3FF", text: "#3B1D8C" },
    "A1":     { primary: "#A78BFA", accent: "#EDE9FE", text: "#3A177E" },
    "A2":     { primary: "#8B5CF6", accent: "#E9D5FF", text: "#341275" },
    "B1":     { primary: "#7C3AED", accent: "#DDD0FA", text: "#2D0F6B" },
    "B2":     { primary: "#6B21A8", accent: "#D0BEF5", text: "#260A5C" },
    "C1":     { primary: "#4C1D95", accent: "#C0AEEF", text: "#1F084C" },
  },
  success: {
    "Pre-A1": { primary: "#6EE7B7", accent: "#ECFDF5", text: "#065F46" },
    "A1":     { primary: "#34D399", accent: "#D1FAE5", text: "#064E3B" },
    "A2":     { primary: "#10B981", accent: "#BBF7D0", text: "#064E3B" },
    "B1":     { primary: "#059669", accent: "#A7F3D0", text: "#064E3B" },
    "B2":     { primary: "#047857", accent: "#8FE9C0", text: "#053E2E" },
    "C1":     { primary: "#065F46", accent: "#7ADCB0", text: "#043024" },
  },
};

function paletteFor(hub: string, cefr?: string | null) {
  const h = (PALETTE[hub as HubKey] ? hub : "academy") as HubKey;
  const lv = (cefr && (PALETTE[h] as any)[cefr] ? cefr : "A2") as CefrLevel;
  return PALETTE[h][lv];
}

function esc(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Missing token", { status: 400, headers: CORS });

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: cert } = await client
    .from("engine_mastery_certificates")
    .select("engine, hub, cefr_level, runs_count, avg_accuracy, awarded_at")
    .eq("share_token", token)
    .maybeSingle();
  if (!cert) return new Response("Not found", { status: 404, headers: CORS });

  const { data: tmpl } = await client
    .from("certificate_templates")
    .select("primary_color, accent_color, text_color, logo_url, background_url, heading, subheading")
    .eq("hub", cert.hub)
    .eq("cefr_level", cert.cefr_level || "")
    .eq("template_type", "engine_mastery")
    .maybeSingle();

  const base = paletteFor(String(cert.hub), cert.cefr_level as string | null);
  const primary = tmpl?.primary_color || base.primary;
  const accent = tmpl?.accent_color || base.accent;
  const text = tmpl?.text_color || base.text;
  const heading = tmpl?.heading || "ENGLEUPHORIA · CERTIFICATE OF MASTERY";
  const subheading = tmpl?.subheading || "engleuphoria.com";
  const logoUrl = tmpl?.logo_url || null;
  const bgUrl = tmpl?.background_url || null;

  const label = LABEL[cert.engine as string] || String(cert.engine);
  const pct = Math.round((cert.avg_accuracy ?? 0) * 100);
  const runs = cert.runs_count ?? 0;
  const hubLabel = HUB_LABEL[String(cert.hub)] || String(cert.hub);
  const levelTag = cert.cefr_level
    ? `<g><rect x="510" y="450" width="180" height="46" rx="23" fill="${primary}"/><text x="600" y="481" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="800" fill="#ffffff">${esc(hubLabel)} · ${esc(String(cert.cefr_level))}</text></g>`
    : `<text x="600" y="480" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" fill="${primary}" font-weight="800" letter-spacing="4">${esc(hubLabel.toUpperCase())} HUB</text>`;
  const logoNode = logoUrl
    ? `<image href="${esc(logoUrl)}" x="540" y="60" width="120" height="60" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="600" y="105" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="900" fill="${primary}" letter-spacing="4">ENGLEUPHORIA</text>`;
  const bgNode = bgUrl ? `<image href="${esc(bgUrl)}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice" opacity="0.18"/>` : "";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${bgNode}
  <rect x="30" y="30" width="1140" height="570" fill="none" stroke="${primary}" stroke-width="6" rx="24"/>
  <rect x="50" y="50" width="1100" height="530" fill="none" stroke="${primary}" stroke-width="1" stroke-opacity="0.4" rx="18"/>
  ${logoNode}
  <text x="600" y="160" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="18" letter-spacing="6" fill="${primary}" font-weight="700">${esc(heading)}</text>
  <text x="600" y="340" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="72" font-weight="900" fill="${text}">${esc(label)}</text>
  <text x="600" y="410" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="30" fill="${text}" opacity="0.85">${runs} quests · ${pct}% accuracy</text>
  ${levelTag}
  <text x="600" y="580" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="16" fill="${primary}" font-weight="700" letter-spacing="3">${esc(subheading)}</text>
</svg>`;
  const etag = `"${cert.awarded_at}-${cert.runs_count ?? 0}"`;
  const wantsPng = (url.searchParams.get("format") || "").toLowerCase() === "png";

  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ...CORS,
        ETag: etag,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  }

  if (wantsPng) {
    try {
      const mod: any = await import("https://esm.sh/@resvg/resvg-wasm@2.6.2");
      // Initialize WASM once per isolate.
      // deno-lint-ignore no-explicit-any
      const g = globalThis as any;
      if (!g.__resvgInited) {
        const wasmRes = await fetch("https://esm.sh/@resvg/resvg-wasm@2.6.2/index_bg.wasm");
        const wasmBuf = new Uint8Array(await wasmRes.arrayBuffer());
        await mod.initWasm(wasmBuf);
        g.__resvgInited = true;
      }
      const resvg = new mod.Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
      const png = resvg.render().asPng();
      return new Response(png, {
        headers: {
          ...CORS,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=604800, immutable, s-maxage=604800",
          ETag: etag,
        },
      });
    } catch (e) {
      // Fall through to SVG on rasterizer failure.
      console.error("[og] png rasterize failed:", (e as Error).message);
    }
  }

  return new Response(svg, {
    headers: {
      ...CORS,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=604800, immutable, s-maxage=604800",
      ETag: etag,
    },
  });
});
