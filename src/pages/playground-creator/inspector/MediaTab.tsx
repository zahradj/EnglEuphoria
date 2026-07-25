import { useEffect, useMemo, useRef, useState } from "react";
import { PlaygroundVideoGallery } from "./PlaygroundVideoGallery";

import { PLAYGROUND_CAST_PRESETS } from "@/constants/playgroundCastPresets";
import { classifyVocab, needsCharacter } from "@/media/vocabClassifier";

// Image styles removed — single house style is enforced server-side via Nano Banana Pro.
export const PLAYGROUND_IMAGE_STYLES = [
  { id: "default", label: "🍌 Nano Banana Pro (default)" },
] as const;

export type PlaygroundImageStyleId = (typeof PLAYGROUND_IMAGE_STYLES)[number]["id"];


import { usePlaygroundUnitMutators, usePlaygroundLesson } from "@/playground-blueprint/PlaygroundUnitContext";
import type { PlaygroundBlock, PlaygroundPage } from "@/playground-blueprint/types";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";
import { castLookGuide } from "@/playground-blueprint/derivePages";
import { supabaseUrl, supabaseAnonKey } from "@/integrations/supabase/client";

const SUPABASE_URL = supabaseUrl;
const SUPABASE_ANON_KEY = supabaseAnonKey;
const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

async function fetchFunctionBlob(functionName: string, body: Record<string, unknown>): Promise<Blob> {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  // Edge functions may return a JSON envelope instead of audio when the
  // upstream provider rejects (quota, insufficient credits, bad prompt).
  // Detect that BEFORE reading .blob() so we can surface a friendly
  // message instead of crashing the preview with an opaque error.
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || contentType.includes("application/json")) {
    const raw = await response.text().catch(() => "");
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch (_) {}
    const message =
      parsed?.message ||
      parsed?.details?.detail?.message ||
      parsed?.error ||
      raw ||
      `${functionName} failed (${response.status})`;
    throw new Error(message);
  }

  const blob = await response.blob();
  if (blob.size < 256) throw new Error(`${functionName} returned empty audio`);
  return blob;
}

type CharacterChoice = { id: string; name: string; visual_blueprint?: string };

/** "auto" = smart (let classifier decide), "none" = force no character. */
type CharacterPick = "auto" | "none" | string;

function buildCharacterOptions(
  starring?: { name: string; visual_blueprint: string } | null,
): CharacterChoice[] {
  const list: CharacterChoice[] = PLAYGROUND_CAST_PRESETS.map((c) => ({
    id: c.name,
    name: c.name,
    visual_blueprint: c.visual_blueprint,
  }));
  if (starring?.name && !list.some((c) => c.name.toLowerCase() === starring.name.toLowerCase())) {
    list.unshift({ id: starring.name, name: starring.name, visual_blueprint: starring.visual_blueprint });
  }
  return list;
}

/** Resolve the chosen pick + auto-classification into the payload character. */
function resolveCharacter(
  pick: CharacterPick,
  subject: string,
  options: CharacterChoice[],
  starring?: { name: string; visual_blueprint: string } | null,
  forceCharacter = false, // sentences/topic scenes
): { name: string; visual_blueprint?: string } | null {
  if (pick === "none") return null;
  if (pick !== "auto") {
    const hit = options.find((o) => o.id === pick);
    if (hit) return { name: hit.name, visual_blueprint: hit.visual_blueprint };
  }
  // auto
  const wantsChar = forceCharacter || needsCharacter(subject);
  if (!wantsChar) return null;
  if (starring?.name) return { name: starring.name, visual_blueprint: starring.visual_blueprint };
  const fallback = options[0];
  return fallback ? { name: fallback.name, visual_blueprint: fallback.visual_blueprint } : null;
}

type MediaBlock = Extract<PlaygroundBlock, { kind: "image" | "audio" | "music" | "video" }>;

/** Build a grounded video prompt from lesson context + story scene + cast lineup. */
function buildVideoPrompt(args: {
  base?: string;
  lesson?: {
    lesson_topic?: string;
    unit_topic?: string;
    vocab?: string[];
    story?: { scenes?: Array<{ text?: string; prompt?: string; setting?: string }> };
  } | any;
  starring?: { name: string; visual_blueprint?: string } | null;
}): string {
  const parts: string[] = [];
  const base = (args.base ?? "").trim();
  const objective = args.lesson?.lesson_topic ?? args.lesson?.unit_topic;
  const vocab = (args.lesson?.vocab ?? []).slice(0, 6).join(", ");
  const star = args.starring?.name;
  const scene = args.lesson?.story?.scenes?.[0];
  const sceneText = scene?.prompt || scene?.text;
  const setting = scene?.setting;
  if (base) parts.push(base);
  if (objective) parts.push(`Lesson topic: ${objective}.`);
  if (sceneText) parts.push(`Story scene: ${sceneText}.`);
  if (setting) parts.push(`Setting: ${setting}.`);
  if (vocab) parts.push(`Reinforce vocabulary: ${vocab}.`);
  if (star) parts.push(`Star character: ${star} (${args.starring?.visual_blueprint ?? "on-model"}), keep look consistent.`);
  const look = castLookGuide([star].filter(Boolean) as string[]);
  if (look) parts.push(look);
  parts.push("Short 5s playful kids storybook animation matching the story scene, warm cinematic lighting, gentle camera move, no on-screen text.");
  return parts.join(" ").slice(0, 800);
}


