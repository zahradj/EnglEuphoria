/**
 * recruitment-agent
 *
 * Admin-gated hiring assistant for teacher recruitment. It reads real
 * teacher_applications/interviews data, returns structured guidance, and can
 * trigger the existing booking-invitation flow when explicitly requested.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { internalAuthHeaders } from '../_shared/internalAuth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const SITE_URL = 'https://engleuphoria.com'
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? Deno.env.get('GOOGLE_API_KEY')

type CanonicalHub = 'playground' | 'academy' | 'success'

function normalizeHub(value: unknown): CanonicalHub | null {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ')
  if (!v) return null
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground'
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success'
  if (v.includes('academy') || v.includes('teen')) return 'academy'
  return null
}

function normalizeAgeGroups(value: unknown): CanonicalHub | null {
  const items = Array.isArray(value) ? value.map(String) : [String(value ?? '')]
  const normalized = items.map((item) => item.toLowerCase())
  const hasAdult = normalized.some((item) => item.includes('adult'))
  const hasTeen = normalized.some((item) => item.includes('teen'))
  const hasKid = normalized.some((item) => item.includes('kid') || item.includes('child'))
  const count = Number(hasAdult) + Number(hasTeen) + Number(hasKid)
  if (count !== 1) return null
  if (hasAdult) return 'success'
  if (hasTeen) return 'academy'
  if (hasKid) return 'playground'
  return null
}

function samplerForHub(hub: CanonicalHub): string {
  return hub === 'playground' ? 'playground_sampler' : hub === 'success' ? 'success_sampler' : 'academy_sampler'
}

function durationForHub(hub: CanonicalHub): number {
  return hub === 'playground' ? 30 : 60
}

const safeString = (value: unknown, max = 4000) =>
  typeof value === 'string' ? value.slice(0, max) : ''

const buildCandidateSnapshot = (app: any, interviews: any[]) => ({
  id: app.id,
  name: `${app.first_name ?? ''} ${app.last_name ?? ''}`.trim() || 'Applicant',
  email: app.email,
  stage: app.current_stage,
  status: app.status,
  hub_preference: app.hub_preference,
  nationality: app.nationality,
  languages_spoken: app.languages_spoken,
  teaching_experience_years: app.teaching_experience_years,
  preferred_age_groups: app.preferred_age_groups,
  education: safeString(app.education, 700),
  esl_certification: safeString(app.esl_certification, 300),
  bio: safeString(app.bio, 900),
  teaching_philosophy: safeString(app.teaching_philosophy, 900),
  teaching_methodology: safeString(app.teaching_methodology, 900),
  classroom_management: safeString(app.classroom_management, 700),
  motivation: safeString(app.motivation, 700),
  cover_letter: safeString(app.cover_letter, 900),
  submitted_at: app.created_at,
  has_cv: Boolean(app.cv_url),
  has_video: Boolean(app.video_url),
  interviews: interviews
    .filter((iv) => iv.application_id === app.id)
    .map((iv) => ({
      id: iv.id,
      status: iv.status,
      scheduled_at: iv.scheduled_at,
      classroom_session_id: iv.classroom_session_id,
      scorecard: iv.scorecard,
      admin_notes: iv.admin_notes,
    })),
})

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    return 'Gemini is not configured. I prepared the workflow action using deterministic recruitment rules only.'
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          role: 'system',
          parts: [{
            text: [
              'You are EnglEuphoria Recruitment Agent.',
              'Use only the supplied application data. Do not invent documents, scores, identity checks, or interview outcomes.',
              'Be concise, professional, fair, culturally sensitive, and focused on ESL teaching suitability.',
              'Never make final hiring decisions automatically. Recommend next steps for the admin.',
              'Return markdown with: Summary, Strengths, Risks, Next step.',
            ].join('\n'),
          }],
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.25, maxOutputTokens: 1400 },
      }),
    },
  )

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('[recruitment-agent] Gemini error', { status: response.status, detail })
    return 'AI analysis is temporarily unavailable. Use the deterministic next step shown below.'
  }

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ||
    'No recommendation returned.'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !serviceKey || !anonKey) return json({ error: 'server_configuration_error' }, 500)

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await caller.auth.getUser()
    if (userErr || !user) return json({ error: 'unauthorized' }, 401)

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data: role } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
    if (!role) return json({ error: 'forbidden' }, 403)

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action ?? 'triage')
    const applicationId = typeof body?.applicationId === 'string' ? body.applicationId : null

    const appQuery = admin
      .from('teacher_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(applicationId ? 1 : 12)

    const { data: applications, error: appErr } = applicationId
      ? await appQuery.eq('id', applicationId)
      : await appQuery.in('current_stage', [
        'application_received',
        'application_submitted',
        'under_review',
        'documents_review',
        'interview_pending',
        'interview_scheduled',
        'interview_completed',
      ])

    if (appErr) {
      console.error('[recruitment-agent] application lookup failed', appErr)
      return json({ error: 'application_lookup_failed', details: appErr.message }, 500)
    }
    if (!applications?.length) return json({ summary: 'No active recruitment applications found.', actions: [] })

    const ids = applications.map((app: any) => app.id)
    const { data: interviews = [] } = await admin
      .from('interviews')
      .select('id, application_id, status, scheduled_at, classroom_session_id, scorecard, admin_notes')
      .in('application_id', ids)

    const snapshots = applications.map((app: any) => buildCandidateSnapshot(app, interviews ?? []))

    if (action === 'invite_to_interview') {
      if (!applicationId) return json({ error: 'applicationId required' }, 400)
      const app = applications[0]
      const candidateName = `${app.first_name ?? ''} ${app.last_name ?? ''}`.trim() || 'Applicant'
      const expiresAtIso = new Date(Date.now() + 48 * 60 * 60_000).toISOString()
      const canonicalHub = normalizeHub(app.hub_preference) ?? normalizeAgeGroups(app.preferred_age_groups)
      const hubPatch = canonicalHub
        ? {
            hub: canonicalHub,
            hub_type: canonicalHub,
            mock_lesson_key: samplerForHub(canonicalHub),
            duration_minutes: durationForHub(canonicalHub),
          }
        : { duration_minutes: 60 }
      const { data: latest } = await admin
        .from('interviews')
        .select('id, room_token, scheduled_at, status, booking_token_expires_at')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let interview = latest
      if (latest && latest.status === 'awaiting_booking' && !latest.scheduled_at) {
        const { data: refreshed, error: refreshErr } = await admin
          .from('interviews')
          .update({ booking_token_expires_at: expiresAtIso, ...hubPatch })
          .eq('id', latest.id)
          .select('id, room_token, scheduled_at, status, booking_token_expires_at')
          .single()
        if (refreshErr) throw refreshErr
        interview = refreshed
      } else {
        const { data: created, error: createErr } = await admin
          .from('interviews')
          .insert({
            application_id: applicationId,
            admin_id: user.id,
            teacher_email: app.email,
            teacher_name: candidateName,
            ...hubPatch,
            status: 'awaiting_booking',
            booking_token_expires_at: expiresAtIso,
          })
          .select('id, room_token, scheduled_at, status, booking_token_expires_at')
          .single()
        if (createErr) throw createErr
        interview = created
      }

      const bookingLink = `${SITE_URL}/interview/${interview.room_token}`
      const expiresAtLabel = `${new Date(expiresAtIso).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
      })} UTC`

      await admin
        .from('teacher_applications')
        .update({ status: 'invited', current_stage: 'interview_pending' })
        .eq('id', applicationId)

      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', ...internalAuthHeaders() },
        body: JSON.stringify({
          templateName: 'booking-invitation',
          recipientEmail: app.email,
          idempotencyKey: `recruitment-agent-invite-${interview.id}-${Date.now()}`,
          templateData: { candidateName, bookingLink, expiresAtLabel },
        }),
      })
      if (!emailRes.ok) {
        const detail = await emailRes.text().catch(() => '')
        console.error('[recruitment-agent] email failed', { status: emailRes.status, detail })
        return json({ error: 'email_failed', details: detail || `HTTP ${emailRes.status}` }, 500)
      }

      return json({
        summary: `Interview booking invitation sent to ${candidateName}.`,
        action: 'invite_to_interview',
        interviewId: interview.id,
        bookingLink,
      })
    }

    if (action === 'advance_to_screening') {
      if (!applicationId) return json({ error: 'applicationId required' }, 400)
      await admin
        .from('teacher_applications')
        .update({ current_stage: 'documents_review', status: 'under_review' })
        .eq('id', applicationId)
      return json({ summary: 'Candidate moved to document screening.', action: 'advance_to_screening' })
    }

    if (action === 'evaluate_interview') {
      if (!applicationId) return json({ error: 'applicationId required' }, 400)
      const interviewId = typeof body?.interviewId === 'string' ? body.interviewId : null
      const checklist = (body?.checklist ?? {}) as Record<string, boolean>
      const checklistLabels = (body?.checklistLabels ?? {}) as Record<string, string>
      const adminNotes = safeString(body?.notes, 4000)

      const items = Object.entries(checklistLabels).map(([key, label]) => ({
        key, label, observed: !!checklist[key],
      }))
      const passed = items.filter((i) => i.observed).length
      const total = items.length || 1
      const passRate = passed / total

      const candidate = snapshots[0]
      const evalPrompt = [
        'You are evaluating a live interview-arena mock lesson for an ESL teacher applicant.',
        'You MUST return strict JSON only — no prose, no markdown — matching this schema:',
        '{ "verdict": "approve" | "reject" | "needs_review", "confidence": 0..1, "summary": string, "strengths": string[], "risks": string[], "recommendation": string }',
        'Decision rules:',
        '- approve: pass_rate >= 0.83 AND no red flags in notes.',
        '- reject: pass_rate < 0.5 OR notes contain safeguarding/professionalism/honesty red flags.',
        '- needs_review: anything else, or when evidence is too thin.',
        'Be fair, culturally sensitive, ESL-focused. Use ONLY supplied data.',
        '',
        `pass_rate=${passRate.toFixed(2)} (${passed}/${total})`,
        `admin_notes: ${adminNotes || '(none)'}`,
        `checklist: ${JSON.stringify(items)}`,
        `candidate: ${JSON.stringify(candidate)}`,
      ].join('\n')

      let report = {
        verdict: passRate >= 0.83 ? 'approve' : passRate < 0.5 ? 'reject' : 'needs_review',
        confidence: Math.min(0.6 + Math.abs(passRate - 0.5), 0.95),
        summary: `Deterministic fallback: ${passed}/${total} observations met.`,
        strengths: items.filter((i) => i.observed).map((i) => i.label),
        risks: items.filter((i) => !i.observed).map((i) => i.label),
        recommendation: 'Human review recommended — AI analysis unavailable.',
      } as {
        verdict: 'approve' | 'reject' | 'needs_review'
        confidence: number
        summary: string
        strengths: string[]
        risks: string[]
        recommendation: string
      }

      if (GEMINI_API_KEY) {
        try {
          const aiResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: evalPrompt }] }],
                generationConfig: {
                  temperature: 0.15,
                  maxOutputTokens: 1200,
                  responseMimeType: 'application/json',
                },
              }),
            },
          )
          if (aiResp.ok) {
            const data = await aiResp.json()
            const raw = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? ''
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed.verdict === 'string') {
              report = {
                verdict: parsed.verdict === 'approve' || parsed.verdict === 'reject' ? parsed.verdict : 'needs_review',
                confidence: typeof parsed.confidence === 'number' ? parsed.confidence : report.confidence,
                summary: String(parsed.summary ?? report.summary),
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : report.strengths,
                risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : report.risks,
                recommendation: String(parsed.recommendation ?? report.recommendation),
              }
            }
          } else {
            console.error('[recruitment-agent] evaluate_interview gemini error', aiResp.status)
          }
        } catch (e) {
          console.error('[recruitment-agent] evaluate_interview parse error', e)
        }
      }

      const decidedAt = new Date().toISOString()
      const interviewUpdate: Record<string, unknown> = {
        scorecard: { checklist, notes: adminNotes, report, decided_at: decidedAt },
        admin_notes: adminNotes,
      }
      if (report.verdict === 'approve') interviewUpdate.status = 'passed'
      else if (report.verdict === 'reject') interviewUpdate.status = 'failed'

      if (interviewId) {
        await admin.from('interviews').update(interviewUpdate).eq('id', interviewId)
      }

      // This is an advisory report only — it must never flip the application
      // to a hired/rejected state on its own. Approving here does not create
      // an auth account, teacher profile, or send any notification, so doing
      // so would let a candidate look "Hired" in the admin dashboards while
      // functionally having no account. The actual decision (and any account
      // creation / rejection email) happens through the admin's explicit
      // approve/reject action in the interview scorecard (decide()).

      return json({
        action: 'evaluate_interview',
        report,
        analytics: { passed, total, passRate },
      })
    }

    const prompt = action === 'review_application'
      ? `Review this teacher application and recommend the next recruitment step.\n\n${JSON.stringify(snapshots[0], null, 2)}`
      : `Triage these active teacher applications. Rank who needs action first and why.\n\n${JSON.stringify(snapshots, null, 2)}`

    const summary = await callGemini(prompt)
    const deterministicActions = snapshots.slice(0, 4).map((candidate) => ({
      applicationId: candidate.id,
      label: candidate.interviews.length ? 'Review interview status' : 'Review application',
      recommendedAction: candidate.interviews.length ? 'review_application' : 'advance_to_screening',
    }))

    return json({ summary, candidates: snapshots, actions: deterministicActions })
  } catch (e: any) {
    console.error('[recruitment-agent] unexpected', e)
    return json({ error: e?.message ?? 'internal_error' }, 500)
  }
})