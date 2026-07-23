import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { parseAIJson } from "../_shared/aiJson.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const _auth = await requireAuth(req);
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });


  try {
    const body = await req.json();
    const mode: 'academy' | 'hub' = body.mode || 'academy';

    // ─── ACADEMY: Teen Daily Challenge ─────────────────────────────────────
    if (mode === 'academy') {
      const { cefrLevel, interests, lastMistake, learningStyle, weeklyGoal } = body;

      const interestsList = interests?.length > 0 ? interests.join(', ') : 'gaming, music, social media';
      const mistake = lastMistake || 'verb tenses';
      const styleHint = learningStyle || 'mixed';
      const goalCtx = weeklyGoal ? `Their weekly goal is: "${weeklyGoal}".` : '';

      const systemPrompt = `You are a cool, engaging ESL teacher for teenagers. Create punchy, relevant daily English challenges that feel exciting, not like homework. Always return valid JSON only.`;

      const userPrompt = `Create a fun, personalized 10-minute English daily challenge for a TEEN student.

Student Profile:
- CEFR Level: ${cefrLevel || 'A2'}
- Interests: ${interestsList}
- Last grammar mistake (fix this): ${mistake}
- Learning style: ${styleHint}
${goalCtx}

Requirements:
1. The topic MUST connect to their interests (${interestsList}) — make it feel relevant and cool
2. Fix their "${mistake}" mistake by weaving the correct usage naturally into the quiz
3. Vocabulary must feel real and usable, not textbook-dry
4. Quiz questions should be quick and satisfying to answer

Return ONLY this exact JSON (no markdown, no explanation):
{
  "title": "Engaging lesson title using their interests",
  "theme": "main interest topic used",
  "vocabularySpotlight": [
    {
      "word": "example",
      "pronunciation": "/ɪɡˈzɑːmpəl/",
      "definition": "clear, teen-friendly definition",
      "example": "Natural sentence using this word in a ${interestsList} context"
    }
  ],
  "quiz": [
    {
      "id": 1,
      "question": "Question that fixes their '${mistake}' mistake OR tests vocabulary",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}

RULES:
- vocabularySpotlight: exactly 5 words
- quiz: exactly 3 questions (at least 1 must address the "${mistake}" mistake)
- correctIndex is 0-based (0, 1, 2, or 3)
- Keep language contemporary and engaging for teens`;

      const response = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.75,
          max_tokens: 1800,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI gateway error:", response.status, errText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ success: false, error: "AI credits depleted. Please add funds." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in AI response");

      let lesson;
      try {
        const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        lesson = parseAIJson(clean, "generate-daily-lesson");
      } catch {
        console.error("Parse error:", content);
        throw new Error("Invalid JSON in AI response");
      }

      if (!lesson.title || !lesson.vocabularySpotlight || !lesson.quiz) {
        throw new Error("Incomplete lesson structure from AI");
      }

      return new Response(JSON.stringify({ success: true, lesson }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ─── HUB: Adult Professional Weekly Briefing ────────────────────────────
    if (mode === 'hub') {
      const { cefrLevel, interests, recentTopics, sessionsThisWeek, avgScore, streak } = body;

      const interestsList = interests?.length > 0 ? interests.join(', ') : 'business, leadership';
      const topicList = recentTopics?.length > 0 ? recentTopics.join(', ') : 'professional communication';
      const sessions = sessionsThisWeek ?? 0;
      const score = avgScore ?? 80;
      const days = streak ?? 0;

      const systemPrompt = `You are an elite executive English coach delivering sharp, data-driven weekly performance briefings for adult professionals. Be insightful, concise, and motivating. Return valid JSON only.`;

      const userPrompt = `Generate a personalized weekly English learning briefing for an adult professional.

Student Profile:
- CEFR Level: ${cefrLevel || 'B1'}
- Professional interests: ${interestsList}
- Topics studied this week: ${topicList}
- Sessions completed: ${sessions}
- Average session score: ${score}%
- Current streak: ${days} days

Create a briefing that:
1. Identifies ONE specific, concrete improvement area from their topics (make it feel personal and data-driven)
2. Calculates a realistic improvement % (between 5-25%) based on their score
3. Recommends ONE specific next focus area tied to their interests
4. Provides sharp, actionable language insight for the coming week

Return ONLY this exact JSON (no markdown, no explanation):
{
  "improvementArea": "specific skill they improved (e.g. 'executive vocabulary range')",
  "improvementPct": 12,
  "focusArea": "Next recommended topic (e.g. 'Negotiation Closers')",
  "weeklyInsight": "One sharp, specific insight sentence (max 20 words) about their learning this week",
  "actionTip": "One concrete action they can take this week (max 15 words)"
}`;

      const response = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Hub AI gateway error:", response.status, errText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ success: false, error: "AI credits depleted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        throw new Error(`Hub AI gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in hub AI response");

      let briefing;
      try {
        const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        briefing = parseAIJson(clean, "generate-daily-lesson");
      } catch {
        console.error("Hub parse error:", content);
        throw new Error("Invalid JSON in hub AI response");
      }

      return new Response(JSON.stringify({ success: true, briefing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown mode" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("generate-daily-lesson error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
