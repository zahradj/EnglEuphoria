// Generate an image with Google AI Studio (gemini-2.5-flash-image) and
// upload it to the public `lesson-assets` bucket. Returns the public URL.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { applyHubStyle, normalizeArtHub } from "../_shared/hubArtStyles.ts";
import { generateGoogleImage, GoogleImageError } from "../_shared/googleImageClient.ts";
import { buildVocabularyPrompt } from "../_shared/vocabularyImageBrain.ts";
import { planVocabCast, characterDirective, type CastMember } from "../_shared/vocabCastBrain.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "lesson-assets";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, lessonId, slideId, hub, starring_character, slideKind, vocabulary_word, example_sentence, unit_theme, auto_cast, cefr } = await req.json();
    const isVocab = slideKind === "vocabulary" && typeof vocabulary_word === "string" && vocabulary_word.trim().length > 0;
    if (!isVocab && (!prompt || typeof prompt !== "string" || !prompt.trim())) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Vocabulary Image Brain: replace prompt with a fully-baked scene
    // description that bakes in modesty + 60% branding + age-appropriate style.
    const basePrompt = isVocab
      ? buildVocabularyPrompt({ vocabulary_word, example_sentence, hub })
      : prompt;

    // ─── Smart Cast Planner ──────────────────────────────────────────────
    // Decide automatically whether to inject Playground cast characters:
    //   • OBJECT vocab (cat, apple, red)        → no character, render solo
    //   • ACTION / EXPRESSION (hello, jump, hug) → 1 cast character acting
    //   • FAMILY theme                            → lead + 2 cast members
    // An explicit `starring_character` from the caller always wins.
    let castedPrompt = basePrompt;
    const hubLower = String(hub || "").toLowerCase();
    const isPlayground = hubLower.includes("playground") || hubLower.includes("kids");
    let cast: CastMember[] = [];
    if (starring_character && typeof starring_character === "object") {
      const name = String((starring_character as any).name || "").trim();
      if (name.toLowerCase() === "none" || name.toLowerCase() === "__none__") return;
      const blueprint = String((starring_character as any).visual_blueprint || "").trim();
      if (name && blueprint) cast = [{ name, visual_blueprint: blueprint, voice_id: "" }];
    } else if (isVocab && isPlayground && auto_cast !== false) {
      cast = planVocabCast({
        word: vocabulary_word,
        unitTheme: unit_theme || "",
        lessonId: String(lessonId || ""),
      });
    }
    if (cast.length > 0) {
      const action = isVocab ? String(vocabulary_word) : "the depicted scene";
      castedPrompt = `${basePrompt}\n${characterDirective(cast, action, cefr)}`;
    }
    // Apply the AI Art Director's house-style suffix for the target hub.
    const artHub = normalizeArtHub(hub);
    const styled = applyHubStyle(castedPrompt, artHub);
    // Subject-binding wrapper — keep the subject mandatory so style doesn't drift content.
    const subjectAnchor = isVocab
      ? `the vocabulary item "${vocabulary_word}"`
      : `the described subject`;
    const styledPrompt =
      `PRIMARY SUBJECT (MANDATORY): the image MUST clearly and unambiguously depict ${subjectAnchor}. ` +
      `Do NOT substitute, add, or invent unrelated objects, characters, or animals.\n\n${styled}\n\n` +
      `Reminder — final image MUST depict ${subjectAnchor}.`;

    let bytes: Uint8Array;
    let contentType: string;
    try {
      const out = await generateGoogleImage(styledPrompt);
      bytes = out.bytes;
      contentType = out.contentType;
    } catch (e) {
      const err = e as GoogleImageError;
      const status = err.status ?? 500;
      return new Response(JSON.stringify({ error: err.message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ext = contentType.split("/")[1].replace("+xml", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const safeLesson = (lessonId || "draft").toString().replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeSlide = (slideId || crypto.randomUUID()).toString().replace(/[^a-zA-Z0-9_-]/g, "_");
    const path = `studio/${safeLesson}/ai-image-${safeSlide}-${Date.now()}.${ext}`;

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) {
      console.error("Upload error:", upErr);
      return new Response(JSON.stringify({ error: "Storage upload failed", details: upErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    return new Response(JSON.stringify({ url: pub.publicUrl, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-slide-image error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
