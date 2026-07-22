import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parseAIJson } from "../_shared/aiJson.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface AnalysisResult {
  overallScore: number;
  gaps: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  strengths: string[];
  recommendations: Array<{
    priority: number;
    action: string;
    impact: string;
  }>;
  cefrAlignment: {
    score: number;
    issues: string[];
  };
  progressionAnalysis: {
    score: number;
    issues: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'content_creator'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { analysisType = 'full', levelFilter, ageGroupFilter } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch curriculum data
    let lessonsQuery = supabase
      .from('curriculum_lessons')
      .select('*')
      .eq('is_published', true);

    if (levelFilter) {
      lessonsQuery = lessonsQuery.eq('difficulty_level', levelFilter);
    }

    const { data: lessons, error: lessonsError } = await lessonsQuery;
    if (lessonsError) throw lessonsError;

    let levelsQuery = supabase.from('curriculum_levels').select('*');
    if (ageGroupFilter) {
      levelsQuery = levelsQuery.eq('age_group', ageGroupFilter);
    }

    const { data: levels, error: levelsError } = await levelsQuery;
    if (levelsError) throw levelsError;

    const { data: units, error: unitsError } = await supabase
      .from('curriculum_units')
      .select('*');
    if (unitsError) throw unitsError;

    // Prepare curriculum summary for analysis
    const curriculumSummary = {
      totalLessons: lessons?.length || 0,
      totalLevels: levels?.length || 0,
      totalUnits: units?.length || 0,
      lessonsByLevel: lessons?.reduce((acc: any, l: any) => {
        acc[l.difficulty_level] = (acc[l.difficulty_level] || 0) + 1;
        return acc;
      }, {}),
      levelsByCefr: levels?.reduce((acc: any, l: any) => {
        acc[l.cefr_level] = (acc[l.cefr_level] || 0) + 1;
        return acc;
      }, {}),
      unitsByAgeGroup: units?.reduce((acc: any, u: any) => {
        acc[u.age_group] = (acc[u.age_group] || 0) + 1;
        return acc;
      }, {}),
      sampleLessons: lessons?.slice(0, 10).map((l: any) => ({
        title: l.title,
        level: l.difficulty_level,
        duration: l.duration_minutes,
        objectives: l.content?.objectives || []
      })),
      sampleUnits: units?.slice(0, 5).map((u: any) => ({
        title: u.title,
        cefrLevel: u.cefr_level,
        ageGroup: u.age_group,
        objectives: u.learning_objectives
      }))
    };

    const systemPrompt = `You are an expert curriculum analyst specializing in English language education and CEFR standards.
Analyze the provided curriculum data and identify:
1. Gaps in content coverage across CEFR levels (A1-C2)
2. Missing skill areas (speaking, listening, reading, writing, grammar, vocabulary)
3. Age-appropriateness issues
4. Progression problems (difficulty jumps, missing prerequisites)
5. Alignment with CEFR standards

Provide a structured analysis with actionable recommendations.`;

    const userPrompt = `Analyze this English learning curriculum:

${JSON.stringify(curriculumSummary, null, 2)}

Provide a comprehensive analysis in JSON format with this structure:
{
  "overallScore": <number 0-100>,
  "gaps": [{"type": string, "description": string, "severity": "low"|"medium"|"high", "recommendation": string}],
  "strengths": [string],
  "recommendations": [{"priority": <number 1-5>, "action": string, "impact": string}],
  "cefrAlignment": {"score": <number 0-100>, "issues": [string]},
  "progressionAnalysis": {"score": <number 0-100>, "issues": [string]}
}`;

    // Call Gemini Pro for complex analysis (large context window)
    const geminiUrl = `${GEMINI_API_BASE}/gemini-2.5-pro:generateContent?key=${geminiApiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis received from Gemini');
    }

    let analysis: AnalysisResult;
    try {
      analysis = parseAIJson(analysisText, "ai-curriculum-analyzer");
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        analysis = parseAIJson(jsonMatch[1], "ai-curriculum-analyzer");
      } else {
        throw new Error('Failed to parse analysis response');
      }
    }

    // Store the analysis result
    await supabase.from('admin_notifications').insert({
      notification_type: 'curriculum_analysis',
      title: 'Curriculum Analysis Complete',
      message: `Analysis completed with overall score: ${analysis.overallScore}/100. Found ${analysis.gaps.length} gaps and ${analysis.recommendations.length} recommendations.`,
      metadata: {
        analysis,
        analyzedAt: new Date().toISOString(),
        lessonsAnalyzed: lessons?.length || 0,
        levelsAnalyzed: levels?.length || 0
      }
    });

    return new Response(JSON.stringify({
      success: true,
      analysis,
      metadata: {
        lessonsAnalyzed: lessons?.length || 0,
        levelsAnalyzed: levels?.length || 0,
        unitsAnalyzed: units?.length || 0,
        analyzedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Curriculum analysis error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
