import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, level, questionCount = 5 } = await req.json();

    if (!topic || !level) {
      return new Response(
        JSON.stringify({ error: 'topic and level are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert English language quiz creator for ESL/EFL learners. 
Create engaging, pedagogically sound quiz questions that test understanding of the given topic at the specified CEFR level.

Rules:
- Questions must be appropriate for the CEFR level
- Mix question types: multiple_choice, fill_in_the_blank, matching, sentence_ordering
- Each question must have a clear correct answer and a brief explanation
- For multiple_choice: provide exactly 4 options
- For fill_in_the_blank: the question should contain a blank indicated by "___"
- For sentence_ordering: provide jumbled words that form a correct sentence
- For matching: provide pairs to match
- Keep language simple and clear for the given level`;

    const userPrompt = `Generate exactly ${questionCount} quiz questions about "${topic}" for CEFR level ${level}.`;

    const response = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_quiz',
              description: 'Create a structured quiz with questions, answers, and explanations',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        questionNumber: { type: 'number' },
                        type: { type: 'string', enum: ['multiple_choice', 'fill_in_the_blank', 'matching', 'sentence_ordering'] },
                        question: { type: 'string' },
                        options: { type: 'array', items: { type: 'string' } },
                        correctAnswer: { type: 'string' },
                        explanation: { type: 'string' },
                      },
                      required: ['questionNumber', 'type', 'question', 'correctAnswer', 'explanation'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['questions'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'create_quiz' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('No tool call response from AI');
    }

    const quizData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        quiz: {
          topic,
          level,
          questions: quizData.questions,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Quiz generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
