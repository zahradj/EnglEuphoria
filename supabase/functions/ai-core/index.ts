/**
 * ai-core: Consolidated AI router function with automatic failover.
 *
 * PRIMARY:  Google AI Studio (Gemini) — direct API
 * BACKUP:   Lovable AI Gateway (Gemini/OpenAI proxy)
 *
 * Routes via `action` field in request body to:
 *   - explain_mistake
 *   - evaluate_speaking (real-world task grading)
 *   - evaluate_speech (audio pronunciation grading)
 *   - speaking_feedback (general speaking practice feedback)
 *   - generate_lesson (lightweight lesson outline generation)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ════════════════════════════════════════════════════════════════════
// AI FAILOVER LAYER
// Primary  → Google AI Studio (Gemini direct)
// Backup   → Lovable AI Gateway
// ════════════════════════════════════════════════════════════════════

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AICallOptions {
  systemPrompt?: string;
  userPrompt: string;
  geminiModel?: string;          // e.g. "gemini-2.5-flash"
  lovableModel?: string;         // e.g. "google/gemini-2.5-flash"
  jsonMode?: boolean;            // request JSON output
  temperature?: number;
}

interface AICallResult {
  text: string;
  provider: 'gemini-direct' | 'lovable-gateway';
}

/**
 * Call Google AI Studio (Gemini) directly.
 * Throws on failure so the failover wrapper can retry with the backup.
 * Implements exponential backoff retry on 429 (rate limit) before giving up.
 */
