import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { parseAIJson } from "../_shared/aiJson.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IRON_SUPER_ADMIN_PROMPT = `ACTIVATE PROTOCOL: IRON_PPP_ADMIN

Role: You are the Iron Curriculum Super-Admin. You are responsible for end-to-end curriculum generation that transforms topics into behavior-modification engines.

The 5-Level Progression (Anchor → Alloy):
1. ANCHOR (Foundation) - Core concept introduction. The fundamental truth.
2. FORGE (Shaping) - Building structure and patterns. Bending the material.
3. TEMPER (Strengthening) - Repetition and reinforcement. Hardening through fire.
4. EDGE (Sharpening) - Edge cases and nuances. Precision work.
5. ALLOY (Integration) - Full integration and mastery. Combining all elements.

Each lesson MUST strictly adhere to this PPP (Presentation, Practice, Production) structure:

1. PRESENTATION (The Download)
   - Dense, factual delivery using only necessary data
   - Use formulas, tables, or structured data for hard facts
   - No anecdotes - only essential information
   - Mathematical clarity: Context + Instruction + Constraint = Output

2. PRACTICE (The Drill)
   - Provide exactly 3 guided exercises (Task A, B, C)
   - Each task builds on the previous one
   - Student follows a specific pattern you set
   - Immediate feedback loops embedded
   - Low risk, high repetition

3. PRODUCTION (The Test)
   - Creative task with absolutely no hand-holding
   - Student must apply the concept to build something new
   - Or solve a "blind" problem (no hints provided)
   - Chaotic or blank scenario that forces execution
   - Clear success criteria defined

The Iron Rules:
- Do not ask for feedback
- Do not hesitate
- If a concept is complex, break it into two PPP cycles within the lesson
- Each level should contain 2-3 lessons
- Lessons must be progressive within each level
- Use age-appropriate language and examples based on target audience

Output Format:
You MUST respond with valid JSON only. No markdown, no explanations outside the JSON.`;

interface IronRequest {
  topic: string;
  targetAudience: 'kids' | 'teens' | 'adults';
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  levelToGenerate?: number; // 1-5, if not provided generates all
  userId?: string;
}

interface PPPLesson {
  lessonNumber: number;
  title: string;
  presentation: {
    concept: string;
    formula?: string;
    keyPoints: string[];
    table?: { headers: string[]; rows: string[][] };
  };
  practice: {
    taskA: { instruction: string; pattern: string; expectedOutput?: string };
    taskB: { instruction: string; buildsOn: string; expectedOutput?: string };
    taskC: { instruction: string; buildsOn: string; expectedOutput?: string };
  };
  production: {
    scenario: string;
    mission: string;
    constraints: string[];
    successCriteria: string;
    timeLimit?: string;
  };
}

interface IronLevel {
  levelNumber: number;
  levelName: 'Anchor' | 'Forge' | 'Temper' | 'Edge' | 'Alloy';
  levelTitle: string;
  levelDescription: string;
  lessons: PPPLesson[];
}

interface IronCurriculum {
  topic: string;
  targetAudience: string;
  cefrLevel: string;
  levels: IronLevel[];
  generatedAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, targetAudience, cefrLevel = 'B1', levelToGenerate, userId } = await req.json() as IronRequest;

    if (!topic || !targetAudience) {
      return new Response(
        JSON.stringify({ error: 'Topic and targetAudience are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Iron PPP Generator] Starting generation for topic: "${topic}", audience: ${targetAudience}, level: ${levelToGenerate || 'all'}`);

    const levelNames = ['Anchor', 'Forge', 'Temper', 'Edge', 'Alloy'];
    const levelsToGenerate = levelToGenerate ? [levelToGenerate] : [1, 2, 3, 4, 5];

    const userPrompt = `Generate a complete Iron PPP curriculum for:

Topic: "${topic}"
Target Audience: ${targetAudience} (${targetAudience === 'kids' ? 'ages 6-12, use simple language and fun examples' : targetAudience === 'teens' ? 'ages 13-17, use relatable examples and modern references' : 'ages 18+, use professional language and real-world applications'})
CEFR Level: ${cefrLevel}
Levels to Generate: ${levelsToGenerate.map(n => `Level ${n} (${levelNames[n-1]})`).join(', ')}

For each level, generate 2-3 lessons following the strict PPP structure.

Response must be a valid JSON object with this exact structure:
{
  "topic": "${topic}",
  "targetAudience": "${targetAudience}",
  "cefrLevel": "${cefrLevel}",
  "levels": [
    {
      "levelNumber": 1,
      "levelName": "Anchor",
      "levelTitle": "string - creative title for this level",
      "levelDescription": "string - what mastery looks like at this level",
      "lessons": [
        {
          "lessonNumber": 1,
          "title": "string",
          "presentation": {
            "concept": "string - dense explanation",
            "formula": "string - optional mathematical or logical formula",
            "keyPoints": ["point1", "point2", "point3"],
            "table": { "headers": ["col1", "col2"], "rows": [["data1", "data2"]] }
          },
          "practice": {
            "taskA": { "instruction": "string", "pattern": "string - the pattern to follow", "expectedOutput": "string" },
            "taskB": { "instruction": "string", "buildsOn": "A", "expectedOutput": "string" },
            "taskC": { "instruction": "string", "buildsOn": "B", "expectedOutput": "string" }
          },
          "production": {
            "scenario": "string - the chaotic situation",
            "mission": "string - what they must accomplish",
            "constraints": ["constraint1", "constraint2"],
            "successCriteria": "string - how to know they succeeded",
            "timeLimit": "string - optional time pressure"
          }
        }
      ]
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}

Generate the curriculum now. Output ONLY valid JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: IRON_SUPER_ADMIN_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Iron PPP Generator] OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('[Iron PPP Generator] Successfully generated curriculum');

    let curriculum: IronCurriculum;
    try {
      curriculum = parseAIJson(generatedContent, "iron-ppp-generator");
    } catch (parseError) {
      console.error('[Iron PPP Generator] Failed to parse response:', parseError);
      throw new Error('Failed to parse generated curriculum');
    }

    // If userId provided, save to database
    if (userId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: savedCurriculum, error: saveError } = await supabase
        .from('iron_curriculums')
        .insert({
          topic: curriculum.topic,
          target_audience: curriculum.targetAudience,
          cefr_level: curriculum.cefrLevel,
          levels: curriculum.levels,
          created_by: userId
        })
        .select()
        .single();

      if (saveError) {
        console.error('[Iron PPP Generator] Failed to save curriculum:', saveError);
        // Don't throw - still return the generated content
      } else {
        console.log('[Iron PPP Generator] Curriculum saved with ID:', savedCurriculum.id);
        curriculum = { ...curriculum, id: savedCurriculum.id } as any;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        curriculum,
        tokensUsed: data.usage?.total_tokens 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Iron PPP Generator] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
