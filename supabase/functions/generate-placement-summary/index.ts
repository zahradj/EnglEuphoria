import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { scorePercentage, studentLevel, strengths, areasForGrowth, studentName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneGuides: Record<string, string> = {
      playground: "enthusiastic, encouraging, using simple words and lots of emojis. Address them like a friendly cartoon character would.",
      academy: "cool and supportive, using modern language teens relate to. Include 1-2 relevant emojis. Sound like a supportive older sibling.",
      professional: "professional yet warm, focusing on practical outcomes and career relevance. Be concise and data-driven.",
    };

    const tone = toneGuides[studentLevel] || toneGuides.professional;
    const name = studentName || "learner";

    const systemPrompt = `You are a friendly English learning assistant. Generate a short, personalized assessment summary. Be ${tone}`;

    const userPrompt = `Generate a 2-3 sentence personalized summary for ${name} who just completed a placement test.

Details:
- Score: ${scorePercentage}%
- Student Type: ${studentLevel} (${studentLevel === 'playground' ? 'ages 4-10' : studentLevel === 'academy' ? 'ages 11-17' : 'adult professional'})
- Strengths identified: ${strengths?.join(', ') || 'general comprehension'}
- Areas to improve: ${areasForGrowth?.join(', ') || 'vocabulary expansion'}

Write a short summary (2-3 sentences max) that:
1. Acknowledges their score positively
2. Mentions one strength
3. Ends with an encouraging note about their learning journey

Return ONLY the summary text, no JSON, no quotes.`;

    const response = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary in AI response");
    }

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-placement-summary error:", error);
    
    // Return fallback summaries based on level
    const { studentLevel, scorePercentage } = await req.json().catch(() => ({}));
    
    const fallbacks: Record<string, string> = {
      playground: `Wow, you're a superstar! 🌟 You got ${scorePercentage || 80}% right! Your adventure in The Playground starts now - let's learn together!`,
      academy: `Nice work! You scored ${scorePercentage || 75}% on the assessment. Your grammar skills are solid, and we're going to level up your vocabulary together. Welcome to The Academy! 🎯`,
      professional: `Assessment complete. Your score of ${scorePercentage || 70}% indicates solid foundational skills. Your personalized curriculum is ready to accelerate your professional English development.`,
    };
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: fallbacks[studentLevel] || fallbacks.professional,
        fallback: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
