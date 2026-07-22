import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateGoogleImage, GoogleImageError } from "../_shared/googleImageClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Style Presets ────────────────────────────────────────────────
const STYLE_PRESETS: Record<string, { prefix: string; suffix: string; negative: string }> = {
  flat2d: {
    prefix: 'Professional 2D flat vector illustration for a children\'s educational app. Use the Professional Flat 2.0 style: clean bold lines, solid colors with subtle layering, white background (#FFFFFF), isolated object, Engleuphoria Navy accents.',
    suffix: 'high quality, clean composition, educational',
    negative: 'No 3D, no render, no depth, no shadows, no gradients, no photorealism, no fuzzy textures, no messy lines, no background scenery, no blender, no 3ds max, no Octane Render, no Unreal Engine.',
  },
  educational: {
    prefix: 'premium clean educational illustration for English learning, polished classroom-ready art, crisp anti-aliased edges, clean confident linework, balanced composition, clear focal subject, professional children\'s-book finish',
    suffix: 'high quality finished illustration, smooth color fills, strong readable silhouette, simple uncluttered background',
    negative: 'no blurry areas, no muddy colors, no warped anatomy, no distorted faces, no messy sketch lines, no pixelation, no artifacts, no text, no watermark',
  },
  cartoon: {
    prefix: 'premium polished 2D cartoon style, friendly and engaging for children, crisp clean outlines, expressive character design, balanced centered composition',
    suffix: 'high quality finished illustration for English language learning, smooth cel-shaded color fills, vibrant controlled palette, simple uncluttered background',
    negative: 'no blurry areas, no muddy colors, no warped anatomy, no distorted faces, no messy sketch lines, no pixelation, no artifacts, no text, no watermark',
  },
  'kawaii-chibi': {
    prefix: 'ultra-cute kawaii chibi cartoon mascot style — a single adorable subject centred in frame, oversized sparkly anime eyes with shiny highlights, tiny rounded body, soft pastel colours, gentle blushed cheeks, smooth clean digital illustration, soft thin outlines (no harsh black ink), subtle cel shading, friendly happy expression, sticker-like finish, pure flat white background, no shadows on the ground, no text, no logos, no borders',
    suffix: 'high quality illustration for early-years English learning',
    negative: 'no 3D, no photorealism, no scary elements, no text, no watermarks, no busy backgrounds',
  },

  minimalist: {
    prefix: 'minimal line art, clean and simple, modern design',
    suffix: 'high quality illustration for English language learning',
    negative: '',
  },
  realistic: {
    prefix: 'photorealistic style, high quality and detailed',
    suffix: 'high quality illustration for English language learning',
    negative: '',
  },
  'hand-drawn': {
    prefix: 'polished hand-drawn illustration style with clean intentional linework, warm professional classroom-ready finish, balanced composition',
    suffix: 'high quality finished illustration for English language learning, clear focal subject, neat color fills, simple uncluttered background',
    negative: 'no rough draft look, no messy sketch lines, no blur, no pixelation, no distorted anatomy, no text, no watermark',
  },
  cinematic: {
    prefix: 'cinematic professional illustration, dramatic lighting, high-end production quality',
    suffix: 'high quality, 8k resolution',
    negative: '',
  },
  editorial: {
    prefix: 'Minimalist editorial photography, luxury corporate aesthetic, shot on 35mm Leica, natural soft lighting, neutral tones',
    suffix: 'high-end professional stock style',
    negative: '',
  },
};

const PICSART_BASE = 'https://api.picsart.io/tools/1.0';

/**
 * Calls Picsart background removal API.
 * Returns the transparent-cutout URL, or null on failure.
 */
async function picsartRemoveBg(imageUrl: string, apiKey: string): Promise<string | null> {
  try {
    console.log('Picsart: removing background...');
    const form = new FormData();
    form.append('image_url', imageUrl);
    form.append('output_type', 'cutout');
    form.append('format', 'PNG');
    form.append('bg_blur', '0');

    const res = await fetch(`${PICSART_BASE}/removebg`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'X-Picsart-API-Key': apiKey,
      },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Picsart removebg failed:', res.status, errText);
      return null;
    }

    const data = await res.json();
    const url = data?.data?.url;
    if (url) console.log('✓ Background removed via Picsart');
    return url || null;
  } catch (err) {
    console.error('Picsart removebg error:', err);
    return null;
  }
}

/**
 * Calls Picsart upscale API.
 * Returns the enhanced URL, or null on failure.
 */
async function picsartUpscale(imageUrl: string, apiKey: string, factor = 2): Promise<string | null> {
  try {
    console.log(`Picsart: upscaling ${factor}x...`);
    const form = new FormData();
    form.append('image_url', imageUrl);
    form.append('upscale_factor', String(Math.min(factor, 4)));
    form.append('format', 'PNG');

    const res = await fetch(`${PICSART_BASE}/upscale`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'X-Picsart-API-Key': apiKey,
      },
      body: form,
    });

    if (!res.ok) {
      console.warn('Picsart upscale failed:', res.status);
      return null;
    }

    const data = await res.json();
    const url = data?.data?.url;
    if (url) console.log('✓ Image upscaled via Picsart');
    return url || null;
  } catch (err) {
    console.error('Picsart upscale error:', err);
    return null;
  }
}