async function callGeminiDirect(opts: AICallOptions): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!GEMINI_API_KEY) {
    console.error('GEMINI CRASH: GEMINI_API_KEY missing from environment');
    throw new Error('GEMINI_API_KEY not configured');
  }

  const model = opts.geminiModel || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body: any = {
    contents: [{ role: 'user', parts: [{ text: opts.userPrompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (opts.systemPrompt) {
    body.systemInstruction = { role: 'system', parts: [{ text: opts.systemPrompt }] };
  }

  const doFetch = () => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let geminiRes = await doFetch();

  // Exponential backoff retry on 429 rate-limit (one retry after 2s).
  if (geminiRes.status === 429) {
    console.warn('GEMINI Rate Limited (429). Waiting 2s and retrying once before failover...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    geminiRes = await doFetch();
    if (geminiRes.status === 429) {
      const errText = await geminiRes.text().catch(() => '');
      console.error('GEMINI CRASH:', geminiRes.status, errText);
      const err: any = new Error(`Gemini direct rate-limited after retry (429): ${errText.slice(0, 200)}`);
      err.status = 429;
      throw err;
    }
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => '');
    console.error('GEMINI CRASH:', geminiRes.status, errText);
    const err: any = new Error(`Gemini direct failed (${geminiRes.status}): ${errText.slice(0, 200)}`);
    err.status = geminiRes.status;
    throw err;
  }

  const data = await geminiRes.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('') || '';
  if (!text) {
    console.error('GEMINI CRASH: empty response payload', JSON.stringify(data).slice(0, 300));
    throw new Error('Gemini direct returned empty response');
  }
  return text;
}

/**
 * Call Lovable AI Gateway (backup).
 */
async function callLovableGateway(opts: AICallOptions): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  const messages: AIMessage[] = [];
  if (opts.systemPrompt) messages.push({ role: 'system', content: opts.systemPrompt });
  messages.push({ role: 'user', content: opts.userPrompt });

  const body: any = {
    model: opts.lovableModel || 'google/gemini-2.5-flash',
    messages,
  };
  if (opts.jsonMode) body.response_format = { type: 'json_object' };

  const res = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('LOVABLE GATEWAY CRASH:', res.status, errText);
    const err: any = new Error(`Lovable gateway failed (${res.status}): ${errText.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim() || '';
  if (!text) {
    console.error('LOVABLE GATEWAY CRASH: empty response', JSON.stringify(data).slice(0, 300));
    throw new Error('Lovable gateway returned empty response');
  }
  return text;
}

/**
 * The failover wrapper. Try Gemini first, fall back to Lovable Gateway.
 * Used by every text-based action (generate_lesson, explain_mistake, evaluate_speech text portions, etc.)
 */
async function callAIWithFailover(opts: AICallOptions): Promise<AICallResult> {
  try {
    const text = await callGeminiDirect(opts);
    return { text, provider: 'gemini-direct' };
  } catch (primaryError: any) {
    console.warn('⚠️ Primary AI (Gemini) failed → switching to Lovable Gateway. Reason:', primaryError?.status, primaryError?.message || primaryError);
    try {
      const text = await callLovableGateway(opts);
      return { text, provider: 'lovable-gateway' };
    } catch (backupError: any) {
      console.error('❌ Both AI providers failed!', 'gemini=', primaryError?.status, primaryError?.message, '| lovable=', backupError?.status, backupError?.message);
      const err: any = new Error('AI generation temporarily unavailable.');
      err.status = backupError?.status ?? primaryError?.status;
      throw err;
    }
  }
}

// ─── Action: explain_mistake ────────────────────────────────────────
async function handleExplainMistake(body: any) {
  const { lesson_context, question_text, correct_answer, user_answer } = body;
  if (!correct_answer || !user_answer) {
    return jsonResponse({ error: 'correct_answer and user_answer are required' }, 400);
  }

  const systemPrompt = `You are a warm, encouraging ESL tutor. When a student gets an answer wrong, you explain WHY in exactly ONE short sentence (under 30 words). Be specific about the grammar/vocabulary rule. Never be condescending. Use simple language appropriate for language learners.`;
  const userPrompt = `The student answered a question incorrectly.
${lesson_context ? `Lesson context: ${lesson_context}` : ''}
${question_text ? `Question: ${question_text}` : ''}
Correct answer: "${correct_answer}"
Student's answer: "${user_answer}"

Explain in one encouraging sentence why their answer is wrong and what the correct answer is.`;

  try {
    const { text, provider } = await callAIWithFailover({
      systemPrompt,
      userPrompt,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash-lite',
      temperature: 0.6,
    });
    return jsonResponse({ explanation: text.trim() || "Keep trying — you're getting closer!", provider });
  } catch (e: any) {
    if (e?.status === 429) return jsonResponse({ error: 'Rate limited — try again shortly.' }, 429);
    if (e?.status === 402) return jsonResponse({ error: 'Credits exhausted.' }, 402);
    return jsonResponse({ error: e?.message || 'AI generation temporarily unavailable.' }, 503);
  }
}

// ─── Action: evaluate_speaking (real-world task) ────────────────────
async function handleEvaluateSpeaking(body: any) {
  const { mission_briefing, student_transcript, success_criteria } = body;
  if (!mission_briefing || !student_transcript) {
    return jsonResponse({ error: 'mission_briefing and student_transcript are required' }, 400);
  }

  const criteriaText = Array.isArray(success_criteria) && success_criteria.length > 0
    ? `\nSuccess Criteria the student should have addressed:\n${success_criteria.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}`
    : '';

  const systemPrompt = `You are an expert English language evaluator for an online learning platform.
You will evaluate a student's spoken or written response to a real-world task.

INSTRUCTIONS:
- Evaluate the response on a scale of 0 to 100 based on: grammar accuracy (30%), vocabulary richness (25%), task completion (30%), and coherence (15%).
- Provide exactly 2 sentences of constructive, encouraging feedback.
- Return ONLY valid JSON with this exact structure: {"score": <number>, "feedback": "<string>"}
- Be encouraging but honest. If the response is very short or off-topic, score accordingly.`;

  const userPrompt = `Mission Briefing: "${mission_briefing}"
${criteriaText}

Student's Response: "${student_transcript}"

Evaluate this response and return ONLY the JSON object.`;

  let result = { score: 50, feedback: 'Good effort! Keep practicing to improve.' };
  let provider: string = 'unknown';

  try {
    const ai = await callAIWithFailover({
      systemPrompt,
      userPrompt,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash',
      jsonMode: true,
      temperature: 0.4,
    });
    provider = ai.provider;

    const cleaned = ai.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      result.score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 50)));
      result.feedback = parsed.feedback || result.feedback;
    } catch {
      const m = cleaned.match(/\{[\s\S]*"score"[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        result.score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 50)));
        result.feedback = parsed.feedback || result.feedback;
      }
    }
  } catch (e: any) {
    if (e?.status === 429) return jsonResponse({ error: 'Rate limit. Try again shortly.' }, 429);
    if (e?.status === 402) return jsonResponse({ error: 'AI credits exhausted.' }, 402);
    return jsonResponse({ error: e?.message || 'AI evaluation failed' }, 503);
  }

  return jsonResponse({ ...result, provider });
}

// ─── Action: evaluate_speech (audio pronunciation) ──────────────────
// Audio analysis: PRIMARY = Gemini direct (generateContent with inlineData),
// BACKUP = Lovable Gateway (chat completions with input_audio).
async function handleEvaluateSpeech(body: any, authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !userData?.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const userId = userData.user.id;
  const { audioBase64, mimeType = 'audio/webm', targetSentence, hub = 'academy', context } = body;

  if (!audioBase64 || !targetSentence) {
    return jsonResponse({ error: 'audioBase64 and targetSentence are required' }, 400);
  }

  // Voice Energy Gate
  try {
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (SERVICE_KEY) {
      const credResp = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/consume_voice_energy`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_user_id: userId }),
      });
      if (credResp.ok) {
        const rows = await credResp.json();
        const row = Array.isArray(rows) ? rows[0] : rows;
        if (row && row.success === false) {
          return jsonResponse({
            error: 'INSUFFICIENT_VOICE_ENERGY',
            message: 'You are out of Voice Energy. Wait for refill or upgrade your plan.',
            remaining: row.remaining ?? 0,
          }, 402);
        }
      }
    }
  } catch (e) {
    console.warn('[voice-energy] gate error (allowing through)', e);
  }

  const tone = hub === 'playground'
    ? 'Use ultra-warm, kid-friendly language with emojis. Celebrate small wins.'
    : hub === 'success'
    ? 'Use a refined, professional, executive-coach tone.'
    : 'Use an encouraging teen-friendly academic tone.';

  const promptText = `You are an expert ESL pronunciation coach grading a student's spoken attempt.

TARGET SENTENCE: "${targetSentence}"
${context ? `CONTEXT: ${context}` : ''}
TONE: ${tone}

Listen to the audio and evaluate:
1. accuracyScore (0-100): How closely the spoken words match the target.
2. fluencyScore (0-100): Pacing, smoothness, lack of awkward hesitations.
3. pronunciationScore (0-100): Phonetic clarity of each word.
4. overallScore (0-100): Weighted average (accuracy 40%, pronunciation 40%, fluency 20%).

TIER RULES:
- >= 85 → "gold" (celebration)
- 50-84 → "soft" (gentle correction)
- < 50 → "revert" (replay model and re-prime)

Return ONLY this JSON, no markdown:
{
  "overallScore": <number>,
  "accuracyScore": <number>,
  "fluencyScore": <number>,
  "pronunciationScore": <number>,
  "transcript": "<exact words you heard>",
  "wordBreakdown": [
    { "word": "<target word>", "spoken": "<heard>", "correct": <bool>, "issue": "<short note or null>" }
  ],
  "feedback": "<one sentence specific tip>",
  "tier": "gold" | "soft" | "revert",
  "encouragement": "<one short warm sentence>"
}`;

  const audioFormat = mimeType.includes('mp3') ? 'mp3' : 'webm';
  let raw = '';
  let provider: 'gemini-direct' | 'lovable-gateway' = 'gemini-direct';

  // ───── PRIMARY: Gemini direct (inline audio) ─────
  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: promptText },
            { inlineData: { mimeType: mimeType.includes('mp3') ? 'audio/mp3' : 'audio/webm', data: audioBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`Gemini direct audio failed (${res.status}): ${t.slice(0, 200)}`);
    }
    const data = await res.json();
    raw = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('') || '';
    if (!raw) throw new Error('Gemini direct audio returned empty');
  } catch (primaryError) {
    console.warn('⚠️ Primary AI (Gemini) drained for audio. Switching to backup (Lovable Gateway)…', primaryError instanceof Error ? primaryError.message : primaryError);
    // ───── BACKUP: Lovable Gateway (input_audio) ─────
    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

      const res = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'input_audio', input_audio: { data: audioBase64, format: audioFormat } },
            ],
          }],
        }),
      });
      if (!res.ok) {
        if (res.status === 429) return jsonResponse({ error: 'Rate limit exceeded. Please wait a moment.' }, 429);
        if (res.status === 402) return jsonResponse({ error: 'AI credits exhausted.' }, 402);
        const t = await res.text().catch(() => '');
        throw new Error(`Lovable gateway audio failed (${res.status}): ${t.slice(0, 200)}`);
      }
      const data = await res.json();
      raw = data?.choices?.[0]?.message?.content || '';
      provider = 'lovable-gateway';
    } catch (backupError) {
      console.error('❌ Both AI providers failed for audio!', backupError);
      return jsonResponse({ error: 'AI generation temporarily unavailable.' }, 503);
    }
  }

  raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let result: any;
  try {
    result = JSON.parse(raw);
  } catch {
    console.error('Parse failed, raw:', raw);
    result = {
      overallScore: 50, accuracyScore: 50, fluencyScore: 50, pronunciationScore: 50,
      transcript: '', wordBreakdown: [],
      feedback: "Let's try that again together.",
      tier: 'soft', encouragement: 'Great effort! Try once more.',
    };
  }

  // Self-heal tier from score
  if (result.overallScore >= 85) result.tier = 'gold';
  else if (result.overallScore >= 50) result.tier = 'soft';
  else result.tier = 'revert';

  return jsonResponse({ ...result, provider });
}

