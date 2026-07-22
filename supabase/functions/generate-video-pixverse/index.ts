import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Pixverse video generation edge function
// Docs: https://docs.pixverse.ai/
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('PIXVERSE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'PIXVERSE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      action = 'generate', // 'generate' | 'status'
      prompt,
      duration = 5,
      quality = '540p',
      aspect_ratio = '16:9',
      model = 'v3.5',
      motion_mode = 'normal',
      seed,
      negative_prompt,
      style,
      video_id,
    } = body ?? {};

    const traceId = crypto.randomUUID();
    const baseHeaders = {
      'API-KEY': apiKey,
      'Ai-trace-id': traceId,
      'Content-Type': 'application/json',
    };

    if (action === 'status') {
      if (!video_id) {
        return new Response(JSON.stringify({ error: 'video_id is required for status' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const res = await fetch(`https://app-api.pixverse.ai/openapi/v2/video/result/${video_id}`, {
        method: 'GET',
        headers: baseHeaders,
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: Record<string, unknown> = {
      prompt,
      duration,
      quality,
      aspect_ratio,
      model,
      motion_mode,
    };
    if (seed !== undefined) payload.seed = seed;
    if (negative_prompt) payload.negative_prompt = negative_prompt;
    if (style) payload.style = style;

    const res = await fetch('https://app-api.pixverse.ai/openapi/v2/video/text/generate', {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
