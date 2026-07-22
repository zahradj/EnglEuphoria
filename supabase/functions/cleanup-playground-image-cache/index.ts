// One-shot cleanup: removes stale Playground AI image caches so previously
// hallucinated (3D / Pixar / comic / off-subject) images can never be served.
// The edge function `generate-playground-images` now writes to the *-v2 folders.
// Invoke once after the v2 bump:
//   supabase.functions.invoke("cleanup-playground-image-cache")
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "playground_assets";
// Wipes EVERY top-level folder under the bucket whose name starts with "ai-"
// (plus the legacy "ai" root folder). This removes ALL cached AI images so
// the next generation runs fresh against Nano Banana Pro.


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const report: Record<string, number> = {};

    // Discover every top-level folder that starts with "ai" (covers "ai",
    // "ai-kiwi-*", "ai-pip-fox-*", "ai-default-*", and any older variant).
    const { data: roots, error: rootErr } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 1000 });
    if (rootErr) throw new Error(`list root: ${rootErr.message}`);
    const folders = (roots ?? [])
      .filter((entry) => entry?.name && entry.name.toLowerCase().startsWith("ai"))
      .map((entry) => entry.name);

    for (const folder of folders) {
      let removed = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(folder, { limit: 1000 });
        if (error) throw new Error(`list ${folder}: ${error.message}`);
        if (!data || data.length === 0) break;
        const paths = data.map((f) => `${folder}/${f.name}`);
        const { error: rmErr } = await supabase.storage.from(BUCKET).remove(paths);
        if (rmErr) throw new Error(`remove ${folder}: ${rmErr.message}`);
        removed += paths.length;
        if (data.length < 1000) break;
      }
      report[folder] = removed;
    }

    return new Response(JSON.stringify({ ok: true, removed: report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
