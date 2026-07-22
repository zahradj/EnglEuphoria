/**
 * interview-availability-list
 *
 * Public (verify_jwt = false). Token-gated. Given an interview room_token,
 * computes the next 14 days of open slots for the applicant by combining:
 *   - admin recurring weekly rules (interview_availability_rules)
 *   - per-applicant overrides (interview_availability_overrides, kind=add/block)
 *   - existing scheduled interviews (collision exclusion)
 *
 * Slots are returned in UTC ISO strings. The client renders in the
 * applicant's local timezone.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

function addMinutes(d: Date, m: number) {
  return new Date(d.getTime() + m * 60_000)
}

function parseTime(t: string): [number, number] {
  const [h, m] = t.split(':').map(Number)
  return [h ?? 0, m ?? 0]
}

type CanonicalHub = 'playground' | 'academy' | 'success'

function normalizeHub(value: unknown): CanonicalHub | null {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ')
  if (!v) return null
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground'
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success'
  if (v.includes('academy') || v.includes('teen')) return 'academy'
  return null
}

function durationForHub(hub: CanonicalHub | null): number {
  return hub === 'playground' ? 30 : 60
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body?.token ?? '').trim()
    const hubOverride = normalizeHub(body?.hub_type)
    if (!token) return json({ error: 'token required' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const { data: interview } = await admin
      .from('interviews')
      .select('id, application_id, hub, hub_type, scheduled_at, status, duration_minutes')
      .eq('room_token', token)
      .maybeSingle()
    if (!interview) return json({ error: 'invalid_token' }, 404)

    // The applicant's current UI choice wins over any stale stored value.
    const hubType = hubOverride ?? normalizeHub((interview as any).hub_type) ?? normalizeHub((interview as any).hub)
    // When the applicant changes hub in the UI, ignore stale row duration
    // values (old rows commonly have 25/30 minutes). Hub determines duration.
    const durationMinutes = hubType ? durationForHub(hubType) : (interview.duration_minutes ?? 60)

    const [rulesRes, overridesRes, bookedRes] = await Promise.all([
      admin
        .from('interview_availability_rules')
        .select('*')
        .eq('active', true)
        .or(hubType ? `hub_type.is.null,hub_type.eq.${hubType}` : 'hub_type.is.null'),
      admin
        .from('interview_availability_overrides')
        .select('*')
        .eq('application_id', interview.application_id),
      admin
        .from('interviews')
        .select('scheduled_at, duration_minutes, hub, hub_type, mock_lesson_key')
        .not('scheduled_at', 'is', null)
        .in('status', ['scheduled', 'in_progress']),
    ])

    const rules = rulesRes.data ?? []
    const overrides = overridesRes.data ?? []
    const booked = bookedRes.data ?? []

    const bookedRanges = booked.map((b: any) => {
      const s = new Date(b.scheduled_at).getTime()
      const bookedHub = normalizeHub(b.hub_type) ?? normalizeHub(b.hub) ?? normalizeHub(b.mock_lesson_key)
      const bookedMinutes = bookedHub ? durationForHub(bookedHub) : (b.duration_minutes ?? 60)
      return [s, s + bookedMinutes * 60_000] as [number, number]
    })

    // Window: now+2h (lead time) through +14 days.
    const start = addMinutes(new Date(), 120)
    const end = addMinutes(start, 14 * 24 * 60)

    const slots: { starts_at: string; ends_at: string }[] = []

    // 1) Expand recurring rules into concrete slots within window.
    for (let day = new Date(start); day <= end; day = addMinutes(day, 24 * 60)) {
      const weekday = day.getUTCDay()
      const dayRules = rules.filter((r: any) => Number(r.weekday) === weekday)
      for (const r of dayRules) {
        const [sh, sm] = parseTime(r.start_time)
        const [eh, em] = parseTime(r.end_time)
        const slotMin = Number(r.slot_minutes) || durationMinutes
        const dayStart = new Date(
          Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), sh, sm),
        )
        const dayEnd = new Date(
          Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), eh, em),
        )
        for (
          let t = dayStart;
          addMinutes(t, slotMin) <= dayEnd;
          t = addMinutes(t, slotMin)
        ) {
          if (t < start || t > end) continue
          slots.push({
            starts_at: t.toISOString(),
            ends_at: addMinutes(t, slotMin).toISOString(),
          })
        }
      }
    }

    // 2) Add per-applicant `add` overrides.
    for (const o of overrides.filter((o: any) => o.kind === 'add')) {
      slots.push({ starts_at: o.starts_at, ends_at: o.ends_at })
    }

    // 3) Remove slots colliding with `block` overrides or existing bookings.
    const blocks = overrides
      .filter((o: any) => o.kind === 'block')
      .map((o: any) => [new Date(o.starts_at).getTime(), new Date(o.ends_at).getTime()] as [number, number])

    const filtered = slots.filter((s) => {
      const a = new Date(s.starts_at).getTime()
      const b = new Date(s.ends_at).getTime()
      for (const [bs, be] of blocks) if (a < be && b > bs) return false
      for (const [bs, be] of bookedRanges) if (a < be && b > bs) return false
      return true
    })

    // Dedup + sort
    const seen = new Set<string>()
    const out = filtered
      .filter((s) => (seen.has(s.starts_at) ? false : seen.add(s.starts_at)))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))

    return json({
      slots: out,
      hub_type: hubType,
      duration_minutes: durationMinutes,
      already_booked: !!interview.scheduled_at,
    })
  } catch (e: any) {
    console.error('[interview-availability-list]', e)
    return json({ error: e?.message ?? 'internal_error' }, 500)
  }
})
