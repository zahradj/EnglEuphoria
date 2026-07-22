import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parseAIJson } from "../_shared/aiJson.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateWelcomeLessonPrompt } from "../_shared/welcomeLessonPromptTemplate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { lessonNumber = 1, mascotName = "Benny", userId } = await req.json();

    console.log(`Generating Welcome Lesson ${lessonNumber} with mascot ${mascotName}`);

    const prompt = generateWelcomeLessonPrompt({ lessonNumber, mascotName });

    const response = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert ESL curriculum designer. Return only valid JSON, no markdown or explanations."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse JSON from response
    let lessonData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lessonData = parseAIJson(jsonMatch[0], "generate-welcome-lesson");
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse lesson data");
    }

    // Save to database if userId provided
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: insertError } = await supabase
        .from("early_learners_lessons")
        .insert({
          title: lessonData.title || `Welcome Lesson ${lessonNumber}`,
          topic: "Welcome Adventure",
          phonics_focus: "greetings",
          lesson_number: lessonNumber,
          difficulty_level: "beginner",
          duration_minutes: 30,
          learning_objectives: lessonData.learningObjectives || [],
          components: lessonData,
          gamification: lessonData.gamification || {},
          multimedia_manifest: lessonData.multimedia || {},
          status: "draft",
          created_by: userId
        });

      if (insertError) {
        console.error("Database insert error:", insertError);
      } else {
        console.log("Welcome lesson saved to database");
      }
    }

    return new Response(JSON.stringify({ success: true, lesson: lessonData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating welcome lesson:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
