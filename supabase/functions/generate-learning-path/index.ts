import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LearningPathRequest {
  interests: string[];
  level: 'playground' | 'academy' | 'professional';
  cefrLevel?: string;
}

const systemPrompt = `You are an expert ESL curriculum designer specializing in personalized learning for students of all ages. Create engaging, age-appropriate content that matches student interests. Always respond with valid JSON only.`;

const getLevelGuidance = (level: string): string => {
  switch (level) {
    case 'playground':
      return '- Use simple vocabulary, games, songs, and colorful activities\n- Focus on fun, play-based learning\n- Include lots of visual elements and movement activities\n- Short attention span activities (5-10 minutes each)';
    case 'academy':
      return '- Include social scenarios, trending topics, and interactive challenges\n- Use contemporary language and relatable situations\n- Include group activities and peer interaction opportunities\n- Medium complexity activities (15-20 minutes each)';
    case 'professional':
      return '- Focus on business communication, formal writing, and career skills\n- Include professional scenarios and workplace vocabulary\n- Emphasize practical, real-world application\n- Comprehensive activities (20-30 minutes each)';
    default:
      return '';
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { interests, level, cefrLevel = 'A1' } = await req.json() as LearningPathRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating learning path for ${level} level with interests:`, interests);

    const userPrompt = `Act as an expert ESL Teacher. Create a 4-week personalized English learning path for a student in the "${level}" track who loves ${interests.join(', ')}.

Current CEFR Level: ${cefrLevel}

Track-specific guidance:
${getLevelGuidance(level)}

Create a structured curriculum with exactly this JSON format:
{
  "path_name": "string - creative name for this learning journey",
  "total_weeks": 4,
  "total_lessons": 20,
  "weeks": [
    {
      "week_number": 1,
      "theme": "string - theme related to student interests",
      "focus_skill": "speaking|reading|writing|listening",
      "lessons": [
        {
          "lesson_number": 1,
          "title": "string",
          "skill_focus": "speaking|reading|writing|listening|vocabulary|grammar",
          "activity_type": "game|conversation|reading|writing|listening|quiz|project",
          "duration_minutes": 15,
          "difficulty_level": 1-10,
          "description": "Brief description of lesson content"
        }
      ]
    }
  ],
  "learning_objectives": ["string array of 3-5 main learning goals"]
}

Include 5 lessons per week (20 total). Make themes connect to the student's interests: ${interests.join(', ')}.`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let learningPath;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      learningPath = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Failed to parse learning path from AI response");
    }

    console.log("Successfully generated learning path:", learningPath.path_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        learningPath,
        metadata: {
          level,
          interests,
          cefrLevel,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating learning path:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
