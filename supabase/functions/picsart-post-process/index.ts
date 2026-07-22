import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PICSART_BASE = 'https://api.picsart.io/tools/1.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, steps = ['removebg'], upscaleFactor = 2 } = await req.json();

    const picsartKey = Deno.env.get('PICSART_API_KEY');
    if (!picsartKey) {
      throw new Error('PICSART_API_KEY is not configured');
    }
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let currentUrl = imageUrl;

    // ── Step 1: Background Removal ──────────────────────────────
    if (steps.includes('removebg')) {
      console.log('Picsart: removing background...');
      const form = new FormData();
      form.append('image_url', currentUrl);
      form.append('output_type', 'cutout');
      form.append('format', 'PNG');
      form.append('bg_blur', '0');

      const res = await fetch(`${PICSART_BASE}/removebg`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-Picsart-API-Key': picsartKey,
        },
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Picsart removebg failed:', res.status, errText);
        throw new Error(`Background removal failed [${res.status}]: ${errText}`);
      }

      const data = await res.json();
      currentUrl = data?.data?.url;
      if (!currentUrl) throw new Error('No URL returned from removebg');
      console.log('✓ Background removed');
    }

    // ── Step 2: Upscale & Enhance ───────────────────────────────
    if (steps.includes('upscale')) {
      console.log(`Picsart: upscaling ${upscaleFactor}x...`);
      const form = new FormData();
      form.append('image_url', currentUrl);
      form.append('upscale_factor', String(Math.min(upscaleFactor, 4)));
      form.append('format', 'PNG');

      const res = await fetch(`${PICSART_BASE}/upscale`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-Picsart-API-Key': picsartKey,
        },
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Picsart upscale failed:', res.status, errText);
        // Non-fatal: return the bg-removed version
        console.warn('Skipping upscale, returning bg-removed image');
      } else {
        const data = await res.json();
        const upscaledUrl = data?.data?.url;
        if (upscaledUrl) {
          currentUrl = upscaledUrl;
          console.log('✓ Image upscaled');
        }
      }
    }

    // ── Step 3: Ultra Enhance (optional) ────────────────────────
    if (steps.includes('enhance')) {
      console.log('Picsart: enhancing...');
      const form = new FormData();
      form.append('image_url', currentUrl);
      form.append('format', 'PNG');

      const res = await fetch(`${PICSART_BASE}/enhance`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-Picsart-API-Key': picsartKey,
        },
        body: form,
      });

      if (!res.ok) {
        console.warn('Picsart enhance failed, skipping:', res.status);
      } else {
        const data = await res.json();
        const enhancedUrl = data?.data?.url;
        if (enhancedUrl) {
          currentUrl = enhancedUrl;
          console.log('✓ Image enhanced');
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: currentUrl,
        stepsApplied: steps,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Picsart post-processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