export function MediaTab({
  lessonNumber,
  page,
}: {
  lessonNumber: PlaygroundLessonNumber;
  page: PlaygroundPage;
}) {
  const { updatePage, updatePageAndVocabMedia, setLessonField } = usePlaygroundUnitMutators();
  const lesson = usePlaygroundLesson(lessonNumber);
  const starringCharacter = lesson?.starring_character ?? null;
  const phaseIdRaw = ((page as any).phase_id ?? "").toString().toLowerCase();
  const isWarmupPage =
    phaseIdRaw.includes("warm") || phaseIdRaw.includes("chant") || phaseIdRaw.includes("song");
  const media = page.blocks.filter((b): b is MediaBlock => {
    if (!["image", "audio", "music", "video"].includes(b.kind)) return false;
    // Warm-up pages: drop the TTS `audio` slot ("Warm-up song") — the `music`
    // block ("Warm-up music") sings the lyrics and replaces it.
    if (isWarmupPage && b.kind === "audio") return false;
    return true;
  });
  const hasVideoBlock = media.some((b) => b.kind === "video");
  const lessonIdForCap = (lesson as any)?.id ?? (lesson as any)?.lesson_id ?? null;
  const VIDEO_CAP = 3;
  const [videoUsed, setVideoUsed] = useState<number | null>(null);
  useEffect(() => {
    if (!hasVideoBlock || !lessonIdForCap) { setVideoUsed(null); return; }
    let cancelled = false;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { count } = await supabase
        .from("playground_videos")
        .select("id", { count: "exact", head: true })
        .eq("lesson_id", lessonIdForCap);
      if (!cancelled) setVideoUsed(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [hasVideoBlock, lessonIdForCap, page.blocks.length]);

  const patchBlock = (
    id: string,
    patch: Partial<MediaBlock>,
    vocabPatch?: { word: string; media: { imageUrl?: string; audioUrl?: string } },
  ) => {
    const blocks = page.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as PlaygroundBlock) : b));
    if (vocabPatch && updatePageAndVocabMedia) {
      updatePageAndVocabMedia(lessonNumber, page.id, { blocks }, vocabPatch);
      return;
    }
    updatePage?.(lessonNumber, page.id, { blocks });
  };

  return (
    <div className="space-y-3">
      <TopicImageGenerator
        lessonNumber={lessonNumber}
        lesson={lesson}
        starringCharacter={starringCharacter}
        onGenerated={(url) => setLessonField?.(lessonNumber, { cover_image: url } as any)}
      />

      {hasVideoBlock && videoUsed !== null && (
        <div className={`rounded-md px-2 py-1 text-[11px] font-semibold ${videoUsed >= VIDEO_CAP ? "bg-rose-100 text-rose-700" : "bg-orange-50 text-orange-800"}`}>
          🎞️ Video renders: {videoUsed}/{VIDEO_CAP} for this lesson
          {videoUsed >= VIDEO_CAP && " — cap reached, reuse or delete a clip from the gallery below."}
        </div>
      )}
      {media.length === 0 ? (
        <p className="text-xs text-orange-700">No media slots on this page yet.</p>
      ) : (
        media.map((b) => (
        <MediaSlot
          key={b.id}
          block={b}
          lesson={lesson}
          starringCharacter={starringCharacter}
          phaseId={(page as any).phase_id}
          pageBlocks={page.blocks as any[]}
          pagePosterUrl={
            (page.blocks.find((x): x is Extract<PlaygroundBlock, { kind: "image" }> =>
              x.kind === "image" && Boolean((x as any).url),
            ) as any)?.url
          }
          onChange={(patch) => {
            // Mirror image URLs into lesson.vocab_media so the live
            // vocabulary card / lesson preview pick them up. This must be
            // atomic with the page patch; two separate context writes can race
            // and make the media-side image appear to never generate.
            let vocabPatch: { word: string; media: { imageUrl?: string; audioUrl?: string } } | undefined;
            if (b.kind === "image" && patch && (patch as { url?: string }).url) {
              const word = (b.subject || b.label || "").trim();
              if (word) vocabPatch = { word, media: { imageUrl: (patch as { url?: string }).url } };
            }
            if (b.kind === "audio" && patch && (patch as { url?: string }).url) {
              const word = (b.text || b.label || "").trim();
              if (word) vocabPatch = { word, media: { audioUrl: (patch as { url?: string }).url } };
            }
            patchBlock(b.id, patch, vocabPatch);
          }}
        />
        ))
      )}
      <PlaygroundVideoGallery
        lessonId={(lesson as any)?.id ?? (lesson as any)?.lesson_id}
        onPick={(url) => {
          // Reuse an existing clip into a video block on this page instead of
          // paying for a fresh render. Prefer the first empty video slot; fall
          // back to the last video block.
          const videoBlocks = page.blocks.filter((b): b is Extract<PlaygroundBlock, { kind: "video" }> => b.kind === "video");
          const target = videoBlocks.find((b) => !(b as any).url) ?? videoBlocks[videoBlocks.length - 1];
          if (!target) { alert("No video block on this page to attach the clip to."); return; }
          patchBlock(target.id, { url, video_status: "ready" } as Partial<MediaBlock>);
        }}
      />
    </div>
  );
}

