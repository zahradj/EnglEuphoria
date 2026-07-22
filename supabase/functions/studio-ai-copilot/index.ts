import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

function buildGeneratePrompt(track: string, level: string, topic: string): string {
  const toneMap: Record<string, string> = {
    kids: "Use storytelling, emoji-rich 🎮🚀🌟, and adventurous language. Make it feel like a game quest. Use simple vocabulary and short sentences.",
    teens: "Use relatable, engaging language with pop-culture references. Balance fun with academic rigor. Include real-world examples.",
    adults: "Use executive, high-stakes, professional language. Include business contexts and sophisticated vocabulary. Keep it polished and efficient.",
  };

  const trackLabel: Record<string, string> = {
    kids: "Playground",
    teens: "Academy",
    adults: "Professional",
  };

  return `Act as an Elite Curriculum Designer for "English Euphoria" — a premium language learning platform.

Generate a complete ${level} level lesson for the **${trackLabel[track] || "Academy"}** track.

Topic: ${topic}

Structure the output in clean Markdown:

# ${topic}

## 🎬 Narrative Intro
Write a cinematic, engaging 3-sentence opening that hooks the learner immediately. ${toneMap[track] || toneMap.teens}

## 📚 Core Concepts
Present exactly 3 key grammar or vocabulary points:
- Each with a clear explanation
- A real-life example sentence
- A common mistake to avoid

## 🎯 Practice Exercises
Create 3 short exercises:
1. Fill-in-the-blank
2. Sentence transformation
3. Real-world scenario response

## 🧠 Quick Quiz
5 multiple-choice questions. For each:
- Question text
- 4 options (a, b, c, d)
- Mark the correct answer with ✅
- Brief explanation why

## 💡 Key Takeaways
3 bullet points summarizing what was learned.

IMPORTANT RULES:
- Match the CEFR ${level} level precisely in vocabulary and grammar complexity
- ${toneMap[track] || toneMap.teens}
- Make every sentence purposeful — no filler content
- Use real-world contexts, never abstract examples`;
}

function buildRefinePrompt(content: string, level: string): string {
  return `You are a CEFR language level specialist. Rewrite the following lesson content to precisely match CEFR ${level} level.

Rules:
- Adjust vocabulary complexity to ${level}
- Adjust sentence length and structure to ${level}
- Keep the same structure and topics
- Preserve all Markdown formatting
- Keep any emojis if present
- Do NOT add meta-commentary, just return the rewritten content

Content to refine:

${content}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });


  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { mode } = body;

    // MODE: generate
    if (mode === "generate") {
      const { track, level, topic } = body;
      if (!topic?.trim()) throw new Error("Topic is required");

      const response = await aiFetch(AI_GATEWAY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "user", content: buildGeneratePrompt(track || "teens", level || "B1", topic) },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI gateway error:", response.status, errText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices?.[0]?.message?.content || "";
      // Extract title from first heading
      const titleMatch = generatedContent.match(/^#\s+(.+)$/m);
      const generatedTitle = titleMatch ? titleMatch[1].trim() : topic;

      return new Response(JSON.stringify({ title: generatedTitle, content: generatedContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MODE: refine
    if (mode === "refine") {
      const { content, level } = body;
      if (!content?.trim()) throw new Error("Content is required");

      const response = await aiFetch(AI_GATEWAY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "user", content: buildRefinePrompt(content, level || "B1") },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI refine error:", response.status, errText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const refined = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ content: refined }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MODE: cover-image
    if (mode === "cover-image") {
      const { title, track } = body;
      if (!title?.trim()) throw new Error("Title is required for cover image");

      const styleMap: Record<string, string> = {
        kids: "colorful, playful, 3D cartoon style with bright warm orange and yellow tones, fun characters, game-like atmosphere",
        teens: "modern, sleek, dark background with electric blue and purple neon glow effects, futuristic academy style",
        adults: "minimalist, professional, emerald and charcoal palette, clean geometric shapes, executive business style",
      };

      const style = styleMap[track] || styleMap.teens;

      const imageResponse = await aiFetch(AI_GATEWAY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Generate a lesson cover image for an English language lesson titled "${title}". Style: ${style}. The image should be a wide banner (16:9 ratio) with no text on it. Make it visually stunning and premium-looking.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!imageResponse.ok) {
        const errText = await imageResponse.text();
        console.error("Image generation error:", imageResponse.status, errText);
        throw new Error(`Image generation failed: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      const base64Url = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!base64Url) {
        throw new Error("No image was generated");
      }

      // Upload to Supabase storage
      const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
      const imageBytes = decode(base64Data);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      const fileName = `covers/${crypto.randomUUID()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("lesson-covers")
        .upload(fileName, imageBytes, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("lesson-covers")
        .getPublicUrl(fileName);

      return new Response(JSON.stringify({ coverImageUrl: urlData.publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MODE: word-insight
    if (mode === "word-insight") {
      const { word, level: wordLevel } = body;
      if (!word?.trim()) throw new Error("Word is required");

      const response = await aiFetch(AI_GATEWAY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "user",
              content: `For the English word "${word}" at CEFR level ${wordLevel || "B1"}, provide:
1. A simple, clear meaning (1 sentence)
2. Phonetic pronunciation (IPA format)
3. A modern, real-world example sentence

Return ONLY valid JSON: {"meaning": "...", "pronunciation": "...", "example": "..."}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Word insight error:", response.status, errText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || "{}";

      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { meaning: "Definition unavailable", pronunciation: `/${word}/`, example: `Use "${word}" in a sentence.` };

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown mode: ${mode}`);
  } catch (e) {
    console.error("studio-ai-copilot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
