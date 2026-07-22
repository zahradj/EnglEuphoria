import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'content_creator', 'teacher'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { hub, title, description, level, coverImageUrl, tags, slides } = await req.json();

    if (hub !== 'playground' && hub !== 'academy') {
      return new Response(JSON.stringify({ error: 'invalid hub' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return new Response(JSON.stringify({ error: 'title required (3+ chars)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!Array.isArray(slides) || slides.length < 8) {
      return new Response(JSON.stringify({ error: 'lesson must contain at least 8 slides' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase
      .from('lesson_templates')
      .insert({
        created_by: auth.userId,
        hub,
        title: title.trim(),
        description: description?.trim() || null,
        level: level || null,
        cover_image_url: coverImageUrl || null,
        tags: Array.isArray(tags) ? tags.slice(0, 12).map((t: string) => String(t).trim()).filter(Boolean) : [],
        slide_count: slides.length,
        payload: { slides, title, level, hub },
        is_published: true,
      })
      .select('id')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('publish-lesson-template error:', err);
    return new Response(JSON.stringify({ error: true, message: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