// ─── Action: speaking_feedback (general practice) ───────────────────
async function handleSpeakingFeedback(body: any) {
  const { text, scenario } = body;
  if (!text) return jsonResponse({ error: 'text is required' }, 400);

  const systemPrompt = `You are an AI English teacher providing feedback on a student's spoken response.

Scenario: ${scenario?.name || 'General practice'}
Level: ${scenario?.cefr_level || 'B1'}

Provide constructive feedback in this exact JSON format:
{
  "pronunciation_score": 0.8, "grammar_score": 0.8, "fluency_score": 0.8,
  "rating": 4, "encouragement": "Encouraging message",
  "grammar_suggestions": ["suggestion1", "suggestion2"]
}

Scores should be between 0.0 and 1.0. Rating should be 1-5 stars. Be positive and constructive.`;

  let feedback;
  let provider = 'unknown';
  try {
    const ai = await callAIWithFailover({
      systemPrompt,
      userPrompt: `Student said: "${text}"\n\nReturn ONLY the JSON object.`,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash-lite',
      jsonMode: true,
      temperature: 0.4,
    });
    provider = ai.provider;
    const cleaned = ai.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      feedback = JSON.parse(cleaned);
    } catch {
      feedback = {
        pronunciation_score: 0.8, grammar_score: 0.8, fluency_score: 0.8,
        rating: 4, encouragement: 'Great job practicing! Keep it up!', grammar_suggestions: [],
      };
    }
  } catch (e: any) {
    feedback = {
      pronunciation_score: 0.8, grammar_score: 0.8, fluency_score: 0.8,
      rating: 4, encouragement: 'Good effort! Keep practicing!', grammar_suggestions: [],
    };
  }

  return jsonResponse({ feedback, provider });
}

// ─── Action: generate_lesson (lightweight outline) ──────────────────
async function handleGenerateLesson(body: any) {
  const { topic, level = 'B1', objectives = [], duration_minutes = 30 } = body;
  if (!topic) return jsonResponse({ error: 'topic is required' }, 400);

  const systemPrompt = `You are a senior ESL curriculum designer. Produce a concise, classroom-ready lesson outline. Be specific, professional, and aligned with CEFR level ${level}.`;
  const userPrompt = `Create a ${duration_minutes}-minute lesson outline on the topic: "${topic}".
${objectives.length ? `Objectives:\n- ${objectives.join('\n- ')}` : ''}

Return ONLY JSON in this exact shape:
{
  "title": "<lesson title>",
  "subtitle": "<one-sentence hook displayed under the title on the cover>",
  "level": "${level}",
  "objectives": ["<objective 1>", "<objective 2>", "<objective 3>"],
  "warm_up": "<2-3 sentence warm-up>",
  "key_vocabulary": ["<word 1>", "<word 2>", "<word 3>", "<word 4>", "<word 5>"],
  "stages": [
    { "name": "Discovery", "minutes": 5, "activity": "<activity>" },
    { "name": "Modeling", "minutes": 5, "activity": "<activity>" },
    { "name": "Guided Practice", "minutes": 8, "activity": "<activity>" },
    { "name": "Independent Practice", "minutes": 7, "activity": "<activity>" },
    { "name": "Wrap-Up", "minutes": 5, "activity": "<activity>" }
  ],
  "assessment": "<short final check>"
}`;

  try {
    const ai = await callAIWithFailover({
      systemPrompt,
      userPrompt,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash',
      jsonMode: true,
      temperature: 0.7,
    });
    const cleaned = ai.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let lesson: any;
    try {
      lesson = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      lesson = m ? JSON.parse(m[0]) : null;
    }
    if (!lesson) return jsonResponse({ error: 'AI returned an unparseable lesson.' }, 502);
    return jsonResponse({ lesson, provider: ai.provider });
  } catch (e: any) {
    if (e?.status === 429) return jsonResponse({ error: 'Rate limited — try again shortly.' }, 429);
    if (e?.status === 402) return jsonResponse({ error: 'Credits exhausted.' }, 402);
    return jsonResponse({ error: e?.message || 'AI generation temporarily unavailable.' }, 503);
  }
}

