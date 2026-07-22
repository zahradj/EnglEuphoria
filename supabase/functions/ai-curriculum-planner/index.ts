import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });


  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { plannerRequest } = await req.json();

    if (!plannerRequest) {
      return new Response(
        JSON.stringify({ error: 'Missing planner request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { studentProfile, availableResources } = plannerRequest;
    
    // Build the NLEFP prompt
    const resourceSchema = availableResources.slice(0, 20).map((r: any) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      level: r.cefrLevel,
      theme: r.theme,
      duration: r.duration
    }));

    const NLEFP_MODULES = [
      { id: 1, theme: "Self-Discovery & Confidence Building", coreFocus: "Building learner identity", nlpAnchor: "Confidence anchoring", thinkingSkill: "Self-reflection" },
      { id: 2, theme: "Communication Foundations", coreFocus: "Core speaking patterns", nlpAnchor: "Success visualization", thinkingSkill: "Pattern recognition" },
      { id: 3, theme: "Daily Life Mastery", coreFocus: "Practical communication", nlpAnchor: "Future pacing", thinkingSkill: "Application" },
      { id: 4, theme: "Social Connection", coreFocus: "Relationship language", nlpAnchor: "Rapport building", thinkingSkill: "Empathy development" },
      { id: 5, theme: "Professional Success", coreFocus: "Workplace communication", nlpAnchor: "Achievement anchoring", thinkingSkill: "Strategic thinking" },
      { id: 6, theme: "Cultural Intelligence", coreFocus: "Cross-cultural communication", nlpAnchor: "Flexibility anchoring", thinkingSkill: "Perspective taking" },
      { id: 7, theme: "Creative Expression", coreFocus: "Artistic & creative language", nlpAnchor: "Creativity visualization", thinkingSkill: "Creative thinking" },
      { id: 8, theme: "Problem-Solving Power", coreFocus: "Analytical communication", nlpAnchor: "Solution focusing", thinkingSkill: "Critical analysis" },
      { id: 9, theme: "Global Awareness", coreFocus: "World issues & opinions", nlpAnchor: "Global identity", thinkingSkill: "Systems thinking" },
      { id: 10, theme: "Innovation & Technology", coreFocus: "Digital age communication", nlpAnchor: "Future readiness", thinkingSkill: "Innovation thinking" },
      { id: 11, theme: "Leadership & Influence", coreFocus: "Persuasive communication", nlpAnchor: "Leadership presence", thinkingSkill: "Influential reasoning" },
      { id: 12, theme: "Legacy & Impact", coreFocus: "Meaningful contribution", nlpAnchor: "Purpose anchoring", thinkingSkill: "Values-based thinking" }
    ];

    const prompt = `SYSTEM:
You are an expert ESL curriculum designer specializing in the Neuro-Linguistic English Fluency Program (NLEFP). 
You follow CEFR standards, Bloom's taxonomy, and apply Neuro-Linguistic Programming (NLP) strategies to boost memory and motivation. 
Output valid JSON only.

NLEFP Framework - 12 Core Modules:
${NLEFP_MODULES.map(m => `${m.id}. ${m.theme} - ${m.coreFocus} (NLP: ${m.nlpAnchor}, Thinking: ${m.thinkingSkill})`).join('\n')}

USER:
Create a personalized NLEFP curriculum plan.

Student profile:
  • Age: ${studentProfile.age}
  • Current level: ${studentProfile.cefrLevel}
  • Strengths: ${studentProfile.strengths.join(', ')}
  • Gaps: ${studentProfile.gaps.join(', ')}
  • Learning style: ${studentProfile.learningStyle}
  • Interests: ${studentProfile.interests.join(', ')}
  • Weekly minutes: ${studentProfile.weeklyMinutes}

Resources available: ${JSON.stringify(resourceSchema, null, 2)}

NLEFP Design Rules:
1. Use 6-part lesson structure: Welcome Ritual (5min) → Warm-Up & Hook (5min) → Presentation (10min) → Practice (20min) → Production (15min) → Review & Reflect (5min)
2. Every 4th week is a Progress Week (review, portfolio, video recording, certificates)
3. Include NLP anchors: visualization, future pacing, embedded commands, emotional anchors
4. Integrate critical thinking skills: categorization, sequencing, compare/contrast, cause/effect, etc.
5. VAK learning: Visual-Auditory-Kinesthetic elements in each lesson
6. Metacognitive elements: "Think about your thinking"
7. Reward system: XP (30-50 per lesson, 100 for progress weeks), badges, certificates

Output JSON schema:
{
  "weeks": [
    {
      "theme": "NLEFP Module Theme",
      "isProgressWeek": false,
      "lessons": [
        {
          "objective": "CEFR-aligned learning objective",
          "resources": [{"id": "", "type": "worksheet|game|video|interactive"}],
          "nlpAnchor": "Specific NLP technique with visualization/future pacing",
          "criticalThinking": "Higher-order thinking task",
          "homework": "Creative homework with reflection component",
          "xpReward": 50,
          "lessonStructure": {
            "welcomeRitual": "Confidence building + progress visualization",
            "warmUpHook": "Engaging game/activity with NLP element",
            "presentation": "VAK format introduction of target language",
            "practice": "Interactive practice with critical thinking",
            "production": "Student creation/performance task",
            "reviewReflect": "Self-assessment + metacognitive reflection"
          },
          "vakElements": {
            "visual": "Specific visual learning component",
            "auditory": "Specific auditory learning component", 
            "kinesthetic": "Specific kinesthetic learning component"
          }
        }
      ]
    }
  ],
  "badgeRule": "Module completion badge name = 300 XP",
  "progressTracking": {
    "skillsToTrack": ["listening", "speaking", "reading", "writing", "critical_thinking"],
    "nlpAnchorsUsed": ["visualization", "future_pacing", "emotional_anchors"],
    "metacognitionPrompts": ["reflection questions for student"]
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI API');
    }

    const planData = JSON.parse(content);
    
    const plan = {
      id: `nlefp_ai_plan_${Date.now()}`,
      studentId: studentProfile.id,
      weeks: planData.weeks,
      badgeRule: planData.badge_rule || planData.badgeRule,
      createdAt: new Date(),
      status: 'draft',
      metadata: {
        framework: 'NLEFP',
        progressTracking: planData.progressTracking,
        nlpIntegration: true
      }
    };

    return new Response(
      JSON.stringify({ success: true, plan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Curriculum Planner error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});