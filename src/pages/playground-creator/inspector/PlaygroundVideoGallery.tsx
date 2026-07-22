import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type VideoRow = {
  id: string;
  prompt: string;
  status: string;
  storage_path: string | null;
  video_url: string | null;
  source_image_url: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  youtube_status: string | null;
  lesson_id: string | null;
  created_at: string;
};

type Props = {
  /** Filter the gallery to a single lesson. Omit to show the whole workspace. */
  lessonId?: string;
  /** Called when the user clicks "Use" on a ready clip. */
  onPick?: (url: string) => void;
};

/** Workspace gallery of generated playground videos. Lets the user reuse,
 *  regenerate, copy embed code, and publish clips to YouTube. */
export function PlaygroundVideoGallery({ lessonId, onPick }: Props) {
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    let q = supabase
      .from("playground_videos")
      .select("id, prompt, status, storage_path, video_url, source_image_url, youtube_url, youtube_video_id, youtube_status, lesson_id, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    if (lessonId) q = q.eq("lesson_id", lessonId);
    const { data } = await q;
    const list = (data ?? []) as VideoRow[];
    setRows(list);
    const map: Record<string, string> = {};
    for (const r of list) {
      if (r.status === "ready" && r.storage_path) {
        const s = await supabase.storage.from("playground-videos").createSignedUrl(r.storage_path, 60 * 60 * 6);
        if (s.data?.signedUrl) map[r.id] = s.data.signedUrl;
      }
    }
    setSigned(map);
    setBusy(false);
  }, [lessonId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-poll while any clip is still rendering so freshly generated videos
  // appear without the user having to click Refresh.
  useEffect(() => {
    const hasPending = rows.some((r) => r.status === "rendering" || r.status === "queued" || r.status === "pending");
    if (!hasPending) return;
    const t = setInterval(() => { refresh(); }, 6000);
    return () => clearInterval(t);
  }, [rows, refresh]);

  const publish = async (id: string) => {
    const { data, error } = await supabase.functions.invoke("publish-video-to-youtube", {
      body: { id, privacy: "unlisted" },
    });
    if (error) { alert("Publish failed: " + error.message); return; }
    alert("Published: " + (data as { youtube_url?: string })?.youtube_url);
    refresh();
  };

  const regenerate = async (r: VideoRow) => {
    if (!confirm("Regenerate this clip with the same prompt?")) return;
    const { error } = await supabase.functions.invoke("generate-playground-video", {
      body: { prompt: r.prompt, image_url: r.source_image_url ?? undefined, lesson_id: r.lesson_id ?? lessonId },
    });
    if (error) { alert("Regenerate failed: " + error.message); return; }
    refresh();
  };

  const remove = async (r: VideoRow) => {
    if (!confirm("Delete this clip? This frees a slot against the per-lesson cap.")) return;
    if (r.storage_path) {
      await supabase.storage.from("playground-videos").remove([r.storage_path]).catch(() => {});
    }
    const { error } = await supabase.from("playground_videos").delete().eq("id", r.id);
    if (error) { alert("Delete failed: " + error.message); return; }
    refresh();
  };

  const copyEmbed = async (r: VideoRow) => {
    let snippet = "";
    if (r.youtube_video_id) {
      snippet = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${r.youtube_video_id}" title="lesson clip" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (signed[r.id]) {
      snippet = `<video src="${signed[r.id]}" controls playsinline style="max-width:100%"></video>`;
    } else {
      alert("No embeddable URL yet."); return;
    }
    try {
      await navigator.clipboard.writeText(snippet);
      alert("Embed code copied.");
    } catch {
      prompt("Copy this embed code:", snippet);
    }
  };

  const copyUrl = async (url: string) => {
    try { await navigator.clipboard.writeText(url); alert("URL copied."); }
    catch { prompt("Copy URL:", url); }
  };

  return (
    <div className="rounded-xl border border-orange-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-orange-900">
          🎞️ Video Gallery {lessonId ? <span className="text-[10px] font-normal text-orange-600">(this lesson)</span> : null}
        </h3>
        <button onClick={refresh} className="text-[11px] text-orange-700 underline">Refresh</button>
      </div>
      {busy && <p className="text-[11px] text-orange-600">Loading…</p>}
      {!busy && rows.length === 0 && <p className="text-[11px] text-orange-700">No videos yet.</p>}
      <div className="grid grid-cols-2 gap-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border border-orange-100 p-2">
            {signed[r.id] ? (
              <video src={signed[r.id]} controls className="mb-1 w-full rounded" />
            ) : (
              <div className="mb-1 grid h-24 place-items-center rounded bg-orange-50 text-[10px] text-orange-700">
                {r.status}
              </div>
            )}
            <p className="line-clamp-2 text-[10px] text-orange-900" title={r.prompt}>{r.prompt}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {signed[r.id] && onPick && (
                <button onClick={() => onPick(signed[r.id])} className="rounded bg-orange-100 px-2 py-0.5 text-[10px]">Use</button>
              )}
              <button onClick={() => regenerate(r)} className="rounded bg-amber-100 px-2 py-0.5 text-[10px]" title="Regenerate with the same prompt">↻</button>
              <button onClick={() => remove(r)} className="rounded bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700" title="Delete this clip">🗑</button>
              <button onClick={() => copyEmbed(r)} className="rounded bg-slate-100 px-2 py-0.5 text-[10px]" title="Copy embed code">&lt;/&gt;</button>
              {signed[r.id] && (
                <button onClick={() => copyUrl(signed[r.id])} className="rounded bg-slate-100 px-2 py-0.5 text-[10px]" title="Copy URL">URL</button>
              )}
              {r.status === "ready" && !r.youtube_url && (
                <button onClick={() => publish(r.id)} className="rounded bg-red-600 px-2 py-0.5 text-[10px] text-white">YT</button>
              )}
              {r.youtube_url && (
                <a href={r.youtube_url} target="_blank" rel="noreferrer" className="rounded bg-red-50 px-2 py-0.5 text-[10px] text-red-700 underline">▶</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
