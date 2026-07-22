import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface StudentInsight {
  studentId: string;
  riskLevel: 'low' | 'medium' | 'high';
  strengths: string[];
  challenges: string[];
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: string;
  }>;
  predictedProgress: {
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
  };
}

interface ClassInsight {
  averageProgress: number;
  engagementRate: number;
  commonChallenges: string[];
  topPerformers: string[];
  needsAttention: string[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'teacher'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { analysisType = 'class', studentIds, classId, dateRange } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch student progress data
    const { data: progressData, error: progressError } = await supabase
      .from('student_progress')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (progressError) throw progressError;

    // Fetch learning events
    const { data: learningEvents, error: eventsError } = await supabase
      .from('ai_learning_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (eventsError) throw eventsError;

    // Fetch student achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('student_achievements')
      .select('*');

    if (achievementsError) throw achievementsError;

    // Aggregate data by student
    const studentData: Record<string, any> = {};
    
    progressData?.forEach((p: any) => {
      if (!studentData[p.student_id]) {
        studentData[p.student_id] = {
          progress: [],
          events: [],
          achievements: []
        };
      }
      studentData[p.student_id].progress.push(p);
    });

    learningEvents?.forEach((e: any) => {
      if (studentData[e.student_id]) {
        studentData[e.student_id].events.push(e);
      }
    });

    achievements?.forEach((a: any) => {
      if (studentData[a.student_id]) {
        studentData[a.student_id].achievements.push(a);
      }
    });

    // Prepare summary for Gemini analysis
    const analysisSummary = {
      totalStudents: Object.keys(studentData).length,
      totalProgressRecords: progressData?.length || 0,
      totalLearningEvents: learningEvents?.length || 0,
      totalAchievements: achievements?.length || 0,
      studentSummaries: Object.entries(studentData).slice(0, 20).map(([id, data]: [string, any]) => ({
        studentId: id,
        progressCount: data.progress.length,
        averageScore: data.progress.length > 0 
          ? Math.round(data.progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / data.progress.length)
          : 0,
        eventsCount: data.events.length,
        achievementsCount: data.achievements.length,
        recentActivity: data.progress[0]?.created_at || null
      }))
    };

    const systemPrompt = `You are an expert educational data analyst specializing in student performance analysis for English language learning.

Analyze the provided student data to:
1. Identify at-risk students who need intervention
2. Spot common learning challenges across the class
3. Recognize high performers and their success patterns
4. Provide actionable recommendations for teachers
5. Predict learning trends

Focus on early warning signs and preventive recommendations.`;

    const userPrompt = `Analyze this student performance data:

${JSON.stringify(analysisSummary, null, 2)}

Provide analysis in JSON format:
{
  "classInsight": {
    "averageProgress": <number 0-100>,
    "engagementRate": <number 0-100>,
    "commonChallenges": [string],
    "topPerformers": [studentId strings],
    "needsAttention": [studentId strings],
    "recommendations": [string]
  },
  "studentInsights": [
    {
      "studentId": string,
      "riskLevel": "low"|"medium"|"high",
      "strengths": [string],
      "challenges": [string],
      "recommendations": [{"action": string, "priority": "low"|"medium"|"high", "expectedImpact": string}],
      "predictedProgress": {"trend": "improving"|"stable"|"declining", "confidence": <number 0-1>}
    }
  ],
  "actionableSummary": string
}`;

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

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse analysis response');
      }
    }

    // Store notification for teachers/admins
    const atRiskCount = analysis.studentInsights?.filter((s: any) => s.riskLevel === 'high').length || 0;
    
    await supabase.from('admin_notifications').insert({
      notification_type: 'performance_analysis',
      title: 'Student Performance Analysis Complete',
      message: `Analyzed ${Object.keys(studentData).length} students. ${atRiskCount} students need attention.`,
      metadata: {
        analysis: analysis.classInsight,
        atRiskCount,
        analyzedAt: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({
      success: true,
      analysis,
      metadata: {
        studentsAnalyzed: Object.keys(studentData).length,
        dataPointsProcessed: (progressData?.length || 0) + (learningEvents?.length || 0),
        analyzedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Performance analysis error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