// ─── Action: generate_trial_lesson (30-min trial, 6-8 slides) ───────
async function handleGenerateTrialLesson(body: any) {
  const { demographic = 'teens', cefr_level = 'B1', theme, lesson_type, mode } = body;
  if (!theme) return jsonResponse({ error: 'theme is required' }, 400);

  // ─── Cycle 4: Masterclass branch (high-conversion 3-block trial) ───
  if (lesson_type === 'trial' || mode === 'masterclass') {
    return await handleGenerateTrialMasterclass({ demographic, cefr_level, theme });
  }


  const tone = demographic === 'kids'
    ? 'kid-friendly with playful emojis and very short sentences'
    : demographic === 'adults'
    ? 'refined, professional, executive-coach tone'
    : 'energetic teen-friendly academic tone';

  const systemPrompt = `You are designing a 30-minute Trial English Lesson. It must be highly engaging.
The output MUST be 7 to 9 slides total — the FIRST slide is ALWAYS a title_page cover, then 6-8 content slides.
Slide 1 (REQUIRED): title_page (cover). Slide 2: Hook/Icebreaker. Slides 3-4: Vocabulary or Grammar (include at least one grammar_explanation if any grammar is taught). Slides 5-6: Interactive Speaking/Roleplay. Final slide: Wrap-up/Celebration.
Tone: ${tone} based on demographic.
Align language and complexity strictly to CEFR ${cefr_level}.
You MUST return ONLY valid JSON. No markdown, no commentary.

GRAMMAR COLOR-CODING (mandatory inside every grammar_explanation slide — formula, rule_text, examples, explanation):
Wrap parts of speech in HTML span tags using EXACTLY these classes (write class=, NOT className=):
  <span class="text-blue-600 font-bold">…</span>  for Subjects / Nouns / Pronouns
  <span class="text-red-600 font-bold">…</span>   for Verbs (including auxiliaries)
  <span class="text-green-600 font-bold">…</span> for Adjectives
Example: "<span class=\\"text-blue-600 font-bold\\">She</span> <span class=\\"text-red-600 font-bold\\">runs</span> <span class=\\"text-green-600 font-bold\\">quickly</span>."`;

  const userPrompt = `Theme: "${theme}"
Demographic: ${demographic}
CEFR: ${cefr_level}

Return ONLY this JSON shape:
{
  "lesson_title": "<short, catchy title>",
  "lesson_subtitle": "<one-sentence engaging hook for the cover>",
  "target_goal": "<1-sentence goal>",
  "target_vocabulary": ["<word1>", "<word2>", "<word3>", "<word4>", "<word5>"],
  "slides": [
    {
      "phase": "warm-up" | "presentation" | "practice" | "production" | "review",
      "slide_type": "title_page" | "text_image" | "multiple_choice" | "flashcard" | "drag_and_match" | "drag_and_drop" | "fill_in_the_gaps" | "mascot_speech" | "grammar_explanation",
      "title": "<slide title>",
      "subtitle": "<only for title_page — engaging one-liner>",
      "content": "<student-facing text>",
      "teacher_script": "<what the teacher says aloud>",
      "visual_keyword": "<2-3 words for an illustration>",
      "image_generation_prompt": "<detailed prompt for an image generator>",
      "difficulty": "easy" | "medium" | "hard",
      "interactive_data": null
    }
  ]
}

Rules:
- Slide 1 MUST be { "slide_type": "title_page", "phase": "warm-up", "title": "...", "subtitle": "...", "image_generation_prompt": "<cinematic cover image prompt>", "interactive_data": null }. The title_page has NO interactive content.
- Total slides 7-9 (Slide 1 cover + 6-8 content slides).
- For multiple_choice slides, set interactive_data = { "question": "...", "options": ["A","B","C","D"], "correct_index": 0 }.
- For flashcard slides, set interactive_data = { "front": "...", "back": "..." }.
- For drag_and_match (two-column matcher: left ↔ right), set interactive_data = { "instruction": "...", "pairs": [{ "left_item": "...", "right_item": "...", "left_thumbnail_keyword": "<noun>", "right_thumbnail_keyword": "<noun>" }] }. The keyword fields are REQUIRED — one concrete noun per card so an icon can be rendered.
- For drag_and_drop (sorting/categorization), set interactive_data = { "instruction": "Drag each item into the correct category.", "pairs": [{ "draggable": "Apple", "target_zone": "Fruit", "image_url": "https://..." }, { "draggable": "Carrot", "target_zone": "Vegetable" }] }. The "image_url" field is OPTIONAL. Use 2-3 distinct target_zones and 4-6 draggables.
- For fill_in_the_gaps, set interactive_data = { "instruction": "...", "sentence_parts": ["before _ ", " after"], "missing_word": "...", "distractors": ["...","..."] }.
- For grammar_explanation, set interactive_data = { "rule_text": "<plain rule>", "formula": "<color-coded formula, e.g. <span class=\\"text-blue-600 font-bold\\">Subject</span> + <span class=\\"text-red-600 font-bold\\">Verb</span> + <span class=\\"text-blue-600 font-bold\\">Object</span>>", "explanation": "<plain-English explanation>", "examples": ["<color-coded sentence 1>", "<color-coded sentence 2>", "<color-coded sentence 3>"], "common_signals": "<optional signal words>" }. examples MUST contain AT LEAST 3 distinct sentences, each color-coded.
- Difficulty per slide MUST be calibrated to the lesson's CEFR level: A1/A2 → mostly "easy" with at most one "medium"; B1/B2 → mostly "medium" with one "easy" warm-up and one "hard" production task; C1/C2 → mostly "hard" with one "medium" scaffolding slide. Never label an A1 slide "hard" or a C1 slide "easy".
`;

  try {
    const ai = await callAIWithFailover({
      systemPrompt,
      userPrompt,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash',
      jsonMode: true,
      temperature: 0.75,
    });
    const cleaned = ai.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let lesson: any;
    try { lesson = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      lesson = m ? JSON.parse(m[0]) : null;
    }
    if (!lesson || !Array.isArray(lesson.slides)) {
      return jsonResponse({ error: 'AI returned an unparseable trial lesson.' }, 502);
    }
    // Enforce 6-8 slides
    if (lesson.slides.length > 9) lesson.slides = lesson.slides.slice(0, 9);
    return jsonResponse({ lesson, provider: ai.provider });
  } catch (e: any) {
    if (e?.status === 429) return jsonResponse({ error: 'Rate limited — try again shortly.' }, 429);
    if (e?.status === 402) return jsonResponse({ error: 'Credits exhausted.' }, 402);
    return jsonResponse({ error: e?.message || 'AI generation temporarily unavailable.' }, 503);
  }
}

// ─── Cycle 4: Trial Masterclass (3-block high-conversion sales lesson) ───
const MASTERCLASS_THEMES: Record<string, string[]> = {
  kids: [
    'A Day at the Theme Park',
    'Inviting a Friend to a Birthday Party',
    'Ordering Ice Cream Like a Pro',
  ],
  teens: [
    'Planning a Dream Vacation',
    'Pitching Your YouTube Channel Idea',
    'A Studying Abroad Interview',
  ],
  adults: [
    'A High-Stakes Business Meeting',
    'Negotiating a Salary Raise',
    'Networking at an International Conference',
  ],
};

const TRAP_TEMPLATES: Record<string, string> = {
  false_cognate: 'controlling false cognates so meaning is never lost in translation',
  preposition: 'mastering tricky prepositions (in / on / at) for natural fluency',
  tense_shift: 'handling subtle tense shifts so your timeline is always clear',
  article: 'using articles (a / an / the) like a native speaker',
};

