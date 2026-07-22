// Search YouTube via the Data API v3 and return the best safe match for a query.
// Applies hub-aware SafeSearch + duration filters from the AI Art Director profile.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HUB_ART_PROFILES, normalizeArtHub } from "../_shared/hubArtStyles.ts";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface YtSearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string; channelTitle?: string; description?: string; thumbnails?: { high?: { url?: string } } };
}
interface YtVideoItem {
  id: string;
  contentDetails?: { duration?: string; regionRestriction?: { blocked?: string[]; allowed?: string[] } };
  status?: { embeddable?: boolean; madeForKids?: boolean };
  statistics?: { viewCount?: string };
}

// ISO-8601 duration → seconds (PT#H#M#S).
function isoDurationToSeconds(iso?: string): number {
  if (!iso) return 0;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'content_creator', 'teacher'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { query, hub, maxResults = 5 } = await req.json();
    if (!query || typeof query !== "string" || !query.trim()) {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const YT_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YT_KEY) {
      return new Response(JSON.stringify({ error: "YOUTUBE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const artHub = normalizeArtHub(hub);
    const profile = HUB_ART_PROFILES[artHub];

    // 1) Search
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("key", YT_KEY);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", String(Math.min(10, Math.max(1, +maxResults))));
    searchUrl.searchParams.set("safeSearch", profile.safe_search);
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("videoSyndicated", "true");
    searchUrl.searchParams.set("relevanceLanguage", "en");

    const sRes = await fetch(searchUrl.toString());
    if (!sRes.ok) {
      const txt = await sRes.text();
      return new Response(JSON.stringify({ error: "YouTube search failed", details: txt }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sJson = await sRes.json() as { items?: YtSearchItem[] };
    const ids = (sJson.items || []).map((i) => i.id?.videoId).filter(Boolean) as string[];
    if (!ids.length) {
      return new Response(JSON.stringify({ error: "No videos found", query }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Hydrate details (duration, embeddable, made-for-kids)
    const detUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detUrl.searchParams.set("key", YT_KEY);
    detUrl.searchParams.set("part", "contentDetails,status,statistics");
    detUrl.searchParams.set("id", ids.join(","));
    const dRes = await fetch(detUrl.toString());
    if (!dRes.ok) {
      const txt = await dRes.text();
      return new Response(JSON.stringify({ error: "YouTube details failed", details: txt }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const dJson = await dRes.json() as { items?: YtVideoItem[] };
    const detailMap = new Map((dJson.items || []).map((v) => [v.id, v]));

    // 3) Score & pick: prefer embeddable, within duration cap, more views.
    const candidates = (sJson.items || [])
      .map((it) => {
        const id = it.id?.videoId;
        if (!id) return null;
        const det = detailMap.get(id);
        if (!det || !det.status?.embeddable) return null;
        const seconds = isoDurationToSeconds(det.contentDetails?.duration);
        if (seconds < 10 || seconds > profile.max_video_seconds) return null;
        // Playground requires made-for-kids.
        if (artHub === "Playground" && det.status?.madeForKids === false) return null;
        const views = +(det.statistics?.viewCount || "0");
        return {
          videoId: id,
          title: it.snippet?.title || "",
          channel: it.snippet?.channelTitle || "",
          description: it.snippet?.description || "",
          thumbnail: it.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          seconds,
          views,
        };
      })
      .filter(Boolean) as Array<{ videoId: string; title: string; channel: string; description: string; thumbnail: string; seconds: number; views: number }>;

    if (!candidates.length) {
      return new Response(JSON.stringify({ error: "No safe/embeddable result", query }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    candidates.sort((a, b) => b.views - a.views);
    const winner = candidates[0];

    return new Response(JSON.stringify({
      videoId: winner.videoId,
      youtube_url: `https://www.youtube.com/watch?v=${winner.videoId}`,
      embed_url: `https://www.youtube-nocookie.com/embed/${winner.videoId}?rel=0&modestbranding=1`,
      title: winner.title,
      channel: winner.channel,
      thumbnail: winner.thumbnail,
      seconds: winner.seconds,
      hub: artHub,
      query,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("fetch-youtube-video error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
