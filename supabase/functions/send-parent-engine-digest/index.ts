// Parent monthly digest — sends one email per parent with their child's
// Language Engine activity. Idempotent per (parent, month).
//
// Trigger: pg_cron on the 1st of each month, or manual invoke.

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { internalAuthHeaders } from '../_shared/internalAuth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthTag = monthStart.slice(0, 7);

  // Pull all runs in the previous month.
  const { data: runs, error } = await supabase
    .from('student_engine_runs')
    .select('user_id, engine, accuracy, duration_ms, created_at')
    .gte('created_at', monthStart)
    .lt('created_at', monthEnd);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const byStudent = new Map<string, typeof runs>();
  for (const r of runs ?? []) {
    const arr = byStudent.get(r.user_id) ?? [];
    arr.push(r as any);
    byStudent.set(r.user_id, arr as any);
  }

  let sent = 0;
  const studentIds = Array.from(byStudent.keys());
  if (studentIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0, month: monthTag }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: rels } = await supabase
    .from('student_parent_relationships')
    .select('student_id, parent_email, student_name')
    .in('student_id', studentIds);

  // Pull certificates awarded during the month (v2 enrichment).
  const { data: certs } = await supabase
    .from('engine_mastery_certificates')
    .select('user_id, engine, avg_accuracy, awarded_at, share_token')
    .in('user_id', studentIds)
    .gte('awarded_at', monthStart)
    .lt('awarded_at', monthEnd);
  const certsByStudent = new Map<string, any[]>();
  for (const c of certs ?? []) {
    const arr = certsByStudent.get((c as any).user_id) ?? [];
    arr.push(c);
    certsByStudent.set((c as any).user_id, arr);
  }

  for (const rel of rels ?? []) {
    const list = byStudent.get(rel.student_id) ?? [];
    if (!list.length || !rel.parent_email) continue;
    const totalRuns = list.length;
    const avg = list.reduce((s: number, r: any) => s + Number(r.accuracy || 0), 0) / totalRuns;
    const topEngine = list
      .reduce<Record<string, number>>((m, r: any) => ({ ...m, [r.engine]: (m[r.engine] ?? 0) + 1 }), {});
    const favorite = Object.entries(topEngine).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'story';
    const totalMinutes = Math.round(
      list.reduce((s: number, r: any) => s + Number(r.duration_ms || 0), 0) / 60000,
    );
    const bestRun = list.reduce((best: any, r: any) =>
      Number(r.accuracy || 0) > Number(best?.accuracy || 0) ? r : best, list[0]);
    const studentCerts = certsByStudent.get(rel.student_id) ?? [];
    const certsSummary = studentCerts.map((c: any) => ({
      engine: c.engine,
      accuracy: Math.round(Number(c.avg_accuracy || 0) * 100),
      share_url: c.share_token ? `https://engleuphoria.com/engine-certificate/${c.share_token}` : null,
    }));

    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'parent-engine-monthly-digest',
        recipientEmail: rel.parent_email,
        idempotencyKey: `parent-digest-${rel.parent_email}-${monthTag}`,
        templateData: {
          studentName: rel.student_name || 'your child',
          month: monthTag,
          totalRuns,
          avgAccuracy: Math.round(avg * 100),
          favoriteEngine: favorite,
          totalMinutes,
          bestAccuracy: Math.round(Number(bestRun?.accuracy || 0) * 100),
          bestEngine: bestRun?.engine ?? favorite,
          certificatesEarned: certsSummary.length,
          certificates: certsSummary,
        },
      },
      headers: internalAuthHeaders(),
    });
    sent += 1;
  }

  return new Response(JSON.stringify({ sent, month: monthTag }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
