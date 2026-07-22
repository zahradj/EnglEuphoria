import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const body = await req.json();
    const { student_id, cefr_level, interests, learning_goals, session_count = 0 } = body;
    const rawHub = (body.hub_type || body.hubType || body.target_age_group || '').toString().toLowerCase();
    const hub: 'playground' | 'academy' | 'professional' =
      rawHub === 'kids' || rawHub === 'playground' || rawHub === 'children' ? 'playground'
      : rawHub === 'professional' || rawHub === 'success' || rawHub === 'adults' ? 'professional'
      : 'academy';
    const hubRules = hub === 'playground'
      ? "PLAYGROUND (Ages 4-9): Topics MUST be about animals, colors, food, family, toys, simple actions. Vocabulary in 3-5 word sentences. Energetic, child-friendly tone."
      : hub === 'professional'
      ? "SUCCESS HUB (Ages 17+): Topics MUST be Business English, careers, negotiations, university prep, current affairs, advanced idioms. Professional, sophisticated tone."
      : "ACADEMY (Ages 10-16): Topics MUST appeal to teenagers — technology, gaming, social media, travel, school, pop culture, sports. Friendly, motivating tone (never childish).";

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get student's speaking history and preferences
    const { data: profile } = await supabase
      .from('student_speaking_profiles')
      .select('*')
      .eq('student_id', student_id)
      .single();

    const { data: recentTopics } = await supabase
      .from('speaking_classroom_sessions')
      .select('generated_topic')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(5);

    const usedTopics = recentTopics?.map(s => s.generated_topic).filter(Boolean) || [];

    // Generate AI-powered topic suggestions
    const systemPrompt = `You are an English conversation topic generator for students at ${cefr_level} level.

🚧 PEDAGOGICAL HUB WALL — STRICTLY ENFORCE:
${hubRules}


Student Profile:
- CEFR Level: ${cefr_level}
- Interests: ${interests?.join(', ') || 'general topics'}
- Learning Goals: ${learning_goals?.join(', ') || 'general improvement'}
- Session Count: ${session_count}
- Confidence Level: ${profile?.confidence_level || 'medium'}
- Learning Style: ${profile?.learning_style || 'mixed'}

Recently Used Topics (avoid these): ${usedTopics.join(', ')}

Generate 3 conversation topics that are:
1. Appropriate for ${cefr_level} level
2. Engaging and relevant to the student's interests
3. Progressive in difficulty (if this is an advanced student)
4. Culturally sensitive and inclusive
5. Fresh and different from recent topics

For each topic, provide:
- Topic title (clear and engaging)
- Category (casual, business, academic, cultural, current_events, personal_development)
- Brief description (2-3 sentences)
- 3-5 key vocabulary words for this level
- Estimated difficulty (1-5 scale)
- Opening question to start the conversation

Format as JSON array with objects containing: title, category, description, keywords, difficulty, opening_question, target_age_group (must equal "${hub}").`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 3 personalized conversation topics for this student.` }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from OpenAI');
    }

    let topics;
    try {
      topics = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // Fallback if JSON parsing fails
      topics = [{
        title: "Daily Routines and Habits",
        category: "casual",
        description: "Discuss your daily activities, routines, and habits. This is a great way to practice present tense and time expressions.",
        keywords: ["routine", "schedule", "habits", "daily", "activities"],
        difficulty: cefr_level === 'A1' ? 2 : cefr_level === 'A2' ? 3 : 4,
        opening_question: "What does a typical day look like for you?"
      }];
    }

    // Store generated topics in database for future analysis
    for (const topic of topics) {
      await supabase
        .from('ai_generated_topics')
        .insert({
          topic_text: topic.title,
          category: topic.category,
          cefr_level: cefr_level,
          keywords: topic.keywords,
          context_prompts: {
            description: topic.description,
            opening_question: topic.opening_question
          },
          difficulty_score: topic.difficulty
        });
    }

    console.log(`Generated ${topics.length} topics for student ${student_id} at ${cefr_level} level`);

    return new Response(JSON.stringify({ topics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-topic-generator:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});