async function handleGenerateTrialMasterclass(args: { demographic: string; cefr_level: string; theme: string }) {
  const { demographic, cefr_level, theme } = args;
  const demoKey = (['kids', 'teens', 'adults'].includes(demographic) ? demographic : 'teens');
  const themePool = MASTERCLASS_THEMES[demoKey];

  const systemPrompt = `You are designing a TRIAL MASTERCLASS — a 3-block English lesson engineered as a high-converting sales tool, not a generic class.

GOLDEN RULES (non-negotiable):
- Output EXACTLY 3 slides, in this exact order and slide_type:
  1) drag_and_match    (Confidence Builder)
  2) sentence_builder  (Diagnostic Gap)
  3) roadmap_pitch     (Conversion CTA)
- THEME: pick ONE theme from this premium pool for the ${demoKey} demographic: ${themePool.map(t => `"${t}"`).join(', ')}. Use the learner hint "${theme}" only to choose which of those themes fits best. NEVER invent generic academic topics like "Daily Routines", "My Family", "Colors", "Hobbies", "Animals".
- Calibrate language strictly to CEFR ${cefr_level}.
- Return ONLY valid JSON, no markdown, no commentary.

BLOCK 1 — Confidence Builder (drag_and_match):
- EXACTLY 4 pairs.
- Use ELEVATED-but-recognizable vocabulary tied to the chosen theme (e.g. "Currency" over "Money", "Investment" over "Saving", "Itinerary" over "Plan", "Negotiate" over "Talk"). Avoid baby words.
- Every pair MUST include left_thumbnail_keyword AND right_thumbnail_keyword (one concrete noun each) so premium icons can be rendered.

BLOCK 2 — Diagnostic Gap (sentence_builder):
- EXACTLY 2 sentences.
- sentences[0]: simple S-V-O, scrambled "words" array + "answer" array, difficulty "easy". Builds momentum.
- sentences[1] is THE TRAP: a sentence intentionally relying on ONE of these pitfalls — false_cognate | preposition | tense_shift | article. Mark difficulty "hard". MUST include:
    * trap_type: one of the four enum values above
    * teacher_note: 1–2 sentences telling the teacher exactly when and how to intervene
    * expected_student_error: the typical wrong answer learners produce

BLOCK 3 — Roadmap Pitch (roadmap_pitch):
- This is the CTA. interactive_data shape:
    { "headline": "...", "diagnosis": "<one line that explicitly names the SAME grammar gap exposed by Block 2's trap>", "milestones": [ { "weeks": "1–2", "focus": "..." }, { "weeks": "3–6", "focus": "..." }, { "weeks": "7–12", "focus": "..." } ], "cta": "Book your full program" }
- diagnosis AND milestones[0].focus MUST explicitly reference the trap_type from Block 2. This is what makes it a sales tool.`;

  const userPrompt = `Demographic: ${demoKey}
CEFR: ${cefr_level}
Learner hint: "${theme}"

Return ONLY the JSON described in the system prompt, with EXACTLY 3 slides in the order: drag_and_match → sentence_builder → roadmap_pitch.`;

  try {
    const ai = await callAIWithFailover({
      systemPrompt,
      userPrompt,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash',
      jsonMode: true,
      temperature: 0.7,
    });
    const cleaned = ai.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let lesson: any;
    try { lesson = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      lesson = m ? JSON.parse(m[0]) : null;
    }
    if (!lesson || !Array.isArray(lesson.slides)) {
      return jsonResponse({ error: 'AI returned an unparseable masterclass.' }, 502);
    }

    // ─── Server-side guards ───
    const EXPECTED = ['drag_and_match', 'sentence_builder', 'roadmap_pitch'];
    lesson.slides = lesson.slides.slice(0, 3);
    lesson.slides.forEach((s: any, i: number) => {
      if (s.slide_type !== EXPECTED[i]) s.slide_type = EXPECTED[i];
      s.interactive_data = s.interactive_data || {};
    });
    if (lesson.slides.length !== 3) {
      return jsonResponse({ error: 'Masterclass must produce exactly 3 blocks.' }, 502);
    }

    // Block 1: exactly 4 pairs
    const b1 = lesson.slides[0].interactive_data;
    if (!Array.isArray(b1.pairs) || b1.pairs.length === 0) {
      return jsonResponse({ error: 'Block 1 (drag_and_match) missing pairs.' }, 502);
    }
    b1.pairs = b1.pairs.slice(0, 4);
    if (b1.pairs.length < 4) {
      return jsonResponse({ error: 'Block 1 must contain exactly 4 pairs.' }, 502);
    }
    b1.premium_visuals = true;

    // Block 2: exactly 2 sentences, second carries trap metadata
    const b2 = lesson.slides[1].interactive_data;
    if (!Array.isArray(b2.sentences) || b2.sentences.length < 2) {
      return jsonResponse({ error: 'Block 2 (sentence_builder) needs 2 sentences.' }, 502);
    }
    b2.sentences = b2.sentences.slice(0, 2);
    const trap = b2.sentences[1];
    const validTraps = ['false_cognate', 'preposition', 'tense_shift', 'article'];
    if (!validTraps.includes(trap.trap_type)) trap.trap_type = 'preposition';
    if (!trap.teacher_note || String(trap.teacher_note).trim().length < 10) {
      trap.teacher_note = `Watch for the ${trap.trap_type.replace('_', ' ')} pitfall — step in the moment the student hesitates and model the correct form aloud.`;
    }
    if (!trap.expected_student_error) trap.expected_student_error = '(typical learner slip)';

    // Block 3: diagnosis MUST tie back to Block 2 trap_type
    const b3 = lesson.slides[2].interactive_data;
    const trapTemplate = TRAP_TEMPLATES[trap.trap_type] || TRAP_TEMPLATES.preposition;
    const trapKeyword = trap.trap_type.split('_')[0];
    if (!b3.diagnosis || !String(b3.diagnosis).toLowerCase().includes(trapKeyword)) {
      b3.diagnosis = `Your trial revealed one specific gap: ${trapTemplate}.`;
    }
    if (!Array.isArray(b3.milestones) || b3.milestones.length < 3) {
      b3.milestones = [
        { weeks: '1–2', focus: `Drill ${trapTemplate}` },
        { weeks: '3–6', focus: 'Expand into spontaneous conversation on real-world themes' },
        { weeks: '7–12', focus: 'Polish fluency, accent and professional register' },
      ];
    } else if (!String(b3.milestones[0].focus || '').toLowerCase().includes(trapKeyword)) {
      b3.milestones[0].focus = `Drill ${trapTemplate}`;
    }
    if (!b3.headline) b3.headline = 'Your Personal Roadmap to Fluency';
    if (!b3.cta) b3.cta = 'Book your full program';

    return jsonResponse({ lesson, provider: ai.provider, mode: 'masterclass' });
  } catch (e: any) {
    if (e?.status === 429) return jsonResponse({ error: 'Rate limited — try again shortly.' }, 429);
    if (e?.status === 402) return jsonResponse({ error: 'Credits exhausted.' }, 402);
    return jsonResponse({ error: e?.message || 'AI generation temporarily unavailable.' }, 503);
  }
}

