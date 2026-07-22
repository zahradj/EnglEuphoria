import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
import { requireAuth } from "../_shared/authGuard.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'content_creator', 'teacher'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { content, level, activityTypes, customInstructions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    if (!content || !activityTypes?.length) {
      return new Response(JSON.stringify({ error: 'content and activityTypes are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tools = [{
      type: "function",
      function: {
        name: "generate_activities",
        description: "Generate structured interactive activities from lesson content",
        parameters: {
          type: "object",
          properties: {
            activities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["matching", "fill-blank", "quiz", "sorting", "drag-drop"] },
                  content: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      question: { type: "string" },
                      sentence: { type: "string" },
                      answer: { type: "string" },
                      pairs: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: { left: { type: "string" }, right: { type: "string" } },
                          required: ["left", "right"]
                        }
                      },
                      options: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            text: { type: "string" },
                            isCorrect: { type: "boolean" }
                          },
                          required: ["id", "text", "isCorrect"]
                        }
                      },
                      items: {
                        type: "array",
                        items: { type: "string" }
                      },
                      instructions: { type: "string" }
                    }
                  }
                },
                required: ["type", "content"]
              }
            }
          },
          required: ["activities"]
        }
      }
    }];

    const systemPrompt = `You are an expert ESL activity designer. Create interactive activities from the lesson content provided.

Level: ${level}
Requested activity types: ${activityTypes.join(', ')}
${customInstructions ? `Special instructions: ${customInstructions}` : ''}

Rules:
- Each activity must be pedagogically sound for ${level} level
- Matching: provide 4-6 pairs connecting related items
- Fill-blank: use ___ for the blank, provide the correct answer
- Quiz: provide 4 options with exactly one correct answer, include unique IDs
- Sorting: provide 4-6 items that should be arranged in a specific order
- Make activities engaging and contextually relevant to the lesson content
- Generate one activity per requested type`;

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
          { role: 'user', content: `Generate ${activityTypes.length} interactive activities from this lesson content:\n\n${content}` }
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_activities" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'Credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', status, text);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const activities = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(activities), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-activity-generator:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
