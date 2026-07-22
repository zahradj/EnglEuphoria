import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type TargetGroup = 'playground' | 'academy' | 'hub';
type GameMode = 'mechanic' | 'context' | 'application';

interface GameRequest {
  targetGroup: TargetGroup;
  topic: string;
  gameMode: GameMode;
  cefrLevel?: string;
  questionCount?: number;
}

function getStyleGuide(group: TargetGroup): string {
  switch (group) {
    case 'playground':
      return `Use fun, simple language suitable for children (ages 5-10).
Include emojis liberally in feedback messages. Reference animals, superheroes, and cartoons.
Use short sentences. Make feedback encouraging and playful.
Example feedback: "🎉 Amazing job! You're a word superhero!"`;
    case 'academy':
      return `Use clean, engaging language for teenagers (ages 11-17).
Balance fun with educational content. Reference relatable social situations.
Use conversational but correct English.
Example feedback: "Nice work! Keep it up!"`;
    case 'hub':
      return `Use professional, concise language for adults.
Include business contexts and real-world scenarios when appropriate.
Keep feedback constructive and formal.
Example feedback: "Correct. This phrasing is appropriate for formal situations."`;
  }
}

function getGamePrompt(mode: GameMode, topic: string, group: TargetGroup, cefrLevel: string, questionCount: number): string {
  const styleGuide = getStyleGuide(group);
  
  switch (mode) {
    case 'mechanic':
      return `Create a multiple-choice grammar drill game about "${topic}" at ${cefrLevel} level.
      
Style Guide: ${styleGuide}

Generate exactly ${questionCount} questions. Each question should:
- Have a fill-in-the-blank format with "___" for the blank
- Have exactly 3 options
- Have clear, helpful feedback explaining why the answer is correct

The game should progressively test understanding of ${topic}.`;

    case 'context':
      return `Create an interactive reading game about "${topic}" at ${cefrLevel} level.

Style Guide: ${styleGuide}

Generate a short story (2-4 sentences) that naturally uses vocabulary related to ${topic}.
Include 4-6 clickable vocabulary words with clear, simple definitions.
The story should be engaging and appropriate for the target audience.`;

    case 'application':
      return `Create a scenario-based roleplay game about "${topic}" at ${cefrLevel} level.

Style Guide: ${styleGuide}

Create a realistic scenario where the learner must choose how to respond.
Include 2-3 response options with varying appropriateness.
Each option should have:
- A score (1-3, where 3 is best)
- Feedback explaining why this response is more or less appropriate
- isCorrect: true only for the best response

The scenario should feel authentic and relevant to real-life situations.`;
  }
}

function getToolDefinition(mode: GameMode) {
  const baseSchema = {
    type: "object" as const,
    required: ["type", "title"],
    additionalProperties: false
  };

  switch (mode) {
    case 'mechanic':
      return {
        type: "function",
        function: {
          name: "create_mechanic_game",
          description: "Create a multiple choice drill game for language learning",
          parameters: {
            ...baseSchema,
            properties: {
              type: { type: "string", enum: ["mechanic"] },
              title: { type: "string", description: "Game title" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    query: { type: "string", description: "The question with ___ for blank" },
                    options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                    correctIndex: { type: "number", description: "0-indexed correct answer" },
                    feedback: { type: "string", description: "Explanation of correct answer" }
                  },
                  required: ["id", "query", "options", "correctIndex", "feedback"],
                  additionalProperties: false
                }
              }
            },
            required: ["type", "title", "questions"]
          }
        }
      };

    case 'context':
      return {
        type: "function",
        function: {
          name: "create_context_game",
          description: "Create an interactive reading game with clickable vocabulary",
          parameters: {
            ...baseSchema,
            properties: {
              type: { type: "string", enum: ["context"] },
              title: { type: "string", description: "Game title" },
              storyText: { type: "string", description: "The story with vocabulary words" },
              clickableWords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string" },
                    definition: { type: "string" }
                  },
                  required: ["word", "definition"],
                  additionalProperties: false
                }
              }
            },
            required: ["type", "title", "storyText", "clickableWords"]
          }
        }
      };

    case 'application':
      return {
        type: "function",
        function: {
          name: "create_application_game",
          description: "Create a scenario-based roleplay game",
          parameters: {
            ...baseSchema,
            properties: {
              type: { type: "string", enum: ["application"] },
              title: { type: "string", description: "Game title" },
              scenario: { type: "string", description: "The situation description" },
              choices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string", description: "The response option" },
                    score: { type: "number", description: "Points 1-3" },
                    response: { type: "string", description: "Feedback for this choice" },
                    isCorrect: { type: "boolean", description: "True only for best answer" }
                  },
                  required: ["text", "score", "response", "isCorrect"],
                  additionalProperties: false
                }
              }
            },
            required: ["type", "title", "scenario", "choices"]
          }
        }
      };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GameRequest = await req.json();
    const { targetGroup, topic, gameMode, cefrLevel = 'A2', questionCount = 5 } = body;

    console.log('[IronLMS] Generating game:', { targetGroup, topic, gameMode, cefrLevel });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are the IronLMS Engine, an expert educational game designer.
You create structured JSON data for interactive mini-games.
You MUST output valid JSON that matches the exact schema provided.
Do not include any markdown, explanations, or extra text.`;

    const userPrompt = getGamePrompt(gameMode, topic, targetGroup, cefrLevel, questionCount);
    const tool = getToolDefinition(gameMode);

    const response = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: tool.function.name } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[IronLMS] AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[IronLMS] AI response:', JSON.stringify(data).slice(0, 500));

    // Extract game from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call in response");
    }

    let game;
    try {
      game = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('[IronLMS] JSON parse error:', parseError);
      throw new Error("Failed to parse game JSON");
    }

    // Validate game type matches request
    if (game.type !== gameMode) {
      game.type = gameMode;
    }

    console.log('[IronLMS] Generated game:', game.title, 'type:', game.type);

    return new Response(JSON.stringify({ 
      success: true, 
      game,
      metadata: {
        targetGroup,
        topic,
        gameMode,
        cefrLevel
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[IronLMS] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