// ─── Action: generate_story (graded reader + comprehension) ─────────
const STORY_STYLE_MODIFIERS: Record<string, string> = {
  classic: ", in the style of a warm children's storybook illustration, soft watercolor, gentle lighting",
  comic_western: ', in the style of a modern western comic book, vibrant colors, dynamic ink lines, halftone shading, action-packed composition',
  manga_rtl: ', in the style of Japanese manga, black and white, screentone shading, high contrast, dramatic angles, expressive linework',
  webtoon: ', in the style of a modern colorful webtoon manhwa, digital art, soft cel shading, bright lighting, clean vertical composition',
};

function injectStyle(prompt: string, modifier: string): string {
  const base = (prompt || '').trim().replace(/[.,]+$/, '');
  return base ? `${base}${modifier}` : `An illustrated scene${modifier}`;
}

async function handleGenerateStory(body: any) {
  const {
    cefr_level = 'B1',
    cefrLevel,                          // accept camelCase from frontend
    genre,
    topic,                              // explicit topic
    target_vocabulary = [],
    target_grammar,
    targetGrammar,                      // camelCase alias
    linked_lesson = null,
    visual_style: rawStyle = 'classic',
    art_style: artStyleAlias,
    artStyle,                           // camelCase alias
    starring_character = null,
    custom_prompt = '',
  } = body;

  // Normalize aliases
  const cefr = String(cefrLevel || cefr_level || 'B1').toUpperCase();
  const resolvedTopic = String(topic || genre || 'Everyday Life');

  // Map friendly artStyle names → internal visual_style slugs.
  const styleAliasMap: Record<string, string> = {
    manga: 'manga_rtl',
    'manga rtl': 'manga_rtl',
    webtoon: 'webtoon',
    manhwa: 'webtoon',
    comic: 'comic_western',
    'comic western': 'comic_western',
    western: 'comic_western',
    storybook: 'classic',
    classic: 'classic',
  };
  const rawStyleInput = String(artStyle || artStyleAlias || rawStyle || 'classic').toLowerCase().trim();
  const mappedStyle = styleAliasMap[rawStyleInput] || rawStyleInput;
  const visual_style = (['classic', 'comic_western', 'manga_rtl', 'webtoon'].includes(mappedStyle)
    ? mappedStyle
    : 'classic') as 'classic' | 'comic_western' | 'manga_rtl' | 'webtoon';
  const isPaneled = visual_style !== 'classic';
  const styleModifier = STORY_STYLE_MODIFIERS[visual_style];

  // Friendly artStyle label restated in the prompt.
  const artStyleLabel = (() => {
    switch (visual_style) {
      case 'manga_rtl': return 'Manga (black-and-white, screentone, dramatic angles)';
      case 'webtoon': return 'Webtoon manhwa (vertical scroll, soft cel-shading, bright digital color)';
      case 'comic_western': return 'Western comic book (vibrant ink, halftone, dynamic action)';
      default: return "Children's storybook illustration (warm watercolor)";
    }
  })();

  if (!Array.isArray(target_vocabulary) || target_vocabulary.length < 3) {
    return jsonResponse({ error: 'target_vocabulary must be an array of at least 3 words' }, 400);
  }

  // Build optional grounding block when a curriculum lesson is linked.
  let groundingBlock = '';
  let groundingUserBlock = '';
  let resolvedGrammar = String(targetGrammar || target_grammar || '').trim();
  if (linked_lesson && typeof linked_lesson === 'object') {
    const ll: any = linked_lesson;
    const llTopic = ll.topic || ll.title || '';
    const llVocab: string[] = Array.isArray(ll.vocabulary)
      ? ll.vocabulary.filter((w: any) => typeof w === 'string' && w.trim().length > 0)
      : [];
    const grammar = typeof ll.grammar_pattern === 'string' ? ll.grammar_pattern.trim() : '';
    if (!resolvedGrammar && grammar) resolvedGrammar = grammar;
    const desc = typeof ll.description === 'string' ? ll.description.trim() : '';

    groundingBlock = `

You are writing a Graded Reader story tied to a SPECIFIC curriculum lesson.
You MUST base this story on the following lesson topic: "${llTopic}".
${desc ? `Lesson context: ${desc}\n` : ''}You MUST naturally integrate ALL of the following target vocabulary at least once: ${llVocab.map((w) => `"${w}"`).join(', ') || '(none)'}.
${grammar ? `You MUST faithfully demonstrate this grammar pattern in context: ${grammar}.\n` : ''}Stay strictly within CEFR ${cefr} sentence length and complexity. Do NOT introduce vocabulary above this level except where listed.`;

    groundingUserBlock = `

Linked Curriculum Lesson:
- Title: ${ll.title || ''}
- Topic: ${llTopic}
${grammar ? `- Grammar focus: ${grammar}\n` : ''}- Lesson vocabulary: ${llVocab.join(', ') || '(none)'}`;
  }

  // ── Style-specific schema instructions ──
  const panelGuidance = (() => {
    switch (visual_style) {
      case 'comic_western':
        return 'Each page is a comic page with 3 to 5 panels arranged in a Western-comic grid. Use panel "size" values: "full" (a splash), "wide" (landscape), "tall" (vertical action), "square" (default). Reading flows LEFT to RIGHT.';
      case 'manga_rtl':
        return 'Each page is a manga page with 3 to 5 panels. Use panel "size" values: "full", "wide", "tall", "square". Reading flows RIGHT to LEFT (Japanese manga order). Favor dramatic angles and silent panels with caption-only beats.';
      case 'webtoon':
        return 'Each page is one webtoon scroll with 6 to 10 panels stacked vertically (single column). Use panel "size" "wide" or "tall"; "square" sparingly. Reading flows TOP to BOTTOM with narrative beats spaced to feel like scrolling.';
      default:
        return '';
    }
  })();

  const slideShape = isPaneled
    ? `{
      "page_number": 1,
      "narrative": "<short narration / scene-setter, 1-2 sentences ${cefr}>",
      "panels": [
        {
          "image_prompt": "<hyper-specific scene; restate character core features and the artStyle>",
          "size": "full | wide | tall | square",
          "caption": "<optional narration, may be empty>",
          "dialogue": [
            { "speaker": "<name or '' for thought>", "text": "<short line, ${cefr}>" }
          ]
        }
      ]
    }`
    : `{ "page_number": 1, "narrative": "<2-4 sentences appropriate for ${cefr}>", "image_prompt": "<hyper-specific scene; restate character core features and the artStyle>" }`;

  const pageCountRule = isPaneled
    ? (visual_style === 'webtoon'
        ? '- Produce exactly 1 webtoon "page" containing 6 to 10 panels.'
        : '- Produce 4 or 5 pages, each with 3 to 5 panels.')
    : '- 4 or 5 narrative pages.';

  // ── Casting Director block ──
  let castingBlock = '';
  if (starring_character && typeof starring_character === 'object') {
    const cName = String((starring_character as any).name || '').trim();
    const cPersona = String((starring_character as any).personality_traits || '').trim();
    const cVisual = String((starring_character as any).visual_blueprint || '').trim();
    if (cName) {
      castingBlock = `\n\n[CASTING INSTRUCTIONS]\n` +
        `You must feature the following character as the main subject of this content.\n` +
        `Name: ${cName}\n` +
        `Personality & Role: ${cPersona || '(not specified — infer a consistent voice)'}\n` +
        `Rule: Write their dialogue and actions to perfectly match this personality. Ensure they are the one interacting with the target vocabulary. Do not invent a different main character.\n\n` +
        `[VOCABULARY RULE]\n` +
        `For every vocabulary word that appears, the example sentence MUST feature ${cName} as the subject performing the action or experiencing the word. Instead of "The dog ran fast", write "${cName} ran fast". Align every sentence with their personality: ${cPersona || '(consistent recurring voice)'}.\n\n` +
        `[ACTIVITY RULE]\n` +
        `When generating comprehension questions, quiz items, or roleplay prompts, base the context entirely around ${cName}. Formulate questions like "What did ${cName} do?" or "Help ${cName} choose the right word." Every activity prompt must reference ${cName} by name.\n\n` +
        `[ART DIRECTION RULE]\n` +
        `Every image_prompt — including vocabulary illustrations and activity slides — MUST feature ${cName}. You must use this exact visual description for them verbatim: "${cVisual}". Do not invent new visual traits for them.`;
    }
  }

  // ── MASTER DEVELOPER SYSTEM PROMPT ──
  const systemPrompt = `You are an award-winning comic book writer and an expert ESL (English as a Second Language) curriculum designer. Your job is to generate educational comics that are deeply engaging, emotionally resonant, and perfectly tailored to the user's CEFR level.${castingBlock}

RULES:
- Pedagogy First: Strictly adhere to the vocabulary and sentence complexity of the requested CEFR level. If the level is A1, use simple sentences but KEEP the emotional hook. If B2, use idioms and complex clauses.
- Show, Don't Tell: Do not write "Leo is sad." Write dialogue that shows it: "I don't want to go in there," Leo mumbled.
- Target Grammar: You must naturally weave the requested targetGrammar into the dialogue at least 3 times.
- Visual Consistency: In your image_prompt fields, you must be hyper-specific so the Image AI keeps characters consistent. Always restate the character's core features (e.g., "Leo, a 10-year-old boy with messy brown hair and a blue backpack..."). Include the requested artStyle in every single image prompt.
- Structure: Every story must have a Hook (Panel 1), Conflict/Action (Panels 2-3), and a Resolution or Cliffhanger (Panels 4-5).

You must return ONLY a raw JSON object matching the required schema (title, panels array with narration, dialogue, and image_prompt).

CONTEXT FOR THIS GENERATION:
- CEFR Level: ${cefr}
- Topic: "${resolvedTopic}"
- targetGrammar: ${resolvedGrammar ? `"${resolvedGrammar}"` : '(none specified — pick a grammar pattern appropriate for ' + cefr + ' and use it 3+ times)'}
- artStyle: ${artStyleLabel} — RESTATE this style verbatim inside every image_prompt.
${panelGuidance ? '\nPANEL LAYOUT:\n' + panelGuidance + '\n' : ''}
OUTPUT FORMAT:
- Return ONLY valid JSON. No markdown fences, no commentary, no trailing text.
- End the story with exactly 2 reading-comprehension multiple-choice questions.${groundingBlock}`;

  const teacherBriefBlock = (typeof custom_prompt === 'string' && custom_prompt.trim())
    ? `\n\nTEACHER BRIEF (highest-priority creative direction — honor this verbatim):\n"""${custom_prompt.trim()}"""\n`
    : '';

  const userPrompt = `Topic: "${resolvedTopic}"${teacherBriefBlock}
CEFR Level: ${cefr}
artStyle: ${artStyleLabel}
${resolvedGrammar ? `targetGrammar (use 3+ times in dialogue): "${resolvedGrammar}"` : ''}
Target Vocabulary (each MUST appear naturally somewhere in the story): ${target_vocabulary.map((w: string) => `"${w}"`).join(', ')}${groundingUserBlock}

Return ONLY this JSON shape:
{
  "title": "<engaging, specific title — never generic>",
  "slides": [
    ${slideShape}
  ],
  "comprehension": [
    { "question": "<inferential question about the story>", "options": ["A","B","C","D"], "correct_index": 0 },
    { "question": "<another question testing understanding>", "options": ["A","B","C","D"], "correct_index": 2 }
  ]
}

Rules:
${pageCountRule}
- Exactly 2 comprehension questions, each with 4 plausible options.
- Use every target vocabulary word at least once across the story.
${resolvedGrammar ? `- The targetGrammar "${resolvedGrammar}" MUST appear in dialogue at least 3 times.` : ''}
- Keep grammar and sentence length faithful to ${cefr}.
- Story arc: Hook (panel 1) → Conflict/Action (panels 2-3) → Resolution or Cliffhanger (panels 4-5).
${isPaneled ? '- Every panel image_prompt MUST restate the main character\'s core visual features (age, hair, clothing) AND the artStyle. Dialogue lines short (max ~14 words). Use "" as speaker for narration captions.' : '- Every page image_prompt MUST restate the main character\'s core visual features (age, hair, clothing) AND the artStyle.'}`;

  try {
    const ai = await callAIWithFailover({
      systemPrompt,
      userPrompt,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash',
      jsonMode: true,
      temperature: 0.9,
    });
    const cleaned = ai.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let story: any;
    try { story = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      story = m ? JSON.parse(m[0]) : null;
    }
    if (!story || !Array.isArray(story.slides)) {
      return jsonResponse({ error: 'AI returned an unparseable story.' }, 502);
    }

    // ── Inject visual style modifier into every image_prompt ──
    story.visual_style = visual_style;
    for (const slide of story.slides) {
      if (slide && typeof slide === 'object') {
        if (typeof slide.image_prompt === 'string') {
          slide.image_prompt = injectStyle(slide.image_prompt, styleModifier);
        }
        if (Array.isArray(slide.panels)) {
          for (const panel of slide.panels) {
            if (panel && typeof panel === 'object' && typeof panel.image_prompt === 'string') {
              panel.image_prompt = injectStyle(panel.image_prompt, styleModifier);
            }
          }
        }
      }
    }

    return jsonResponse({ story, provider: ai.provider, visual_style });
  } catch (e: any) {
    if (e?.status === 429) return jsonResponse({ error: 'Rate limited — try again shortly.' }, 429);
    if (e?.status === 402) return jsonResponse({ error: 'Credits exhausted.' }, 402);
    return jsonResponse({ error: e?.message || 'AI generation temporarily unavailable.' }, 503);
  }
}


