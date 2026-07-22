// Weekly digest email to teachers summarizing their students' Vocab Games performance.
// Deterministic aggregation. Teachers-only (never students).
//
// Trigger: pg_cron weekly (Mondays 08:00 UTC) → POST here with x-cron-key.
// Also invokable manually with { teacher_ids?: string[], dry_run?: boolean }.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_KEY = Deno.env.get('VOCAB_DIGEST_CRON_KEY') ?? ''

type StudentRow = {
  name: string
  hub?: string
  sessions: number
  avgAccuracy: number
  passRate: number
  weakWords: string[]
}

type Ev = { user_id: string; event_type: string; event_data: any; created_at: string }

function weekLabel(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(from)} – ${fmt(to)}`
}

type EngineStats = {
  totalRuns: number
  avgAccuracy: number
  byType: Array<{ type: string; runs: number; avgAccuracy: number }>
  topStudents: Array<{ name: string; runs: number; avgAccuracy: number }>
}

function isEngineEvent(ev: Ev): boolean {
  const tag = ev?.event_data?.telemetry_tag
  return typeof tag === 'string' && tag.startsWith('language_engine_')
}

function aggregate(events: Ev[], studentName: (id: string) => string): {
  students: StudentRow[]
  totals: { students: number; sessions: number; avgAccuracy: number; avgPassRate: number }
  engines: EngineStats
} {
  const vocabEvents = events.filter((e) => !isEngineEvent(e))
  const engineEvents = events.filter(isEngineEvent)

  const byStudent = new Map<
    string,
    { sessions: number; accSum: number; passed: number; hub?: string; wrong: Map<string, number> }
  >()

  for (const ev of vocabEvents) {
    if (!ev.user_id) continue
    const d = ev.event_data ?? {}
    const acc = typeof d.accuracy === 'number' ? d.accuracy : 0
    const accPct = acc > 1 ? acc : acc * 100
    const passed = d.passed === true || accPct >= 80
    const s = byStudent.get(ev.user_id) ?? {
      sessions: 0,
      accSum: 0,
      passed: 0,
      hub: d.hub,
      wrong: new Map<string, number>(),
    }
    s.sessions += 1
    s.accSum += accPct
    if (passed) s.passed += 1
    s.hub = s.hub ?? d.hub
    const misses: string[] = Array.isArray(d.missed_words)
      ? d.missed_words
      : Array.isArray(d.weak_words)
        ? d.weak_words
        : []
    for (const w of misses) {
      if (typeof w === 'string') s.wrong.set(w, (s.wrong.get(w) ?? 0) + 1)
    }
    byStudent.set(ev.user_id, s)
  }

  const rows: StudentRow[] = []
  let totalSessions = 0
  let totalAcc = 0
  let totalPass = 0
  for (const [id, s] of byStudent) {
    const avgAccuracy = s.sessions > 0 ? s.accSum / s.sessions : 0
    const passRate = s.sessions > 0 ? (s.passed / s.sessions) * 100 : 0
    const weakWords = Array.from(s.wrong.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([w]) => w)
    rows.push({
      name: studentName(id),
      hub: s.hub,
      sessions: s.sessions,
      avgAccuracy,
      passRate,
      weakWords,
    })
    totalSessions += s.sessions
    totalAcc += avgAccuracy
    totalPass += passRate
  }

  rows.sort((a, b) => b.sessions - a.sessions)
  const n = rows.length

  // Engine stats — Language Engines (story/escape/detective/hidden object)
  const engineByType = new Map<string, { runs: number; accSum: number }>()
  const engineByStudent = new Map<string, { runs: number; accSum: number }>()
  let engineTotalAcc = 0
  for (const ev of engineEvents) {
    if (!ev.user_id) continue
    const d = ev.event_data ?? {}
    const tag: string = d.telemetry_tag ?? ''
    // strip prefix + trailing _mode
    const stripped = tag.replace(/^language_engine_/, '').replace(/_(lesson|review|quiz)$/, '')
    const acc = typeof d.accuracy === 'number' ? d.accuracy : 0
    const accPct = acc > 1 ? acc : acc * 100
    const t = engineByType.get(stripped) ?? { runs: 0, accSum: 0 }
    t.runs += 1
    t.accSum += accPct
    engineByType.set(stripped, t)
    const st = engineByStudent.get(ev.user_id) ?? { runs: 0, accSum: 0 }
    st.runs += 1
    st.accSum += accPct
    engineByStudent.set(ev.user_id, st)
    engineTotalAcc += accPct
  }
  const engines: EngineStats = {
    totalRuns: engineEvents.length,
    avgAccuracy: engineEvents.length > 0 ? engineTotalAcc / engineEvents.length : 0,
    byType: Array.from(engineByType.entries())
      .map(([type, v]) => ({ type, runs: v.runs, avgAccuracy: v.runs > 0 ? v.accSum / v.runs : 0 }))
      .sort((a, b) => b.runs - a.runs),
    topStudents: Array.from(engineByStudent.entries())
      .map(([id, v]) => ({
        name: studentName(id),
        runs: v.runs,
        avgAccuracy: v.runs > 0 ? v.accSum / v.runs : 0,
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5),
  }

  return {
    students: rows,
    totals: {
      students: n,
      sessions: totalSessions,
      avgAccuracy: n > 0 ? totalAcc / n : 0,
      avgPassRate: n > 0 ? totalPass / n : 0,
    },
    engines,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Auth: cron header OR service-role bearer.
  const cronHeader = req.headers.get('x-cron-key') ?? ''
  const authHeader = req.headers.get('authorization') ?? ''
  const authorized =
    (CRON_KEY && cronHeader === CRON_KEY) || authHeader === `Bearer ${SERVICE_ROLE}`
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: { teacher_ids?: string[]; dry_run?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    /* empty body ok */
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const to = new Date()
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
  const label = weekLabel(from, to)

  // 1) Teachers to email
  let teacherIds: string[] = body.teacher_ids ?? []
  if (teacherIds.length === 0) {
    const { data: rolesRows } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'teacher')
    teacherIds = (rolesRows ?? []).map((r: any) => r.user_id).filter(Boolean)
  }

  const results: Array<{ teacher_id: string; status: string; students?: number; error?: string }> = []

  for (const teacherId of teacherIds) {
    try {
      // 2) Teacher info
      const { data: teacherUser } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', teacherId)
        .maybeSingle()
      if (!teacherUser?.email) {
        results.push({ teacher_id: teacherId, status: 'skipped_no_email' })
        continue
      }

      // 3) Students of this teacher
      const { data: lessons } = await supabase
        .from('lessons')
        .select('student_id')
        .eq('teacher_id', teacherId)
      const studentIds = Array.from(
        new Set((lessons ?? []).map((l: any) => l.student_id).filter(Boolean)),
      )
      if (studentIds.length === 0) {
        results.push({ teacher_id: teacherId, status: 'skipped_no_students' })
        continue
      }

      // 4) Vocab-games events for those students, last 7 days
      const { data: events } = await supabase
        .from('analytics_events')
        .select('user_id, event_type, event_data, created_at')
        .in('event_type', ['vocab_arc_complete', 'vocab-games:complete'])
        .in('user_id', studentIds)
        .gte('created_at', from.toISOString())
        .limit(10000)

      // 5) Student names
      const { data: studentUsers } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', studentIds)
      const nameMap = new Map<string, string>(
        (studentUsers ?? []).map((u: any) => [u.id, u.full_name || u.email || 'Student']),
      )
      const nameFor = (id: string) => nameMap.get(id) ?? 'Student'

      const { students, totals, engines } = aggregate((events ?? []) as Ev[], nameFor)

      if (totals.sessions === 0 && engines.totalRuns === 0) {
        results.push({ teacher_id: teacherId, status: 'skipped_no_activity' })
        continue
      }

      if (body.dry_run) {
        results.push({ teacher_id: teacherId, status: 'dry_run', students: students.length })
        continue
      }

      // 6) Send via unified transactional pipeline
      const invokeRes = await fetch(
        `${SUPABASE_URL}/functions/v1/send-transactional-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SERVICE_ROLE}`,
          },
          body: JSON.stringify({
            templateName: 'teacher-vocab-games-digest',
            recipientEmail: teacherUser.email,
            idempotencyKey: `vocab-digest-${teacherId}-${from.toISOString().slice(0, 10)}`,
            templateData: {
              teacherName: teacherUser.full_name ?? 'Teacher',
              weekLabel: label,
              totals,
              students,
              engines,
              dashboardUrl: 'https://engleuphoria.com/dashboard/teacher',
            },
          }),
        },
      )

      results.push({
        teacher_id: teacherId,
        status: invokeRes.ok ? 'queued' : `send_failed_${invokeRes.status}`,
        students: students.length,
      })
    } catch (e) {
      results.push({ teacher_id: teacherId, status: 'error', error: String(e) })
    }
  }

  return new Response(
    JSON.stringify({ week: label, processed: results.length, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
