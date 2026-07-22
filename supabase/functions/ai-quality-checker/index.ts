import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface QualityScore {
  overall: number;
  pedagogy: number;
  engagement: number;
  clarity: number;
  ageAppropriateness: number;
  interactivity: number;
}

interface QualityReport {
  lessonId: string;
  lessonTitle: string;
  scores: QualityScore;
  issues: Array<{
    category: string;
    description: string;
    suggestion: string;
  }>;
  strengths: string[];
  improvements: string[];
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
    const { lessonIds, batchSize = 5 } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lessons to analyze
    let lessonsQuery = supabase.from('curriculum_lessons').select('*');
    
    if (lessonIds && lessonIds.length > 0) {
      lessonsQuery = lessonsQuery.in('id', lessonIds);
    } else {
      lessonsQuery = lessonsQuery.limit(batchSize);
    }

    const { data: lessons, error: lessonsError } = await lessonsQuery;
    if (lessonsError) throw lessonsError;

    if (!lessons || lessons.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        reports: [],
        message: 'No lessons to analyze'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are an expert educational content quality analyst specializing in English language learning materials.
    
Evaluate each lesson based on these criteria:
1. Pedagogy (0-100): Educational soundness, learning objectives clarity, assessment alignment
2. Engagement (0-100): Interactive elements, gamification, student motivation factors
3. Clarity (0-100): Clear instructions, well-structured content, appropriate complexity
4. Age Appropriateness (0-100): Content suitable for target age group, vocabulary level
5. Interactivity (0-100): Student participation opportunities, hands-on activities

Provide specific, actionable feedback for improvement.`;

    const reports: QualityReport[] = [];

    // Process lessons in smaller batches to avoid rate limits
    for (const lesson of lessons) {
      const userPrompt = `Analyze this English lesson for quality:

Title: ${lesson.title}
Target Level: ${lesson.difficulty_level}
Duration: ${lesson.duration_minutes} minutes
Content: ${JSON.stringify(lesson.content, null, 2)}

Provide a quality analysis in JSON format:
{
  "scores": {
    "overall": <number 0-100>,
    "pedagogy": <number 0-100>,
    "engagement": <number 0-100>,
    "clarity": <number 0-100>,
    "ageAppropriateness": <number 0-100>,
    "interactivity": <number 0-100>
  },
  "issues": [{"category": string, "description": string, "suggestion": string}],
  "strengths": [string],
  "improvements": [string]
}`;

      try {
        const geminiUrl = `${GEMINI_API_BASE}/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          })
        });

        if (!geminiResponse.ok) {
          console.error(`Gemini error for lesson ${lesson.id}:`, await geminiResponse.text());
          continue;
        }

        const geminiData = await geminiResponse.json();
        const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (analysisText) {
          let analysis;
          try {
            analysis = JSON.parse(analysisText);
          } catch {
            const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[1]);
            } else {
              continue;
            }
          }

          reports.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            scores: analysis.scores,
            issues: analysis.issues || [],
            strengths: analysis.strengths || [],
            improvements: analysis.improvements || []
          });
        }
      } catch (error) {
        console.error(`Error analyzing lesson ${lesson.id}:`, error);
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Calculate aggregate statistics
    const avgScores = reports.length > 0 ? {
      overall: Math.round(reports.reduce((sum, r) => sum + r.scores.overall, 0) / reports.length),
      pedagogy: Math.round(reports.reduce((sum, r) => sum + r.scores.pedagogy, 0) / reports.length),
      engagement: Math.round(reports.reduce((sum, r) => sum + r.scores.engagement, 0) / reports.length),
      clarity: Math.round(reports.reduce((sum, r) => sum + r.scores.clarity, 0) / reports.length),
      ageAppropriateness: Math.round(reports.reduce((sum, r) => sum + r.scores.ageAppropriateness, 0) / reports.length),
      interactivity: Math.round(reports.reduce((sum, r) => sum + r.scores.interactivity, 0) / reports.length)
    } : null;

    // Store notification for admin
    if (reports.length > 0) {
      await supabase.from('admin_notifications').insert({
        notification_type: 'quality_check',
        title: 'Content Quality Check Complete',
        message: `Analyzed ${reports.length} lessons. Average quality score: ${avgScores?.overall || 0}/100`,
        metadata: {
          reportsCount: reports.length,
          averageScores: avgScores,
          checkedAt: new Date().toISOString()
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      reports,
      summary: {
        lessonsAnalyzed: reports.length,
        averageScores: avgScores,
        lowQualityLessons: reports.filter(r => r.scores.overall < 60).map(r => ({
          id: r.lessonId,
          title: r.lessonTitle,
          score: r.scores.overall
        }))
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Quality check error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
