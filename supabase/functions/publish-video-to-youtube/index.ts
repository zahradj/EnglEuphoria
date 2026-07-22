// Upload a stored playground video to the central YouTube channel.
// Uses YOUTUBE_CLIENT_ID/SECRET/REFRESH_TOKEN to mint an access token, then
// performs a resumable upload to YouTube Data API v3.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const clientId = Deno.env.get("YOUTUBE_CLIENT_ID");
    const clientSecret = Deno.env.get("YOUTUBE_CLIENT_SECRET");
    const refreshToken = Deno.env.get("YOUTUBE_REFRESH_TOKEN");
    if (!clientId || !clientSecret || !refreshToken) {
      return json({ error: "YouTube credentials are not configured." }, 503);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { id, title, description, privacy } = await req.json();
    if (!id) return json({ error: "id required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: row, error } = await admin
      .from("playground_videos")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (error || !row) return json({ error: error?.message ?? "not found" }, 404);
    if (row.status !== "ready" || !row.storage_path) {
      return json({ error: "Video is not ready yet" }, 400);
    }

    // 1. Refresh access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return json({ error: "Failed to refresh YouTube token", details: tokenJson }, 502);
    }
    const accessToken = tokenJson.access_token as string;

    // 2. Download mp4 from storage
    const dl = await admin.storage.from("playground-videos").download(row.storage_path);
    if (dl.error || !dl.data) return json({ error: dl.error?.message ?? "download failed" }, 500);
    const bytes = await dl.data.arrayBuffer();

    // 3. YouTube resumable upload (single PUT works for small files <100MB)
    const metadata = {
      snippet: {
        title: (title || `Playground clip ${id.slice(0, 6)}`).slice(0, 95),
        description: (description || row.prompt || "Generated with Engleuphoria Playground").slice(0, 4900),
        categoryId: "27", // Education
      },
      status: {
        privacyStatus: privacy === "public" ? "public" : privacy === "private" ? "private" : "unlisted",
        selfDeclaredMadeForKids: true,
      },
    };

    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": "video/mp4",
          "X-Upload-Content-Length": String(bytes.byteLength),
        },
        body: JSON.stringify(metadata),
      },
    );
    if (!initRes.ok) {
      const t = await initRes.text();
      return json({ error: "YouTube init failed", details: t }, 502);
    }
    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) return json({ error: "YouTube did not return an upload URL" }, 502);

    const upRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "video/mp4", "Content-Length": String(bytes.byteLength) },
      body: bytes,
    });
    const upJson = await upRes.json();
    if (!upRes.ok || !upJson.id) {
      await admin.from("playground_videos").update({ youtube_status: "failed", error: JSON.stringify(upJson).slice(0, 500) }).eq("id", id);
      return json({ error: "YouTube upload failed", details: upJson }, 502);
    }

    const ytUrl = `https://youtu.be/${upJson.id}`;
    await admin
      .from("playground_videos")
      .update({ youtube_video_id: upJson.id, youtube_url: ytUrl, youtube_status: "uploaded" })
      .eq("id", id);

    return json({ youtube_video_id: upJson.id, youtube_url: ytUrl });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
