import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { generateEarlyLearnerPrompt } from '../_shared/lessonPromptTemplate.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateLessonRequest {
  topic: string;
  phonicsFocus: string;
  lessonNumber: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: GenerateLessonRequest = await req.json();
    console.log('Generating Early Learner lesson:', requestData);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const fullPrompt = generateEarlyLearnerPrompt({
      topic: requestData.topic,
      phonicsFocus: requestData.phonicsFocus,
      lessonNumber: requestData.lessonNumber,
      difficultyLevel: requestData.difficultyLevel,
      learningObjectives: requestData.learningObjectives
    });

    const response = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: fullPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
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

    let lessonData;
    try {
      const cleanedContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
      lessonData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', generatedContent);
      throw new Error('Failed to parse AI-generated lesson data');
    }

    lessonData.metadata = {
      generated_at: new Date().toISOString(),
      request_params: requestData,
      ai_model: 'google/gemini-2.5-flash'
    };

    console.log('Lesson generated successfully');

    return new Response(
      JSON.stringify(lessonData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-early-learner-lesson:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