/**
 * Uploads a remote image to Supabase Storage and returns its public URL.
 */
async function persistToStorage(
  imageUrl: string,
  bucketName: string,
  storagePath: string,
): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      console.warn('Supabase credentials missing, skipping storage persist');
      return null;
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Download the image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const blob = await imgRes.blob();

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, blob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    console.log('✓ Persisted to storage:', storagePath);
    return publicData.publicUrl;
  } catch (err) {
    console.error('Storage persist error:', err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt,
      style = 'educational',
      negativePrompt,
      aspectRatio = '1:1',
      postProcess = false,
      persist = false,
      storagePath,
      // Hub Image-Style Matrix overrides — sent by the Creator Studio modal.
      // `imageStyle` is the human-readable label, `imageStyleSuffix` is the strict
      // prompt fragment that must be appended verbatim to enforce the look.
      imageStyle,
      imageStyleSuffix,
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 1. Generate image via Google AI Studio (gemini-2.5-flash-image) ──
    const preset = STYLE_PRESETS[style] || STYLE_PRESETS.educational;

    // Some scenes (story beats, warm-up dialogue) explicitly want comic-style
    // speech bubbles with readable text. Detect via marker or explicit flag,
    // then strip "no text/letters/watermark" clauses from the preset negative
    // so the model is free to render bubbles.
    const wantsText =
      (typeof prompt === 'string' && /\bINCLUDE\s+comic-style\s+speech\s+bubbles\b/i.test(prompt)) ||
      (typeof prompt === 'string' && /\bALLOW_TEXT_IN_IMAGE\b/.test(prompt));
    const stripTextBans = (s: string) =>
      s.replace(/,?\s*no text[^,.]*/gi, '')
       .replace(/,?\s*no letters[^,.]*/gi, '')
       .replace(/,?\s*no watermarks?/gi, '')
       .replace(/\s{2,}/g, ' ')
       .trim();
    const presetNegative = wantsText ? stripTextBans(preset.negative) : preset.negative;
    const presetPrefix = wantsText ? stripTextBans(preset.prefix) : preset.prefix;

    let enhancedPrompt = `${presetPrefix}. ${prompt}, ${preset.suffix}`;
    const allNegative = [presetNegative, negativePrompt].filter(Boolean).join(' ');
    if (allNegative) {
      enhancedPrompt += `. NEGATIVE: ${allNegative}`;
    }

    // Hub Image-Style override — strictly appended to enforce teacher's chosen vibe.
    if (imageStyleSuffix && typeof imageStyleSuffix === 'string') {
      enhancedPrompt += `. ${prompt}, ${imageStyleSuffix}. Must be age-appropriate and visually vibrant.`;
    } else if (imageStyle && typeof imageStyle === 'string') {
      enhancedPrompt += `. Generated in an authentic, flawless ${imageStyle} style. Must be age-appropriate and visually vibrant.`;
    }

    console.log('Generating image | style:', style, '| prompt:', enhancedPrompt.slice(0, 200));

    let imageUrl: string;
    try {
      const out = await generateGoogleImage(enhancedPrompt);
      imageUrl = out.dataUrl;
    } catch (e) {
      const err = e as GoogleImageError;
      const status = err.status ?? 500;
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: err.message }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ AI image generated');
    let picsartApplied = false;

    // ── 2. Picsart Post-Processing (if enabled) ─────────────────
    if (postProcess) {
      const picsartKey = Deno.env.get('PICSART_API_KEY');
      if (picsartKey) {
        // For base64 data URLs, we need to upload first to get a real URL
        let processableUrl = imageUrl;
        if (imageUrl.startsWith('data:')) {
          // Persist base64 to storage first so Picsart can access it
          const tempPath = `temp/picsart_${Date.now()}.png`;
          const tempUrl = await persistToStorage(imageUrl, 'lesson-assets', tempPath);
          if (tempUrl) processableUrl = tempUrl;
        }

        // Step A: Remove background
        const bgRemovedUrl = await picsartRemoveBg(processableUrl, picsartKey);
        if (bgRemovedUrl) {
          imageUrl = bgRemovedUrl;
          picsartApplied = true;

          // Step B: Upscale (2x for crisp edges)
          const upscaledUrl = await picsartUpscale(imageUrl, picsartKey, 2);
          if (upscaledUrl) {
            imageUrl = upscaledUrl;
          }
        }
      } else {
        console.warn('PICSART_API_KEY not set, skipping post-processing');
      }
    }

    // ── 3. Persist to Supabase Storage (if requested) ───────────
    let publicUrl: string | null = null;
    if (persist && storagePath) {
      publicUrl = await persistToStorage(imageUrl, 'lesson-assets', storagePath);
    }

    return new Response(
      JSON.stringify({
        imageUrl: publicUrl || imageUrl,
        prompt: enhancedPrompt,
        style,
        aspectRatio,
        picsartApplied,
        persisted: !!publicUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-image-generation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
