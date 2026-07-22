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

  const PICSART_API_KEY = Deno.env.get('PICSART_API_KEY');
  if (!PICSART_API_KEY) {
    return new Response(JSON.stringify({ error: 'PICSART_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action, imageUrl, hub, text, fontSize, fontColor } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: 'action is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result: any;

    switch (action) {
      case 'remove-background': {
        if (!imageUrl) throw new Error('imageUrl required for remove-background');
        const form = new FormData();
        form.append('image_url', imageUrl);
        form.append('output_type', 'cutout');
        form.append('format', 'PNG');

        const resp = await fetch(`${PICSART_BASE}/removebg`, {
          method: 'POST',
          headers: { 'X-Picsart-API-Key': PICSART_API_KEY },
          body: form,
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`Picsart removebg failed [${resp.status}]: ${errText}`);
        }
        result = await resp.json();
        break;
      }

      case 'enhance': {
        if (!imageUrl) throw new Error('imageUrl required for enhance');
        const form = new FormData();
        form.append('image_url', imageUrl);
        form.append('upscale_factor', '4');
        form.append('format', 'PNG');

        const resp = await fetch(`${PICSART_BASE}/upscale/enhance`, {
          method: 'POST',
          headers: { 'X-Picsart-API-Key': PICSART_API_KEY },
          body: form,
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`Picsart enhance failed [${resp.status}]: ${errText}`);
        }
        result = await resp.json();
        break;
      }

      case 'style-transfer': {
        if (!imageUrl) throw new Error('imageUrl required for style-transfer');
        if (!hub) throw new Error('hub required for style-transfer');

        // Map hub to Picsart effect name
        const hubEffects: Record<string, string> = {
          playground: 'cartoonify',
          academy: 'neon',
          professional: 'hdr2',
        };

        const effectName = hubEffects[hub] || 'cartoonify';
        const form = new FormData();
        form.append('image_url', imageUrl);
        form.append('effect_name', effectName);
        form.append('format', 'PNG');

        const resp = await fetch(`${PICSART_BASE}/effects`, {
          method: 'POST',
          headers: { 'X-Picsart-API-Key': PICSART_API_KEY },
          body: form,
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`Picsart effects failed [${resp.status}]: ${errText}`);
        }
        result = await resp.json();
        break;
      }

      case 'text-overlay': {
        if (!imageUrl) throw new Error('imageUrl required for text-overlay');
        if (!text) throw new Error('text required for text-overlay');

        // Use the Picsart text endpoint to generate text overlays
        const form = new FormData();
        form.append('image_url', imageUrl);
        form.append('text', text);
        form.append('font_size', String(fontSize || 48));
        form.append('color', fontColor || '#FFFFFF');
        form.append('format', 'PNG');

        const resp = await fetch(`${PICSART_BASE}/text2image`, {
          method: 'POST',
          headers: { 'X-Picsart-API-Key': PICSART_API_KEY },
          body: form,
        });

        if (!resp.ok) {
          // If text2image isn't available, return the original image with metadata
          console.warn('Picsart text2image not available, returning original');
          result = { data: { url: imageUrl }, status: 'fallback' };
        } else {
          result = await resp.json();
        }
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const outputUrl = result?.data?.url || null;

    return new Response(JSON.stringify({
      success: true,
      action,
      outputUrl,
      raw: result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Picsart processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
