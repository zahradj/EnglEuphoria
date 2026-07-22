import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ─── Helpers ──────────────────────────────────────────────────────────────
const wordInText = (word: string, text: string) => {
  if (!word || !text) return false;
  const safe = word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${safe}\\b`, 'i').test(text);
};

function findMissingVocab(vocab: string[], src: string): string[] {
  return (vocab || []).filter((w) => !wordInText(w, src));
}

interface QuizCheck { index: number; reason: string }
function findBadQuizSlides(slides: any[], src: string): QuizCheck[] {
  const bad: QuizCheck[] = [];
  if (!src) return bad;
  slides.forEach((s, i) => {
    if (!s || typeof s !== 'object') return;
    const t = String(s.type || '').toLowerCase();
    // multiple choice
    if (t === 'multiple' || t === 'multiple_choice') {
      const opts: string[] = Array.isArray(s.options) ? s.options : [];
      const idx = Number(s.correctIndex);
      const correct = opts[idx];
      if (typeof correct === 'string' && correct.trim()) {
        // allow either full-string OR any 4+ char token to appear
        const tokens = correct.split(/\s+/).filter((w) => w.length >= 4);
        const hit = wordInText(correct, src) || tokens.some((tok) => wordInText(tok, src));
        if (!hit) bad.push({ index: i, reason: `correct option "${correct}" not in passage` });
      }
    }
    // fill-in-the-blank
    if (t === 'fill_blank' || t === 'fill_in_the_blank' || t === 'fill-in-the-blank' || t === 'cloze') {
      const ans = String(s.answer || s.correctAnswer || '').trim();
      if (ans && !wordInText(ans, src)) {
        bad.push({ index: i, reason: `blank answer "${ans}" not in passage` });
      }
    }
  });
  return bad;
}

async function callAI(apiKey: string, sys: string, user: string, maxTokens = 12000): Promise<any> {
  const resp = await aiFetch(LOVABLE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });
  if (!resp.ok) throw new Error(`AI ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
  const data = await resp.json();
  try { return JSON.parse(data.choices?.[0]?.message?.content || '{}'); } catch { return {}; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'content_creator', 'teacher'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { rawText, hub, level, title, slideCount } = await req.json();
    if (typeof rawText !== 'string' || rawText.trim().length < 60) {
      return new Response(JSON.stringify({ error: 'rawText must be at least 60 characters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const targetHub: 'playground' | 'academy' = hub === 'playground' ? 'playground' : 'academy';
    const targetLevel = level || (targetHub === 'playground' ? 'A1' : 'B1');
    const count = Math.max(8, Math.min(40, Number(slideCount) || (targetHub === 'playground' ? 15 : 25)));

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

    const academySchema = `Each slide is one of these shapes (block field is one of: warmup, vocab, reading, practice, grammar, production, wrapup):
- { "type":"intro", "block":"warmup", "title":string, "subtitle":string }
- { "type":"question", "block":"warmup", "prompt":string, "placeholder":string }
- { "type":"vocab", "block":"vocab", "prompt":string, "items":[{ "word":string, "definition":string, "example":string }] }
- { "type":"matching", "block":"vocab", "prompt":string, "pairs":[{ "left":string, "right":string }] }
- { "type":"reading_passage", "block":"reading", "title":string, "passage":string, "questions":[{ "q":string, "a":string }] }
- { "type":"listening", "block":"reading", "prompt":string, "transcript":string }
- { "type":"multiple", "block":"practice", "question":string, "options":string[], "correctIndex":number }
- { "type":"truefalse", "block":"practice", "statement":string, "answer":boolean }
- { "type":"grammar_pattern", "block":"grammar", "title":string, "pattern":string, "examples":string[] }
- { "type":"reflection", "block":"wrapup", "prompt":string }`;

    const playgroundSchema = `Each slide has: id, type, title, voice:{ text, autoPlay:true }. Types: intro, vocab_card, listen_repeat, matching, drag_drop, multiple_choice, song, story, reflection.`;

    const sys = `You are an expert ESL curriculum designer. Convert the user's raw text into a ready-to-teach ${targetHub === 'playground' ? '30-minute KIDS (ages 6-11)' : '60-minute TEENS/ADULTS'} lesson at CEFR ${targetLevel}.
Output exactly ${count} slides covering: warm-up → vocabulary → reading/listening → practice → production → wrap-up.

🏗️ SEQUENTIAL GENERATION PIPELINE — STRICT ORDER:
  Phase 1 — FOUNDATION: Pick 5 target vocabulary words + 1 core grammar rule. Lock in _lesson_metadata.
  Phase 2 — FLESH: Write a single 120-220 word reading passage that USES ALL 5 vocabulary words and demonstrates the grammar rule. Store in _source_text.
  Phase 3 — JOINTS: Build quiz slides whose correct answers are ALL directly verifiable from _source_text.
  Phase 4 — PAINT: Generate the slides[] array last.

${targetHub === 'academy' ? academySchema : playgroundSchema}

Return STRICT JSON (no markdown):
{
  "_lesson_metadata": { "target_vocab": string[5], "core_grammar": string },
  "_source_text": string,
  "title": string,
  "level": "${targetLevel}",
  "slides": Slide[]
}`;

    const userMsg = `RAW TEXT:\n\n${rawText.slice(0, 8000)}\n\n${title ? `Suggested title: ${title}` : ''}`;

    let parsed = await callAI(apiKey, sys, userMsg);
    if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) throw new Error('AI returned no slides');

    const meta = parsed._lesson_metadata || {};
    const targetVocab: string[] = Array.isArray(meta.target_vocab) ? meta.target_vocab : [];
    let sourceText: string = String(parsed._source_text || '');

    const warnings: string[] = [];
    let retries = 0;
    const MAX_RETRIES = 2;

    // ─── Validation + Retry Loop ───────────────────────────────────────
    for (let round = 0; round < MAX_RETRIES; round++) {
      const missing = findMissingVocab(targetVocab, sourceText);
      const badQuiz = findBadQuizSlides(parsed.slides, sourceText);

      if (missing.length === 0 && badQuiz.length === 0) break;

      retries++;

      // Phase 2 retry — rewrite passage to include missing vocab
      if (missing.length > 0) {
        const fixSys = `Rewrite the reading passage so it naturally includes ALL these words: ${targetVocab.join(', ')}. Keep length 120-220 words and the grammar rule "${meta.core_grammar || ''}". Return JSON: { "_source_text": string }`;
        try {
          const fixed = await callAI(apiKey, fixSys, sourceText || rawText.slice(0, 4000), 1500);
          if (typeof fixed._source_text === 'string' && fixed._source_text.length > 80) {
            sourceText = fixed._source_text;
            parsed._source_text = sourceText;
          }
        } catch (e) {
          warnings.push(`Phase 2 retry failed: ${(e as Error).message}`);
        }
      }

      // Phase 3 retry — regenerate only failing quiz slides
      const stillBad = findBadQuizSlides(parsed.slides, sourceText);
      if (stillBad.length > 0) {
        const indices = stillBad.map((b) => b.index);
        const slimSlides = indices.map((i) => ({ index: i, slide: parsed.slides[i] }));
        const fixSys = `Regenerate ONLY these quiz slides so every correctIndex / answer is directly supported by the passage. Keep the same shape and order. Return JSON: { "fixed": [{ "index": number, "slide": Slide }, ...] }\n\nPASSAGE:\n${sourceText}`;
        try {
          const fixed = await callAI(apiKey, fixSys, JSON.stringify(slimSlides), 4000);
          if (Array.isArray(fixed.fixed)) {
            for (const item of fixed.fixed) {
              if (typeof item.index === 'number' && item.slide) {
                parsed.slides[item.index] = item.slide;
              }
            }
          }
        } catch (e) {
          warnings.push(`Phase 3 retry failed: ${(e as Error).message}`);
        }
      }
    }

    // Final report
    const finalMissing = findMissingVocab(targetVocab, sourceText);
    const finalBadQuiz = findBadQuizSlides(parsed.slides, sourceText);
    if (finalMissing.length > 0) warnings.push(`${finalMissing.length} vocab word(s) still missing from passage: ${finalMissing.join(', ')}`);
    if (finalBadQuiz.length > 0) warnings.push(`${finalBadQuiz.length} quiz slide(s) not verifiable from passage`);

    return new Response(JSON.stringify({
      title: parsed.title || title || 'Untitled lesson',
      level: parsed.level || targetLevel,
      slides: parsed.slides,
      hub: targetHub,
      validation: {
        vocabCoverage: `${targetVocab.length - finalMissing.length}/${targetVocab.length}`,
        quizVerified: `${parsed.slides.filter((s: any) => ['multiple','multiple_choice','truefalse','fill_blank'].includes(String(s.type || '').toLowerCase())).length - finalBadQuiz.length}/${parsed.slides.filter((s: any) => ['multiple','multiple_choice','truefalse','fill_blank'].includes(String(s.type || '').toLowerCase())).length}`,
        retries,
        warnings,
        warnedSlideIndices: finalBadQuiz.map((b) => b.index),
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ai-extract-lesson-from-text error:', err);
    return new Response(JSON.stringify({ error: true, message: (err as Error).message }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
