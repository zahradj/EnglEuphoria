// live-vocab-capture — called from the 1-on-1 classroom HUD when a teacher
// pins a vocab/grammar chunk during the live lesson. Item is added to the
// student's FSRS deck so it surfaces in tomorrow's warm-up.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Body {
  student_id: string;
  hub: 'playground' | 'academy' | 'success';
  cefr?: string;
  skill_kind: 'vocab' | 'grammar' | 'phonics' | 'pronunciation' | 'speaking_pattern' | 'communication_function';
  skill_key: string;
  example?: string;
  audio_url?: string;
  source_lesson_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body.student_id || !body.skill_key || !body.skill_kind || !body.hub) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const now = new Date();
    const dueIn1Day = new Date(now.getTime() + 86400000);

    // Upsert (student, skill_key) to avoid duplicates from re-pinning.
    const { data: existing } = await supabase
      .from('memory_items')
      .select('id')
      .eq('student_id', body.student_id)
      .eq('skill_key', body.skill_key)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from('memory_items')
        .update({
          last_context: { example: body.example, audio_url: body.audio_url, captured_live: true },
          updated_at: now.toISOString(),
        })
        .eq('id', existing.id);

      return new Response(JSON.stringify({ id: existing.id, action: 'updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('memory_items')
      .insert({
        student_id: body.student_id,
        hub: body.hub,
        cefr: body.cefr ?? null,
        skill_kind: body.skill_kind,
        skill_key: body.skill_key,
        memory_strength: 0,
        active_mastery: 0,
        passive_mastery: 0,
        speaking_retention: 0,
        pronunciation_retention: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        forgetting_risk: 0.5,
        recall_level: 1,
        spiral_stage: 0,
        next_due_at: dueIn1Day.toISOString(),
        last_context: { example: body.example, audio_url: body.audio_url, captured_live: true },
        source: 'live_class',
        fsrs_state: null,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Best-effort: invalidate intelligence snapshot cache.
    await supabase
      .from('intelligence_snapshots')
      .delete()
      .eq('student_id', body.student_id)
      .then(() => {}, () => {});

    return new Response(JSON.stringify({ id: data.id, action: 'created' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
