import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateGoogleImage, GoogleImageError } from "../_shared/googleImageClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Subject-binding wrapper — prevents the model from drifting to unrelated content.
    const boundPrompt =
      `PRIMARY SUBJECT (MANDATORY, the image MUST depict exactly this and nothing else):\n` +
      `${prompt}\n\n` +
      `Do NOT substitute, add, or invent any other objects, characters, animals, or props ` +
      `beyond what is described above. The final image MUST clearly and unambiguously depict the subject above.`;
    console.log("Generating image with prompt:", boundPrompt.slice(0, 200));

    try {
      const { dataUrl } = await generateGoogleImage(boundPrompt);
      console.log("Image generated successfully");
      return new Response(
        JSON.stringify({ imageUrl: dataUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      const err = e as GoogleImageError;
      const status = err.status ?? 500;
      return new Response(
        JSON.stringify({ error: err.message }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
