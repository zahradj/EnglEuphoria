// classroom-mark-crash: stamp platform_crash on a live session when Sentinel catches a frontend crash.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { session_id, room_id, message } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const filter = session_id
      ? { col: 'id', val: session_id }
      : room_id
      ? { col: 'room_id', val: room_id }
      : null;
    if (!filter) {
      return new Response(JSON.stringify({ error: 'session_id or room_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('classroom_sessions')
      .update({
        disconnect_reason: 'platform_crash',
        fault_type: 'platform_crash',
        ai_verdict: `Frontend crash captured by Sentinel: ${String(message ?? 'unknown').slice(0, 240)}`,
        ai_verdict_at: new Date().toISOString(),
        session_status: 'incomplete',
        ended_at: new Date().toISOString(),
      })
      .eq(filter.col, filter.val);

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
