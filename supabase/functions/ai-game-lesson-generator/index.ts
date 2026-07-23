import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameLessonRequest {
  topic: string;
  cefrLevel: string;
  ageGroup: string;
  duration: number; // in minutes
  gameType?: 'story_adventure' | 'collection_quest' | 'puzzle_challenge' | 'mixed';
  focusSkills?: string[]; // e.g., ['vocabulary', 'grammar', 'pronunciation']
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });


  try {
    const requestData: GameLessonRequest = await req.json();
    const { topic, cefrLevel, ageGroup, duration, gameType = 'story_adventure', focusSkills = ['vocabulary', 'speaking'] } = requestData;

    console.log(`Generating game lesson: ${topic}, ${cefrLevel}, ${duration}min, ${gameType}`);

    // Construct comprehensive prompt for game lesson generation
    const systemPrompt = `You are an expert English language teacher and game designer who creates engaging, educational game-based lessons for children.

Your task is to create a complete interactive game lesson that combines:
- Engaging storytelling with memorable characters
- Clear learning objectives aligned with CEFR ${cefrLevel}
- Interactive game mechanics that reinforce learning
- Age-appropriate content for ${ageGroup}
- Activities that develop ${focusSkills.join(', ')}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "lesson_title": "Engaging title with the topic",
  "story_theme": "Brief theme description",
  "characters": [
    {
      "name": "Character name",
      "type": "friendly_teacher|story_narrator|animal_friend|magical_guide|playful_character",
      "personality": "Brief personality traits",
      "role": "Role in the story"
    }
  ],
  "learning_objectives": ["objective 1", "objective 2", "objective 3"],
  "vocabulary": [
    {"word": "word", "definition": "simple definition", "example": "example sentence"}
  ],
  "story_narrative": "Engaging story that introduces the lesson context",
  "game_slides": [
    {
      "slide_type": "story_intro|vocabulary_preview|interactive_game|practice_activity|celebration",
      "title": "Slide title",
      "content": {
        "text": "Main text content",
        "character_speaking": "Character name or null",
        "dialogue": "What the character says",
        "activity_type": "bubble_pop|matching|drag_drop|speaking_practice|fill_blank",
        "activity_data": {
          "instructions": "Clear instructions",
          "items": ["item1", "item2"],
          "correct_answers": ["answer1"]
        }
      },
      "duration_seconds": 30
    }
  ],
  "total_slides": 0,
  "estimated_duration": 0
}`;

    const userPrompt = `Create a ${duration}-minute ${gameType} game lesson about "${topic}" for ${cefrLevel} level students (${ageGroup}).

The lesson should:
1. Start with an engaging story introduction featuring memorable characters
2. Teach 5-8 key vocabulary words related to "${topic}"
3. Include ${Math.floor(duration / 2)} interactive game activities
4. Use ${gameType === 'story_adventure' ? 'narrative-driven challenges' : gameType === 'collection_quest' ? 'collecting and organizing activities' : 'puzzle-solving games'}
5. End with a celebration/achievement slide
6. Focus on developing: ${focusSkills.join(', ')}

Make it fun, engaging, and educationally effective!`;

    const response = await aiFetch('https://ai-gateway.internal/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Raw AI response:', generatedContent.substring(0, 200));

    // Parse the JSON response
    let lessonData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
      lessonData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', generatedContent);
      throw new Error('Failed to parse AI-generated lesson data');
    }

    // Add metadata
    lessonData.metadata = {
      generated_at: new Date().toISOString(),
      request_params: { topic, cefrLevel, ageGroup, duration, gameType, focusSkills }
    };

    // Calculate totals
    lessonData.total_slides = lessonData.game_slides?.length || 0;
    lessonData.estimated_duration = lessonData.game_slides?.reduce(
      (sum: number, slide: any) => sum + (slide.duration_seconds || 30), 
      0
    ) || 0;

    console.log(`Successfully generated game lesson with ${lessonData.total_slides} slides`);

    return new Response(
      JSON.stringify(lessonData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-game-lesson-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate game lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
