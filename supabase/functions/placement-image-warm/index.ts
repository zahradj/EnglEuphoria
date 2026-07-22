// placement-image-warm
// Idempotent image cache warmer for Playground CAT items.
// Generates one child-friendly image per answer option via Gemini direct
// (per project runtime-AI rule — Lovable Gateway is forbidden), uploads
// to the `placement-images` Storage bucket, and writes the public URL
// array back to the row. Skips rows that already have images.
// Allowed roles: admin, content_creator.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { generateGoogleImage, GoogleImageError } from "../_shared/googleImageClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "placement-images";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const STYLE_PREFIX =
  "Child-friendly 3D-feel illustration in a polished Pixar style, " +
  "bright vibrant colors, soft cinematic lighting, single subject, " +
  "centered, isolated on a clean white background, no text, no logos, " +
  "no scary or mature themes.";

async function ensureBucket(admin: ReturnType<typeof createClient>) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return;
  await admin.storage.createBucket(BUCKET, { public: true });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!Deno.env.get("GEMINI_API_KEY")) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth gate: admin OR content_creator
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id);
    const allowed = (roles ?? []).some(
      (r: any) => r.role === "admin" || r.role === "super_admin" || r.role === "content_creator",
    );
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden: admin or content_creator role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await ensureBucket(admin);

    // Only warm rows that have no images yet
    const { data: items, error } = await admin
      .from("cat_items")
      .select("id, options, option_image_urls")
      .is("option_image_urls", null);
    if (error) throw error;

    const results: Array<{ id: string; urls?: string[]; error?: string }> = [];

    for (const item of items ?? []) {
      const opts: string[] = Array.isArray((item as any).options) ? (item as any).options : [];
      try {
        const urls: string[] = [];
        for (let i = 0; i < opts.length; i++) {
          const { bytes, contentType } = await generateGoogleImage(
            `${STYLE_PREFIX}\n\nSubject: ${opts[i]}`,
          );
          const path = `${(item as any).id}/opt-${i}.png`;
          const { error: upErr } = await admin.storage
            .from(BUCKET)
            .upload(path, bytes, { contentType: contentType || "image/png", upsert: true });
          if (upErr) throw upErr;
          const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
          urls.push(pub.publicUrl);
        }
        const { error: updErr } = await admin
          .from("cat_items")
          .update({ option_image_urls: urls, updated_at: new Date().toISOString() })
          .eq("id", (item as any).id);
        if (updErr) throw updErr;
        results.push({ id: (item as any).id, urls });
      } catch (e) {
        const msg =
          e instanceof GoogleImageError
            ? `Gemini image (${e.status}): ${e.message}`
            : e instanceof Error
              ? e.message
              : String(e);
        results.push({ id: (item as any).id, error: msg });
      }
    }

    return new Response(
      JSON.stringify({
        warmed: results.filter((r) => r.urls).length,
        total: items?.length ?? 0,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
