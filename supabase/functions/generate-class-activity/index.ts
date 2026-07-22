import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiFetch } from "../_shared/aiFetch.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an English-teaching activity designer for a 1-on-1 live class.
Given a topic from the teacher, AUTO-PICK the BEST single format from:
  - "mcq"        : 5 multiple-choice questions, each with 4 options (one correct)
  - "roleplay"   : a short 2-turn roleplay scenario (setting + 2 prompts the student answers)
  - "fill_blank" : 5 fill-in-the-blank items (sentence with ___ + correct answer)

Pick whichever format best practices the topic given the students's likely needs.
Respond with ONLY a JSON object, no prose, matching one of these schemas:

MCQ:
{ "format": "mcq", "title": string, "items": [ { "q": string, "options": [string,string,string,string], "answer_index": 0|1|2|3 }, ... 5 items ] }

Roleplay:
{ "format": "roleplay", "title": string, "setting": string, "items": [ { "teacher_line": string, "student_prompt": string }, { "teacher_line": string, "student_prompt": string } ] }

Fill blank:
{ "format": "fill_blank", "title": string, "items": [ { "sentence": string, "answer": string }, ... 5 items ] }`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const teacherId = claims.claims.sub as string;

    const body = await req.json();
    const { booking_id, prompt } = body ?? {};

    if (typeof booking_id !== 'string' || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'booking_id and non-empty prompt required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify caller is the teacher of this booking
    const { data: booking, error: bErr } = await supabase
      .from('class_bookings')
      .select('id, teacher_id')
      .eq('id', booking_id)
      .maybeSingle();

    if (bErr || !booking || booking.teacher_id !== teacherId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const response = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Topic: ${prompt}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit, try again shortly' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI error:', status, text);
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? '';
    let payload: any;
    try {
      payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    const format = payload?.format;
    if (!['mcq', 'roleplay', 'fill_blank'].includes(format)) {
      throw new Error('AI returned unknown format');
    }
    if (!Array.isArray(payload?.items) || payload.items.length === 0) {
      throw new Error('AI returned no items');
    }

    // Insert — RLS allows teacher_id = auth.uid()
    const { data: inserted, error: insErr } = await supabase
      .from('live_class_activities')
      .insert({
        classroom_session_id: booking_id,
        booking_id,
        teacher_id: teacherId,
        prompt,
        format,
        payload,
      })
      .select('*')
      .single();

    if (insErr) {
      console.error('Insert error:', insErr);
      throw new Error('Failed to save activity');
    }

    return new Response(JSON.stringify({ activity: inserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-class-activity error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
