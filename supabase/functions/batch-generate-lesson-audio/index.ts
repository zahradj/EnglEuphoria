import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioTexts, voice = 'EXAVITQu4vr4xnSDxMaL' } = await req.json(); // Default: Sarah
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    if (!audioTexts || typeof audioTexts !== 'object') {
      throw new Error('audioTexts must be an object with slide IDs as keys');
    }

    const results: Record<string, string> = {};
    const errors: Record<string, string> = {};

    // Generate audio for each slide
    for (const [slideId, text] of Object.entries(audioTexts)) {
      try {
        console.log(`Generating audio for ${slideId}...`);
        
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: text as string,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          }
        );

        if (!response.ok) {
          errors[slideId] = `ElevenLabs API error: ${response.status}`;
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64Audio = base64Encode(arrayBuffer);
        
        results[slideId] = `data:audio/mp3;base64,${base64Audio}`;
        console.log(`✓ Generated audio for ${slideId}`);
      } catch (error) {
        console.error(`Error generating audio for ${slideId}:`, error);
        errors[slideId] = error instanceof Error ? error.message : "Unknown error";
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        errors,
        totalRequested: Object.keys(audioTexts).length,
        totalGenerated: Object.keys(results).length,
        totalFailed: Object.keys(errors).length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Batch audio generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
