// Storybook Studio — per-page media generation + cascade delete.
// Manual surface used by content/story creators when "Auto-generate" is OFF
// in StoryCreator. NOT part of the locked storybook-generate background pipeline.
//
// Actions:
//   - generate_image    { pageId, regenerate? }  → calls ai-image-generation, updates storybook_pages.illustration_url
//   - generate_audio    { pageId, regenerate? }  → calls generate-elevenlabs-audio, uploads to storage, updates storybook_pages.audio_url
//   - delete_book       { bookId }               → cascade delete from storybooks (chapters/pages/library wipe via FK)
//
// Uses service-role to bypass RLS but verifies the caller owns the book/page first.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

function svc() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

async function getCallerId(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const client = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data } = await client.auth.getUser();
  return data?.user?.id ?? null;
}

async function ownsBook(db: ReturnType<typeof svc>, bookId: string, userId: string): Promise<boolean> {
  const { data } = await db.from("storybooks").select("created_by").eq("id", bookId).maybeSingle();
  return !!data && (data as any).created_by === userId;
}

async function ownerOfPage(db: ReturnType<typeof svc>, pageId: string): Promise<{ bookId: string; createdBy: string | null } | null> {
  const { data: page } = await db
    .from("storybook_pages")
    .select("id, chapter_id, content, illustration_url, audio_url")
    .eq("id", pageId)
    .maybeSingle();
  if (!page) return null;
  const { data: chapter } = await db
    .from("storybook_chapters")
    .select("book_id")
    .eq("id", (page as any).chapter_id)
    .maybeSingle();
  if (!chapter) return null;
  const { data: book } = await db
    .from("storybooks")
    .select("created_by")
    .eq("id", (chapter as any).book_id)
    .maybeSingle();
  return { bookId: (chapter as any).book_id, createdBy: (book as any)?.created_by ?? null };
}

function extractImagePrompt(page: any): string {
  const content = page?.content;
  const data = content?.data ?? {};
  return (
    data.image_prompt ||
    data.illustration_prompt ||
    data.prompt ||
    data.caption ||
    data.alt ||
    data.text ||
    "Story scene"
  );
}

function extractNarrationText(page: any): string {
  const data = page?.content?.data ?? {};
  if (typeof data.text === "string" && data.text.trim()) return data.text;
  if (Array.isArray(data.lines)) {
    return data.lines.map((l: any) => l?.text ?? "").filter(Boolean).join(" ");
  }
  if (typeof data.caption === "string") return data.caption;
  if (typeof data.prompt === "string") return data.prompt;
  return "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = await getCallerId(req.headers.get("Authorization"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "Sign-in required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action = body?.action as string;
    const db = svc();

    // ── DELETE BOOK ────────────────────────────────────────────────
    if (action === "delete_book") {
      const bookId = body.bookId as string;
      if (!bookId) throw new Error("bookId required");
      if (!(await ownsBook(db, bookId, userId))) {
        return new Response(JSON.stringify({ error: "Not your book" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Cascade: pages → chapters → student_library entries → book
      const { data: chapters } = await db.from("storybook_chapters").select("id").eq("book_id", bookId);
      const chapterIds = (chapters ?? []).map((c: any) => c.id);
      if (chapterIds.length) {
        await db.from("storybook_pages").delete().in("chapter_id", chapterIds);
        await db.from("storybook_chapters").delete().in("id", chapterIds);
      }
      await db.from("student_library").delete().eq("book_id", bookId);
      await db.from("storybooks").delete().eq("id", bookId);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PAGE MEDIA ─────────────────────────────────────────────────
    const pageId = body.pageId as string;
    if (!pageId) throw new Error("pageId required");

    const ownerInfo = await ownerOfPage(db, pageId);
    if (!ownerInfo || ownerInfo.createdBy !== userId) {
      return new Response(JSON.stringify({ error: "Not your page" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: page } = await db.from("storybook_pages").select("*").eq("id", pageId).maybeSingle();
    if (!page) throw new Error("Page not found");

    if (action === "generate_image") {
      const prompt = extractImagePrompt(page);
      // Storybook illustration brief — large hero composition that fills the
      // page frame so it never looks lost behind a caption box.
      const enriched =
        `${prompt}. Children's storybook illustration, wide cinematic composition that fills the entire frame edge-to-edge, ` +
        `subject centred with comfortable headroom, warm colours, friendly characters, no borders, no letterboxing, no text overlays.`;

      const storagePath = `storybook-illustrations/${ownerInfo.bookId}/${pageId}-${Date.now()}.png`;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-image-generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
        body: JSON.stringify({
          prompt: enriched,
          style: "cinematic",
          aspectRatio: "16:9",
          persist: true,
          storagePath,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.imageUrl) {
        throw new Error(`Image generation failed: ${j?.error || j?.details || res.status}`);
      }
      await db.from("storybook_pages").update({ illustration_url: j.imageUrl }).eq("id", pageId);
      return new Response(JSON.stringify({ ok: true, illustration_url: j.imageUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_audio") {
      const text = extractNarrationText(page);
      if (!text.trim()) throw new Error("This page has no narration text to voice.");

      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-elevenlabs-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Audio generation failed: ${res.status} ${err}`);
      }
      const audioBuf = new Uint8Array(await res.arrayBuffer());

      const path = `storybook-audio/${ownerInfo.bookId}/${pageId}-${Date.now()}.mp3`;
      const up = await db.storage.from("lesson-assets").upload(path, audioBuf, {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (up.error) throw new Error(`Upload failed: ${up.error.message}`);
      const { data: pub } = db.storage.from("lesson-assets").getPublicUrl(path);
      const audioUrl = pub.publicUrl;

      await db.from("storybook_pages").update({ audio_url: audioUrl }).eq("id", pageId);
      return new Response(JSON.stringify({ ok: true, audio_url: audioUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("storybook-studio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