// ─── Action: suggest_vocabulary ─────────────────────────────────────
async function handleSuggestVocabulary(body: any) {
  const cefr = String(body.cefr_level || 'B1').toUpperCase();
  const genre = String(body.genre || 'Everyday Life');
  const linkedTitle = body.linked_lesson_title ? String(body.linked_lesson_title) : '';
  const linkedGrammar = body.linked_grammar ? String(body.linked_grammar) : '';
  const mustIncludeRaw: string[] = Array.isArray(body.must_include) ? body.must_include : [];

  // Normalize must_include (dedupe case-insensitive, trim, cap at 12)
  const mustSeen = new Set<string>();
  const mustInclude: string[] = [];
  for (const w of mustIncludeRaw) {
    const t = String(w || '').trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (mustSeen.has(k)) continue;
    mustSeen.add(k);
    mustInclude.push(t);
    if (mustInclude.length >= 12) break;
  }

  const targetTotal = Math.min(12, Math.max(8, mustInclude.length + 4));

  const systemPrompt = `You are an ESL curriculum vocabulary coach. You return ONLY valid JSON of the shape {"words": ["..."]}. No prose, no markdown, no code fences.`;

  const userPrompt = `Suggest target vocabulary for a graded-reader story.

Constraints (STRICT):
- CEFR level: ${cefr} — every word must be appropriate for this level.
- Genre: ${genre}
${linkedTitle ? `- Linked lesson topic: "${linkedTitle}"` : ''}
${linkedGrammar ? `- Linked grammar pattern: "${linkedGrammar}" (pick words that students can naturally use with this pattern)` : ''}
- Total words: between 5 and 12. Aim for around ${targetTotal}.
- Single lemmas or very short collocations (max 2 words). No sentences.
- Lowercase, no punctuation, no duplicates (case-insensitive).
- MUST include EVERY one of these words verbatim (already from the linked lesson): ${mustInclude.length ? JSON.stringify(mustInclude) : '[] (none)'}
- Fill the remainder with thematically related, ${cefr}-appropriate words tied to the genre and topic.

Return ONLY: {"words": ["word1", "word2", ...]}`;

  try {
    const { text, provider } = await callAIWithFailover({
      systemPrompt,
      userPrompt,
      geminiModel: 'gemini-2.5-flash',
      lovableModel: 'google/gemini-2.5-flash',
      temperature: 0.7,
      jsonMode: true,
    });

    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON object from text
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
    }

    let raw: string[] = Array.isArray(parsed?.words) ? parsed.words.map((w: any) => String(w || '').trim()).filter(Boolean) : [];

    // Dedupe (case-insensitive) preserving order
    const seen = new Set<string>();
    let words: string[] = [];
    for (const w of raw) {
      const k = w.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      words.push(w);
    }

    // Re-inject any missing must_include words (at the front)
    const missing = mustInclude.filter((w) => !seen.has(w.toLowerCase()));
    if (missing.length) {
      words = [...missing, ...words];
      for (const w of missing) seen.add(w.toLowerCase());
    }

    // Cap at 12 (keep must_include first)
    if (words.length > 12) {
      const required = words.filter((w) => mustSeen.has(w.toLowerCase()));
      const optional = words.filter((w) => !mustSeen.has(w.toLowerCase()));
      const remaining = Math.max(0, 12 - required.length);
      words = [...required, ...optional.slice(0, remaining)];
    }

    // Floor at 5: if too short, pad with safe genre fallbacks
    if (words.length < 5) {
      const fallbacks = [
        'discover', 'journey', 'whisper', 'shadow', 'curious',
        'ancient', 'mountain', 'silence', 'stranger', 'memory',
        'courage', 'secret',
      ];
      for (const w of fallbacks) {
        if (words.length >= 5) break;
        const k = w.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        words.push(w);
      }
    }

    return jsonResponse({ words, provider });
  } catch (e: any) {
    if (e?.status === 429) return jsonResponse({ error: 'Rate limited — try again shortly.' }, 429);
    if (e?.status === 402) return jsonResponse({ error: 'AI credits exhausted.' }, 402);
    return jsonResponse({ error: e?.message || 'AI vocabulary suggestion temporarily unavailable.' }, 503);
  }
}

