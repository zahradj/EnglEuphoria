// Orchestrator: walks every slide in a deck and, in parallel batches, generates
// either an AI image (with the hub Art Director suffix) or fetches a safe
// YouTube video — based on the slide's `requires_video` flag.
//
// Voiceovers are intentionally NOT generated here (they're handled per-slide
// by the existing generate-slide-voiceover button, since voice is expensive
// and often slide-specific).
//
// Returns a per-slide map: { [slideId]: { custom_image_url? | youtube_video_id? | error? } }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PanelJob {
  image_prompt?: string;
  image_url?: string;
  imageUrl?: string;
}

interface SlideJob {
  id: string;
  slide_type?: string;
  title?: string;
  visual_keyword?: string;
  image_generation_prompt?: string;
  requires_video?: boolean;
  youtube_query?: string;
  custom_image_url?: string;
  custom_video_url?: string;
  youtube_video_id?: string;
  panels?: PanelJob[];
  interactive_data?: { panels?: PanelJob[] } & Record<string, unknown>;
}

interface PanelResult { index: number; image_url?: string; error?: string }

interface SlideResult {
  slideId: string;
  custom_image_url?: string;
  youtube_video_id?: string;
  youtube_embed_url?: string;
  youtube_title?: string;
  youtube_thumbnail?: string;
  panels?: PanelResult[];
  skipped?: boolean;
  error?: string;
}

const PARALLEL = 3; // throttle so we don't hammer the AI gateway / YouTube quota.

async function processBatches<T, R>(
  items: T[],
  size: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const settled = await Promise.all(batch.map((it) => worker(it)));
    out.push(...settled);
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lessonId, hub, slides, overwrite = false } = await req.json() as {
      lessonId?: string;
      hub?: string;
      slides?: SlideJob[];
      overwrite?: boolean;
    };
    if (!Array.isArray(slides) || !slides.length) {
      return new Response(JSON.stringify({ error: "slides[] is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!lessonId || lessonId === 'draft') {
      console.warn(`generate-all-media called without persisted lessonId (got "${lessonId}"). Images will be uploaded under draft/ and may not survive a client refresh.`);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const worker = async (slide: SlideJob): Promise<SlideResult> => {
      try {
        const wantsVideo = !!slide.requires_video && !!(slide.youtube_query || "").trim();
        // Resolve panels from either top-level or interactive_data
        const panelsIn: PanelJob[] | undefined =
          (Array.isArray(slide.panels) ? slide.panels : undefined) ||
          (slide.interactive_data && Array.isArray(slide.interactive_data.panels)
            ? (slide.interactive_data.panels as PanelJob[])
            : undefined);
        const hasPanels = !!panelsIn && panelsIn.length > 0;
        const wantsImage = !wantsVideo && !!(
          slide.image_generation_prompt || slide.visual_keyword || slide.title || hasPanels
        );

        // Skip-if-already-done logic
        if (!overwrite) {
          if (wantsVideo && slide.youtube_video_id) return { slideId: slide.id, skipped: true };
          if (!wantsVideo && hasPanels) {
            const allFilled = panelsIn!.every((p) => !!(p.image_url || p.imageUrl));
            if (allFilled) return { slideId: slide.id, skipped: true };
          } else if (wantsImage && slide.custom_image_url) {
            return { slideId: slide.id, skipped: true };
          }
        }

        if (wantsVideo) {
          const { data, error } = await admin.functions.invoke("fetch-youtube-video", {
            body: { query: slide.youtube_query, hub },
          });
          if (error) throw new Error(error.message);
          if (!data?.videoId) throw new Error("No video returned");
          return {
            slideId: slide.id,
            youtube_video_id: data.videoId,
            youtube_embed_url: data.embed_url,
            youtube_title: data.title,
            youtube_thumbnail: data.thumbnail,
          };
        }

        // PANELED: generate one image per panel that needs it.
        if (hasPanels) {
          const panelResults: PanelResult[] = [];
          for (let i = 0; i < panelsIn!.length; i++) {
            const p = panelsIn![i];
            const existing = p.image_url || p.imageUrl;
            if (existing && !overwrite) {
              panelResults.push({ index: i, image_url: existing });
              continue;
            }
            const prompt = (p.image_prompt || slide.image_generation_prompt || slide.visual_keyword || slide.title || '').trim();
            if (!prompt) {
              panelResults.push({ index: i, error: 'No image_prompt for panel' });
              continue;
            }
            try {
              const { data, error } = await admin.functions.invoke("generate-slide-image", {
                body: { prompt, lessonId, slideId: `${slide.id}__p${i}`, hub },
              });
              if (error) throw new Error(error.message);
              if (!data?.url) throw new Error("No image URL returned");
              panelResults.push({ index: i, image_url: data.url });
            } catch (e) {
              panelResults.push({ index: i, error: (e as Error).message });
            }
          }
          // Also expose panel[0] as custom_image_url so legacy hydration works.
          const first = panelResults.find((r) => r.image_url)?.image_url;
          return {
            slideId: slide.id,
            panels: panelResults,
            ...(first && !slide.custom_image_url ? { custom_image_url: first } : {}),
          };
        }

        if (wantsImage) {
          const prompt = (slide.image_generation_prompt || slide.visual_keyword || slide.title || "").trim();
          const { data, error } = await admin.functions.invoke("generate-slide-image", {
            body: { prompt, lessonId, slideId: slide.id, hub },
          });
          if (error) throw new Error(error.message);
          if (!data?.url) throw new Error("No image URL returned");
          return { slideId: slide.id, custom_image_url: data.url };
        }

        return { slideId: slide.id, skipped: true };
      } catch (e) {
        return { slideId: slide.id, error: (e as Error).message };
      }
    };

    const results = await processBatches(slides, PARALLEL, worker);

    const panelImages = results.reduce(
      (n, r) => n + (Array.isArray(r.panels) ? r.panels.filter((p) => p.image_url).length : 0),
      0,
    );
    const summary = {
      total: results.length,
      images: results.filter((r) => r.custom_image_url).length + panelImages,
      videos: results.filter((r) => r.youtube_video_id).length,
      skipped: results.filter((r) => r.skipped).length,
      errors: results.filter((r) => r.error).length
        + results.reduce((n, r) => n + (Array.isArray(r.panels) ? r.panels.filter((p) => p.error).length : 0), 0),
    };

    return new Response(JSON.stringify({ results, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-all-media error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
