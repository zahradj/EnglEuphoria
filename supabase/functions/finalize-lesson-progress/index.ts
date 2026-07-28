// Computes the student's final score for a live classroom session and
// updates student_lesson_progress + student_curriculum_progress accordingly.
// >= 70% → status='completed' and advance to next lesson in the matrix.
// <  70% → status='redo' and keep next lesson locked.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Body { sessionId: string; lessonId: string; studentId: string }

function cefrRank(v: string | null): number {
  const order = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  if (!v) return 99;
  const i = order.indexOf(String(v).toLowerCase());
  return i < 0 ? 99 : i;
}
function num(v: unknown, fallback = Number.MAX_SAFE_INTEGER): number {
  return typeof v === 'number' ? v : fallback;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.sessionId || !body?.lessonId || !body?.studentId) {
      return new Response(JSON.stringify({ error: 'sessionId, lessonId, studentId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== AUTH CHECK ==========
    // Only the teacher running the session may finalize its verdict — this
    // writes student_lesson_progress/student_curriculum_progress via the
    // service-role client below, so an unverified caller could otherwise
    // rewrite ANY student's progress by just naming their studentId.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const authenticatedUserId = claimsData.user.id;
    // =================================

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Pull session counters — teacher_id too, so we can verify the caller
    // actually owns this session before writing anything.
    const { data: state } = await supabase
      .from('classroom_states')
      .select('teacher_id, correct_count, attempt_count, session_struggles')
      .eq('session_id', body.sessionId)
      .maybeSingle();

    // ========== OWNERSHIP CHECK ==========
    if (!state || state.teacher_id !== authenticatedUserId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ======================================

    const correct = state?.correct_count ?? 0;
    const attempts = state?.attempt_count ?? 0;
    const struggleCount = Array.isArray(state?.session_struggles) ? state!.session_struggles.length : 0;

    // Score: correct / max(attempts,1). If no attempts recorded, fall back to
    // a struggle-derived heuristic so the gate never silently passes.
    let finalScore = 0;
    if (attempts > 0) {
      finalScore = Math.round((correct / attempts) * 100);
    } else {
      // No instrumentation → grade on hints sent (each struggle = -10pts from 100, floor 0).
      finalScore = Math.max(0, 100 - struggleCount * 10);
    }

    const passed = finalScore >= 70;
    const nowIso = new Date().toISOString();

    // 2. Upsert student_lesson_progress
    const { data: existing } = await supabase
      .from('student_lesson_progress')
      .select('id, attempts')
      .eq('user_id', body.studentId)
      .eq('lesson_id', body.lessonId)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      user_id: body.studentId,
      lesson_id: body.lessonId,
      status: passed ? 'completed' : 'redo',
      score: finalScore,
      attempts: (existing?.attempts ?? 0) + 1,
      updated_at: nowIso,
    };
    if (passed) payload.completed_at = nowIso;

    if (existing) {
      await supabase.from('student_lesson_progress').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('student_lesson_progress').insert({ ...payload, started_at: nowIso });
    }

    // 3. On pass → advance student_curriculum_progress.current_lesson_id
    let nextLessonId: string | null = null;
    if (passed) {
      const { data: current } = await supabase
        .from('curriculum_lessons')
        .select('id, slot_cefr_level, slot_unit_number, slot_lesson_number, sequence_order, order_index, target_system')
        .eq('id', body.lessonId)
        .maybeSingle();
      if (current?.target_system) {
        const { data: all } = await supabase
          .from('curriculum_lessons')
          .select('id, slot_cefr_level, slot_unit_number, slot_lesson_number, sequence_order, order_index')
          .eq('target_system', current.target_system)
          .eq('is_published', true);
        const sorted = (all ?? []).sort((a: any, b: any) =>
          cefrRank(a.slot_cefr_level) - cefrRank(b.slot_cefr_level) ||
          num(a.slot_unit_number) - num(b.slot_unit_number) ||
          num(a.slot_lesson_number) - num(b.slot_lesson_number) ||
          num(a.sequence_order) - num(b.sequence_order) ||
          num(a.order_index) - num(b.order_index)
        );
        const idx = sorted.findIndex((l: any) => l.id === body.lessonId);
        const next = idx >= 0 ? sorted[idx + 1] : null;
        nextLessonId = next?.id ?? null;

        await supabase
          .from('student_curriculum_progress')
          .upsert(
            {
              student_id: body.studentId,
              current_lesson_id: nextLessonId,
              last_activity_at: nowIso,
            },
            { onConflict: 'student_id' },
          );
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        final_score: finalScore,
        passed,
        verdict: passed ? 'completed' : 'redo',
        next_lesson_id: nextLessonId,
        correct, attempts,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