// ─── Main Router ────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Require auth for ALL actions — prevents AI credit abuse by unauthenticated callers.
  const auth = await requireAuth(req);
  if (!auth.ok) return jsonResponse(auth.body, auth.status);

  try {
    const body = await req.json();
    const action = body.action || '';
    // Inject verified userId so handlers never trust client-supplied ids.
    (body as any).__userId = auth.userId;



    switch (action) {
      case 'explain_mistake':
        return await handleExplainMistake(body);
      case 'evaluate_speaking':
        return await handleEvaluateSpeaking(body);
      case 'evaluate_speech':
        return await handleEvaluateSpeech(body, req.headers.get('Authorization'));
      case 'speaking_feedback':
        return await handleSpeakingFeedback(body);
      case 'generate_lesson':
        return await handleGenerateLesson(body);
      case 'generate_trial_lesson':
        return await handleGenerateTrialLesson(body);
      case 'generate_story':
        return await handleGenerateStory(body);
      case 'suggest_vocabulary':
        return await handleSuggestVocabulary(body);
      default:
        return jsonResponse({
          error: `Unknown action: "${action}". Valid: explain_mistake, evaluate_speaking, evaluate_speech, speaking_feedback, generate_lesson, generate_trial_lesson, generate_story, suggest_vocabulary`,
        }, 400);
    }
  } catch (error) {
    console.error('ai-core error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
});
