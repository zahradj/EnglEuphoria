import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateGoogleImage, GoogleImageError } from "../_shared/googleImageClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characterDescription, characterName, artStyle, stylePrompt } = await req.json();

    console.log(`🎨 Generating image for ${characterName} (style=${artStyle || 'animated'})`);

    const STYLE_PRESETS: Record<string, string> = {
      animated:
        'Friendly modern cartoon/animated illustration. Bold clean lines, vibrant colors, expressive eyes, warm smile, polished animation-studio quality. Solid white or soft pastel background. Avoid photorealism.',
      realistic:
        'Photorealistic editorial portrait. Natural skin tones and textures, realistic lighting and soft shadows, shallow depth of field, 35mm camera look, neutral studio background. Avoid cartoon, anime, or illustration styles.',
      'semi-realistic':
        'Semi-realistic stylized portrait — painterly digital illustration with realistic proportions and soft cinematic lighting, concept-art quality. Neither full cartoon nor full photo. Clean neutral background.',
      anime:
        'High-quality anime/manga illustration. Crisp linework, cel shading, expressive large eyes, vibrant colors, clean background.',
      '3d':
        'Polished 3D character render (Pixar/DreamWorks quality). Soft global illumination, subsurface scattering, physically-based materials, clean neutral background.',
    };

    const styleBlock = (typeof stylePrompt === 'string' && stylePrompt.trim())
      ? stylePrompt.trim()
      : STYLE_PRESETS[artStyle as string] ?? STYLE_PRESETS.animated;

    const prompt = `Create a high-quality character portrait for an English learning app.

CHARACTER: ${characterName}
DESCRIPTION: ${characterDescription}

STYLE: ${styleBlock}

COMPOSITION:
- Centered head-and-shoulders or upper body portrait
- Character facing forward, warm and approachable expression
- Clean uncluttered background
- No text, no logos, no watermarks

Generate a single, clear image of this character.`;

    try {
      const { dataUrl } = await generateGoogleImage(prompt);
      console.log(`✅ Image generated successfully for ${characterName}`);
      return new Response(
        JSON.stringify({ imageUrl: dataUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (e) {
      const err = e as GoogleImageError;
      const status = err.status ?? 500;
      console.error("❌ Google image generation error:", status, err.message);
      return new Response(
        JSON.stringify({ error: err.message }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in generate-character-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