export function MediaSlot({
  block,
  onChange,
  starringCharacter,
  lesson,
  phaseId,
  pageBlocks,
  pagePosterUrl,
}: {
  block: MediaBlock;
  onChange: (patch: Partial<MediaBlock>) => void;
  starringCharacter?: { name: string; visual_blueprint: string } | null;
  lesson?: { lesson_topic?: string; unit_topic?: string; vocab?: string[]; grammar?: string } | any;
  phaseId?: string;
  pageBlocks?: any[];
  pagePosterUrl?: string;
}) {

  const [busy, setBusy] = useState(false);
  const [styleId, setStyleId] = useState<PlaygroundImageStyleId>("default");
  const [characterPick, setCharacterPick] = useState<CharacterPick>("auto");
  // Optional second character — when set, the edge fn always renders a
  // two-character scene (not just for greetings/dialogue vocab).
  const [companionPick, setCompanionPick] = useState<string>("none");
  const characterOptions = useMemo(
    () => buildCharacterOptions(starringCharacter),
    [starringCharacter],
  );

  const generate = async () => {
    setBusy(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      if (block.kind === "image") {
        const subjectBase = (block.subject || block.label || "playground item").trim();
        const extra = (block.prompt || "").trim();

        const wordCount = subjectBase.split(/\s+/).filter(Boolean).length;
        const isScene = /[.!?]/.test(subjectBase) || wordCount > 3;
        const kind = classifyVocab(subjectBase); // object | action | expression | abstract

        // Smart character resolution: objects render alone; actions/expressions
        // get a Playground cast hero. User can force via picker.
        const resolved = resolveCharacter(
          characterPick,
          subjectBase,
          characterOptions,
          starringCharacter,
          isScene,
        );

        const subjectClause = isScene
          ? `Show one clear scene that visually conveys the sentence meaning of "${subjectBase}" so a 4–7 year old understands it without text.`
          : kind === "object"
          ? `Show exactly one literal "${subjectBase}" as the hero subject — render the real ${subjectBase}, not a mascot version. No characters, no companions, no extra props.`
          : `Show the Playground character ${resolved?.name ?? "mascot"} clearly ${kind === "action" ? "doing the action" : "expressing the feeling"} "${subjectBase}". One subject only; the character IS how the concept is shown.`;

        const characterClause = resolved
          ? `Featured character: ${resolved.name}. Visual blueprint (keep on-model): ${resolved.visual_blueprint ?? resolved.name}.`
          : `No mascot, character, animal friend, person, or sidekick — only the literal subject.`;

        const styleClause =
          `Quality: premium finished classroom-ready illustration, crisp anti-aliased edges, clean confident linework, smooth color fills, strong readable silhouette, balanced centered composition, rich controlled colors, simple uncluttered background. Follow the selected style exactly. Strictly NO blurry areas, NO muddy colors, NO warped anatomy, NO distorted faces, NO messy sketch lines, NO pixelation, NO artifacts, NO text.`;

        const prompt = [
          `Educational illustration for an English-learning Playground lesson.`,
          `Concept to teach: "${subjectBase}" (type: ${kind}).`,
          subjectClause,
          characterClause,
          styleClause,
          extra ? `Additional direction: ${extra}.` : "",
          `Absolutely no text, letters, numbers, watermarks, or logos in the image.`,
        ].filter(Boolean).join(" ");

        const transparent = !isScene;
        // Resolve optional companion (must differ from lead).
        const companion = companionPick !== "none"
          ? characterOptions.find((c) => c.id === companionPick && c.name !== resolved?.name) ?? null
          : null;
        // If we already rendered an image for this slot, this click is a
        // "Regenerate" — pass a nonce to bust the server-side image cache so
        // the model produces a brand-new result instead of returning the
        // previously cached file.
        const regenNonce = block.url ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : undefined;
        // Lyric/warm-up overlay opt-in (set by derivePages for the warm-up card).
        const allowText = Boolean((block as any).allowText);
        const textOverlay = typeof (block as any).textOverlay === "string"
          ? (block as any).textOverlay
          : undefined;
        // Structured pedagogy payload — phase + theme + objective + vocab +
        // grammar so the Image Generator consumes explicit instructional
        // intent instead of inferring it from the subject alone.
        const phaseRaw = (phaseId ?? "").toLowerCase();
        const phase =
          phaseRaw.includes("intro") ? "intro"
          : phaseRaw.includes("warm") ? "warmup"
          : phaseRaw.includes("vocab") ? "vocabulary"
          : phaseRaw.includes("grammar") || phaseRaw.includes("model") ? "grammar"
          : phaseRaw.includes("story") ? "storybook"
          : phaseRaw.includes("phonic") ? "phonics"
          : phaseRaw.includes("review") || phaseRaw.includes("summary") ? "review"
          : phaseRaw || (isScene ? "storybook" : "vocabulary");
        const pedagogy = {
          phase,
          unit_theme: (lesson as any)?.unit_topic ?? undefined,
          lesson_objective: (lesson as any)?.lesson_topic ?? (lesson as any)?.objective ?? undefined,
          target_vocabulary: Array.isArray((lesson as any)?.vocab) ? (lesson as any).vocab.slice(0, 8) : undefined,
          grammar_target: (lesson as any)?.grammar ?? undefined,
          visual_style: transparent ? "sticker" : "scene",
          cefr: (lesson as any)?.cefr ?? undefined,
          age_group: "4-9",
        };
        const { data, error } = await supabase.functions.invoke("generate-playground-images", {
          body: {
            style: styleId,
            subjects: [{
              text: subjectBase,
              prompt,
              transparent: allowText ? false : transparent,
              kind: "vocabulary",
              style: styleId,
              character: resolved
                ? { name: resolved.name, visual_blueprint: resolved.visual_blueprint }
                : null,
              companion: companion
                ? { name: companion.name, visual: companion.visual_blueprint ?? companion.name }
                : null,
              nonce: regenNonce,
              allowText,
              textOverlay,
              pedagogy,
            }],
          },
        });
        if (error) throw error;
        const url = (data as { images?: { url?: string }[] })?.images?.[0]?.url;
        if (!url) throw new Error("No image returned");
        onChange({ url } as Partial<MediaBlock>);

      } else if (block.kind === "audio") {
        const text = block.text || block.label || "";
        if (!text) throw new Error("Add text to speak first");
        const blob = await fetchFunctionBlob("generate-elevenlabs-audio", { text });
        const url = URL.createObjectURL(blob);
        onChange({ url } as Partial<MediaBlock>);
      } else if (block.kind === "music") {
        // Playground songs must ALWAYS sound like kids: playful, cheerful,
        // sung by a small children's choir. For the warm-up card we also feed
        // the on-screen lyrics so ElevenLabs sings the same words the kids
        // read on the poster, instead of a generic instrumental.
        const phaseRaw = (phaseId ?? "").toLowerCase();
        const isWarmup =
          phaseRaw.includes("warm") || phaseRaw.includes("chant") || phaseRaw.includes("song");
        // Source of truth for the lyrics = the SAME text that gets rendered on
        // the warm-up poster image (block.textOverlay). Fall back to the
        // lyrics_card block, then any local text/value the music block itself
        // carries. This guarantees the sung lyrics match the poster lyrics.
        const posterBlock = (pageBlocks ?? []).find(
          (x) => x?.kind === "image" && typeof x?.textOverlay === "string" && x.textOverlay.trim(),
        );
        const lyricsBlock = (pageBlocks ?? []).find(
          (x) => x?.kind === "lyrics_card" || x?.kind === "lyrics",
        );
        const lyricsSource: string =
          (posterBlock?.textOverlay as string | undefined) ??
          (typeof lyricsBlock?.value === "string" ? lyricsBlock.value : "") ??
          "";
        const lyricsLines: string[] = lyricsSource
          ? lyricsSource.split("\n").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(lyricsBlock?.lines)
            ? lyricsBlock.lines.map((l: any) => (typeof l === "string" ? l : l?.text)).filter(Boolean)
            : [];
        const mood = block.mood || "playful cheerful upbeat";
        const kidsStyle =
          "Sung by a small children's choir (ages 5–8), bright cheerful playful kids voices, nursery-rhyme style, simple bouncy melody, ukulele + hand claps + light xylophone, family-friendly, no adult vocals, no rap, no dark tones";
        const duration = block.durationSec ?? 20;
        // When we have on-screen lyrics, force ElevenLabs to sing them verbatim
        // via a composition_plan (the free-text `prompt` field only steers style
        // and lets the model paraphrase — that's why the audio didn't match the
        // poster). One section carrying the exact lines does the job.
        const useComposition = isWarmup && lyricsLines.length > 0;
        const payload: Record<string, unknown> = useComposition
          ? {
              prompt: `${kidsStyle}. Mood: ${mood}.`,
              duration,
              force_instrumental: false,
              composition_plan: {
                positive_global_styles: [
                  "children's choir",
                  "kids voices",
                  "playful",
                  "cheerful",
                  "nursery rhyme",
                  "ukulele",
                  "hand claps",
                  "xylophone",
                  mood,
                ],
                negative_global_styles: [
                  "adult vocals",
                  "rap",
                  "dark",
                  "aggressive",
                  "instrumental only",
                ],
                sections: [
                  {
                    section_name: "Sing-along",
                    positive_local_styles: ["children's choir", "playful", "clear diction"],
                    negative_local_styles: ["mumbling", "adult vocals"],
                    duration_ms: duration * 1000,
                    lines: lyricsLines,
                  },
                ],
              },
            }
          : {
              prompt: `${kidsStyle}. Mood: ${mood}.`,
              duration,
              force_instrumental: false,
            };
        const blob = await fetchFunctionBlob("elevenlabs-music", payload);
        const url = URL.createObjectURL(blob);
        onChange({ url } as Partial<MediaBlock>);
      } else if (block.kind === "video") {
        // Cost guardrail: cap video generations per lesson (FAL/PixVerse are
        // the priciest calls in the pipeline). Existing "ready" clips reuse
        // freely; only fresh renders count against the cap.
        const VIDEO_CAP_PER_LESSON = 3;
        const lessonIdForCap = (lesson as any)?.id ?? (lesson as any)?.lesson_id ?? null;
        if (lessonIdForCap) {
          const { count } = await supabase
            .from("playground_videos")
            .select("id", { count: "exact", head: true })
            .eq("lesson_id", lessonIdForCap);
          if ((count ?? 0) >= VIDEO_CAP_PER_LESSON) {
            throw new Error(`Video generation cap reached for this lesson (${VIDEO_CAP_PER_LESSON}). Reuse an existing clip from the gallery or delete one first.`);
          }
        }

        const autoPrompt = buildVideoPrompt({
          base: (block as { prompt?: string }).prompt || block.label,
          lesson,
          starring: starringCharacter,
        });

        const provider = ((block as any).video_provider as "gemini" | "pixverse" | undefined) ?? "gemini";

        if (provider === "pixverse") {
          const { data, error } = await supabase.functions.invoke("generate-video-pixverse", {
            body: {
              prompt: autoPrompt,
              duration: 5,
              quality: "540p",
              aspect_ratio: "16:9",
            },
          });
          if (error) throw error;
          const videoId = (data as any)?.resp?.video_id ?? (data as any)?.video_id;
          if (!videoId) throw new Error("No PixVerse video_id returned: " + JSON.stringify(data));
          onChange({ prompt: autoPrompt, url: undefined, video_job_id: String(videoId), video_status: "rendering", video_provider: "pixverse" } as any);
          let attempts = 0;
          const poll = async () => {
            attempts++;
            const { data: pd, error: pe } = await supabase.functions.invoke("generate-video-pixverse", {
              body: { action: "status", video_id: videoId },
            });
            if (pe) {
              console.warn("[pixverse] poll error", pe);
              if (attempts >= 5) {
                onChange({ video_status: "failed" } as any);
                alert("PixVerse polling failed: " + (pe.message ?? "unknown"));
                return;
              }
              if (attempts < 120) setTimeout(poll, 8000);
              return;
            }
            const resp = (pd as any)?.resp ?? pd;
            // PixVerse: status 1=queued, 2=processing, 3=failed?, 5=completed (varies). Use url presence as ready signal.
            const url = resp?.url ?? resp?.video_url;
            const s = resp?.status;
            if (url) {
              onChange({ url, video_status: "ready" } as any);
              return;
            }
            if (s === 3 || s === "failed" || s === 4) {
              onChange({ video_status: "failed" } as any);
              alert("PixVerse generation failed: " + JSON.stringify(resp));
              return;
            }
            if (attempts < 120) setTimeout(poll, attempts < 5 ? 5000 : 8000);
          };
          setTimeout(poll, 5000);
        } else {
          const imageUrl = (block as { posterUrl?: string; image_url?: string }).posterUrl
            ?? (block as { image_url?: string }).image_url
            ?? pagePosterUrl;
          const { data, error } = await supabase.functions.invoke("generate-playground-video", {
            body: { prompt: autoPrompt, image_url: imageUrl, lesson_id: lessonIdForCap ?? undefined },
          });
          if (error) {
            // supabase-js swallows the response body on non-2xx — read it so
            // we surface the real reason (e.g. missing FAL_KEY, FAL 4xx, quota).
            let detail = error.message;
            try {
              const resp = (error as any)?.context?.response;
              if (resp) {
                const body = await resp.clone().text();
                if (body) detail = body;
              }
            } catch { /* ignore */ }
            throw new Error(detail);
          }
          const videoId = (data as { id?: string })?.id;
          if (!videoId) throw new Error("No video job id returned");
          onChange({ prompt: autoPrompt, url: undefined, video_job_id: videoId, video_status: "rendering", video_provider: "gemini" } as any);
          let attempts = 0;
          const poll = async () => {
            attempts++;
            const { data: pd, error: pe } = await supabase.functions.invoke("poll-playground-video", { body: { id: videoId } });
            if (pe) { console.warn(pe); return; }
            const row = pd as { status?: string; signed_url?: string; video_url?: string; error?: string };
            if (row?.status === "ready") {
              onChange({ url: row.signed_url ?? row.video_url, video_status: "ready" } as any);
              return;
            }
            if (row?.status === "failed") {
              onChange({ video_status: "failed" } as any);
              alert("Video generation failed: " + (row.error ?? "unknown"));
              return;
            }
            if (attempts < 120) setTimeout(poll, attempts < 5 ? 4000 : 6000);
          };
          setTimeout(poll, 4000);
        }
      }


    } catch (e: any) {
      console.error("[MediaSlot] generate failed", e);
      alert("Generation failed: " + (e?.message ?? "unknown error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-orange-200 bg-white p-2">
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-orange-900">
        <span className="capitalize">{block.kind} · {block.label ?? block.id.split(".").pop()}</span>
        <button
          onClick={generate}
          disabled={busy}
          className="rounded-full bg-[#FE6A2F] px-2 py-0.5 text-[10px] font-bold text-white disabled:opacity-50"
          title={block.kind === "video" ? "Generate a short scene clip via AI" : "Generate via AI"}
        >

          {busy ? "…" : (block as any).url ? "Regenerate" : "Generate"}
        </button>
      </div>
      {block.kind === "image" && (
        <>
          {block.url ? (
            <img src={block.url} alt={block.subject} className="mb-2 h-80 w-full rounded-xl object-contain bg-orange-50/40 ring-1 ring-orange-100" />
          ) : (
            <div className="mb-2 grid h-80 place-items-center rounded-xl bg-orange-50 text-xs text-orange-700">

              no image yet
            </div>
          )}
          <input
            value={block.subject}
            onChange={(e) => onChange({ subject: e.target.value } as Partial<MediaBlock>)}
            placeholder="Subject (e.g. red apple)"
            className="w-full rounded-md border border-orange-200 px-2 py-1 text-xs"
          />
          {/* style selector removed — single Nano Banana Pro house style */}

          <select
            value={characterPick}
            onChange={(e) => setCharacterPick(e.target.value as CharacterPick)}
            className="mt-1 w-full rounded-md border border-orange-200 bg-white px-2 py-1 text-xs"
            title="Featured character"
          >
            <option value="auto">🧠 Auto — smart (objects alone, actions with cast)</option>
            <option value="none">🚫 No character — literal subject only</option>
            {characterOptions.map((c) => (
              <option key={c.id} value={c.id}>🎭 {c.name}</option>
            ))}
          </select>
          <select
            value={companionPick}
            onChange={(e) => setCompanionPick(e.target.value)}
            className="mt-1 w-full rounded-md border border-orange-200 bg-white px-2 py-1 text-xs"
            title="Optional companion (forces two-character scene)"
          >
            <option value="none">➕ Add companion — none</option>
            {characterOptions.map((c) => (
              <option key={c.id} value={c.id}>🤝 with {c.name}</option>
            ))}
          </select>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-800 ring-1 ring-orange-200">
            🍌 Powered by Nano Banana Pro
          </div>
          <p className="mt-1 text-[10px] text-orange-700">
            Auto detects: object → render the thing; action/feeling → render the cast member doing it. Add a companion to force a two-character scene.
          </p>

        </>
      )}

      {block.kind === "audio" && (
        <>
          {block.url && <audio src={block.url} controls className="mb-1 w-full" />}
          <input
            value={block.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value } as Partial<MediaBlock>)}
            placeholder="Text to speak"
            className="w-full rounded-md border border-orange-200 px-2 py-1 text-xs"
          />
        </>
      )}
      {block.kind === "music" && (
        <>
          {block.url && <audio src={block.url} controls className="mb-1 w-full" />}
          <input
            value={block.mood}
            onChange={(e) => onChange({ mood: e.target.value } as Partial<MediaBlock>)}
            placeholder="Mood (e.g. happy upbeat)"
            className="w-full rounded-md border border-orange-200 px-2 py-1 text-xs"
          />
        </>
      )}
      {block.kind === "video" && (
        <>
          {(() => {
            const status = (block as any).video_status as string | undefined;
            if (status === "rendering") {
              return (
                <div className="mb-1 grid h-32 place-items-center rounded-lg bg-orange-50 text-[11px] text-orange-700">
                  <div className="flex flex-col items-center gap-1">
                    <span className="animate-pulse">🎬 Rendering… 1–3 min</span>
                    <span className="text-[10px] opacity-70">You can keep editing — it'll appear here.</span>
                  </div>
                </div>
              );
            }
            if (status === "failed") {
              return (
                <div className="mb-1 grid h-32 place-items-center rounded-lg bg-red-50 text-[11px] text-red-700">
                  Generation failed. Click Generate to retry.
                </div>
              );
            }
            if (block.url) {
              return /\.(mp4|webm|mov)(\?|$)/i.test(block.url) ? (
                <video src={block.url} controls className="mb-1 w-full rounded-lg" />
              ) : (
                <a href={block.url} target="_blank" rel="noreferrer" className="mb-1 block truncate text-[11px] text-orange-700 underline">
                  {block.url}
                </a>
              );
            }
            return (
              <div className="mb-1 grid h-32 place-items-center rounded-lg bg-orange-50 text-[11px] text-orange-700">
                no video yet — click Generate
              </div>
            );
          })()}
          <div className="mb-1 flex items-center gap-1 text-[10px] text-orange-900">
            <span className="font-semibold">Engine:</span>
            <select
              value={((block as any).video_provider as string) ?? "gemini"}
              onChange={(e) => onChange({ video_provider: e.target.value } as any)}
              className="rounded-md border border-orange-200 bg-white px-1 py-0.5 text-[10px]"
            >
              <option value="gemini">Gemini (Veo)</option>
              <option value="pixverse">PixVerse v3.5</option>
            </select>
          </div>
          <input
            value={(block as { prompt?: string }).prompt ?? ""}
            onChange={(e) => onChange({ prompt: e.target.value } as Partial<MediaBlock>)}
            placeholder="Scene prompt (auto-built from lesson if blank)"
            className="mb-1 w-full rounded-md border border-orange-200 px-2 py-1 text-xs"
          />
          <input
            value={block.url ?? ""}
            onChange={(e) => onChange({ url: e.target.value } as Partial<MediaBlock>)}
            placeholder="…or paste a YouTube / mp4 URL"
            className="w-full rounded-md border border-orange-200 px-2 py-1 text-xs"
          />
          {(block as any).video_job_id && (block as any).video_status === "ready" && (
            <button
              onClick={async () => {
                const { supabase } = await import("@/integrations/supabase/client");
                const { data, error } = await supabase.functions.invoke("publish-video-to-youtube", {
                  body: { id: (block as any).video_job_id, privacy: "unlisted" },
                });
                if (error) { alert("Publish failed: " + error.message); return; }
                const yt = (data as { youtube_url?: string })?.youtube_url;
                if (yt) { onChange({ youtube_url: yt } as any); alert("Published to YouTube: " + yt); }
              }}
              className="mt-1 w-full rounded-md bg-red-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-red-700"
            >
              📺 Publish to YouTube (unlisted)
            </button>
          )}
          {(block as any).youtube_url && (
            <a href={(block as any).youtube_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[11px] text-red-700 underline">
              ▶ {(block as any).youtube_url}
            </a>
          )}
          <p className="mt-1 text-[10px] text-orange-700">
            🎬 ~5s clip via Replicate. Saved to your workspace gallery. Auto-publishable to YouTube.
          </p>
        </>
      )}


    </div>
  );
}

function buildTopicScenario(topic: string): string {
  const t = (topic || "").toLowerCase().trim();
  if (!t) return "A cheerful playground moment introducing today's topic.";
  const rules: { match: RegExp; scenario: string }[] = [
    { match: /(farm|animal)/, scenario: `a sunny farmyard where friendly animals gather at a wooden fence to greet the learner and introduce "${topic}"` },
    { match: /(color|colour)/, scenario: `a rainbow paint splash on a meadow with buckets of bright paint spelling out "${topic}"` },
    { match: /(number|count|math)/, scenario: `stacked toy blocks and counting bubbles floating around a hero holding up fingers for "${topic}"` },
    { match: /(food|fruit|vegetable|meal|eat)/, scenario: `a colorful picnic table piled with fresh foods representing "${topic}"` },
    { match: /(family|mother|father|sister|brother)/, scenario: `a cozy living-room scene with a warm family gathered on a rug learning "${topic}"` },
    { match: /(body|face|head|hand)/, scenario: `a cheerful hero pointing at labeled-free body parts in a bright gym setting for "${topic}"` },
    { match: /(shape|circle|square|triangle|rectangle|star)/, scenario: `bright geometric shapes (circle, square, triangle, star) floating on a sunny playground while a hero points at them to introduce "${topic}"` },
    { match: /(weather|rain|sun|snow|wind)/, scenario: `an outdoor sky scene showing the weather condition of "${topic}"` },
    { match: /(school|class|classroom|learn)/, scenario: `a bright classroom with open books and friendly desks introducing "${topic}"` },
    { match: /(greet|hello|hi\b|goodbye|introduc|meet)/, scenario: `the hero character stands in the very center of the frame, smiling warmly and waving one hand high in a friendly hello, with a soft sunlit playground behind them — a clear, iconic "greetings and introductions" moment` },
    { match: /(clothes|wear|shirt|hat)/, scenario: `a dress-up closet with clothes floating out onto a happy hero showing "${topic}"` },
    { match: /(house|home|room)/, scenario: `a cutaway cozy house showing the rooms and objects that represent "${topic}"` },
    { match: /(transport|car|bus|plane|bike)/, scenario: `a busy little town with vehicles rolling along a curvy road illustrating "${topic}"` },
  ];
  for (const r of rules) if (r.match.test(t)) return r.scenario + ".";
  return `a bright, kid-friendly playground scene that acts out "${topic}" with clear props and a happy hero.`;
}

function TopicImageGenerator({
  lessonNumber,
  lesson,
  starringCharacter,
  onGenerated,
}: {
  lessonNumber: PlaygroundLessonNumber;
  lesson: { cover_image?: string; lesson_topic?: string; unit_topic?: string } | any;
  starringCharacter?: { name: string; visual_blueprint: string } | null;
  onGenerated: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [styleId, setStyleId] = useState<PlaygroundImageStyleId>("default");
  const [characterPick, setCharacterPick] = useState<CharacterPick>("auto");
  const characterOptions = useMemo(
    () => buildCharacterOptions(starringCharacter),
    [starringCharacter],
  );
  const lessonTopic = ((lesson?.lesson_topic || lesson?.unit_topic || "") as string).trim();
  const [subject, setSubject] = useState<string>(lessonTopic || "lesson topic");
  // Keep subject in sync when the lesson topic changes (e.g. switching lessons).
  useEffect(() => {
    if (lessonTopic) setSubject(lessonTopic);
  }, [lessonTopic]);
  const scenario = useMemo(() => buildTopicScenario(lessonTopic || subject), [lessonTopic, subject]);
  const cover = lesson?.cover_image as string | undefined;

  const [errMsg, setErrMsg] = useState<string | null>(null);

  const vocabAll: string[] = useMemo(
    () => (Array.isArray((lesson as any)?.vocab) ? ((lesson as any).vocab as string[]).filter(Boolean) : []),
    [lesson],
  );

  const generate = async (override?: { subject?: string; characterPick?: CharacterPick }) => {
    setBusy(true);
    setErrMsg(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const subj = (override?.subject ?? subject).trim() || "lesson topic";
      const pick = override?.characterPick ?? characterPick;
      const resolved = resolveCharacter(pick, subj, characterOptions, starringCharacter, true);
      const vocab = vocabAll.slice(0, 2);
      const anchors = vocab.length ? vocab.join(" and ") : subj;

      const prompt = [
        `Playground lesson intro card for "${subj}". ${scenario} Feature ${anchors} as the recognizable anchor of the composition so a 4–7 year old identifies the topic in under 2 seconds.`,
        resolved
          ? `Lead: ${resolved.name} (${resolved.visual_blueprint ?? resolved.name}), on-model, warmly interacting with the ${anchors}.`
          : `No character — depict the ${anchors} literally as the hero subject.`,
        `Full-bleed illustrated BACKGROUND is mandatory: paint a complete environment behind the subject (sky, ground, walls, props matching the topic) — edge-to-edge color, NO white background, NO empty/blank background, NO transparent background, NO isolated cutout, NO plain solid color, NO studio backdrop. The subject must sit inside a real scene.`,
        `STYLE: Kawaii Comic Cartoon, thick clean outlines, flat warm palette (orange/yellow), child-safe, expressive faces.`,
        `SINGLE PANEL, no diptych, no grid, no collage. NO TEXT, NO SPEECH BUBBLES, NO LETTERS, NO WATERMARK, NO UI CHROME, NO SOFTWARE EDITING BACKGROUND, NO CHECKERBOARD, NO COLOR PICKER, NO TOOLBAR, NO PHOTOSHOP/CANVA ARTIFACTS. Clean illustrated background only.`,
      ].join(" ");

      const regenNonce = `${lessonNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const { data, error } = await supabase.functions.invoke("generate-playground-images", {
        body: {
          style: styleId,
          subjects: [{
            text: subj,
            prompt,
            transparent: false,
            kind: "topic",
            style: styleId,
            allowText: false,
            character: resolved
              ? { name: resolved.name, visual_blueprint: resolved.visual_blueprint }
              : null,
            nonce: regenNonce,
            pedagogy: {
              phase: "intro",
              unit_theme: (lesson as any)?.unit_topic ?? undefined,
              lesson_objective: subj,
              target_vocabulary: vocab.length ? vocab : undefined,
              grammar_target: (lesson as any)?.grammar ?? undefined,
              visual_style: "scene",
              cefr: (lesson as any)?.cefr ?? undefined,
              age_group: "4-9",
            },
          }],
        },
      });
      if (error) throw error;
      const url = (data as { images?: { url?: string }[] })?.images?.[0]?.url;
      if (!url) throw new Error("No image returned");
      onGenerated(url);
    } catch (e: any) {
      console.error("[TopicImageGenerator] failed", e);
      setErrMsg(e?.message ?? "unknown error");
    } finally {
      setBusy(false);
    }
  };

  const autoTriedRef = useRef<string | null>(null);
  useEffect(() => {
    const title = (lesson?.lesson_topic || lesson?.unit_topic || "").toString().trim();
    if (!title || cover || busy) return;
    const key = `${lessonNumber}::${title}`;
    if (autoTriedRef.current === key) return;
    autoTriedRef.current = key;
    void generate({ subject: title, characterPick: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonNumber, lesson?.lesson_topic, lesson?.unit_topic, cover]);

  const anchorPreview = vocabAll.slice(0, 2);

  return (
    <div className="rounded-xl border-2 border-dashed border-orange-300 bg-[#FFF8E7] p-2">
      <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-orange-900">
        <span>🎯 Lesson Intro · Topic image</span>
        <button
          onClick={() => generate()}
          disabled={busy}
          className="rounded-full bg-[#FE6A2F] px-2 py-0.5 text-[10px] font-bold text-white disabled:opacity-50"
        >
          {busy ? "Generating…" : cover ? "Regenerate" : "Generate"}
        </button>
      </div>
      {cover ? (
        <div className="relative mb-1">
          <img
            src={cover}
            alt={subject}
            className={`h-28 w-full rounded-lg object-cover transition-opacity ${busy ? "opacity-40" : ""}`}
          />
          {busy && (
            <div className="absolute inset-0 grid place-items-center rounded-lg bg-white/60 text-[10px] font-bold text-orange-700">
              ✨ regenerating…
            </div>
          )}
        </div>
      ) : (
        <div className="mb-1 grid h-28 w-full animate-pulse place-items-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 text-[10px] font-semibold text-orange-700">
          {busy ? "🎨 painting your topic…" : "no topic image yet"}
        </div>
      )}

      <div className="rounded-md border border-orange-200 bg-white px-2 py-1 text-xs">
        <div className="text-[9px] font-bold uppercase tracking-wide text-orange-600">Lesson topic</div>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-transparent font-semibold text-orange-900 outline-none placeholder:text-orange-300"
          placeholder="Type or edit the topic…"
        />
      </div>

      {anchorPreview.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {anchorPreview.map((v) => (
            <span
              key={v}
              className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800 ring-1 ring-orange-200"
            >
              ⭐ {v}
            </span>
          ))}
          <span className="text-[10px] font-semibold text-orange-500">← visual anchors</span>
        </div>
      )}

      <div className="mt-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-[10px] text-orange-800">
        <span className="font-bold text-orange-600">Scenario · </span>{scenario}
      </div>

      <select
        value={characterPick}
        onChange={(e) => setCharacterPick(e.target.value as CharacterPick)}
        className="mt-1 w-full rounded-md border border-orange-200 bg-white px-2 py-1 text-xs"
        title="Featured character"
      >
        <option value="auto">🧠 Auto — smart cast pick</option>
        <option value="none">🚫 No character</option>
        {characterOptions.map((c) => (
          <option key={c.id} value={c.id}>🎭 {c.name}</option>
        ))}
      </select>

      {errMsg && (
        <div className="mt-1 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700">
          ⚠️ {errMsg}
          <button
            onClick={() => generate()}
            className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-800 ring-1 ring-orange-200">
        🍌 Powered by Nano Banana Pro
      </div>
      <p className="mt-1 text-[10px] text-orange-700">
        Shown on the left half of the Lesson Intro card.
      </p>
    </div>
  );
}

