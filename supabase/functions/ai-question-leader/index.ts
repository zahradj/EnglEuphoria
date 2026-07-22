import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { 
      session_id, 
      topic, 
      student_response, 
      conversation_history = [], 
      cefr_level,
      question_type = 'follow_up',
      group_mode = false,
      participant_count = 1
    } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build context from conversation history
    const conversationContext = conversation_history
      .map((item: any) => `Q: ${item.question}\nA: ${item.response}`)
      .join('\n\n');

    const systemPrompt = `You are an AI conversation facilitator for English language learners at ${cefr_level} level.

Current Topic: "${topic}"
Conversation Mode: ${group_mode ? `Group conversation with ${participant_count} participants` : 'Individual practice'}
Student Level: ${cefr_level}
Question Type Needed: ${question_type}

Your role is to:
1. Generate engaging follow-up questions that maintain conversation flow
2. Adapt difficulty to the student's CEFR level
3. Encourage elaboration and deeper thinking
4. Provide gentle correction opportunities
5. ${group_mode ? 'Facilitate turn-taking and ensure all participants contribute' : 'Maintain one-on-one engagement'}

Previous Conversation:
${conversationContext}

Latest Student Response: "${student_response}"

Generate a response that includes:
1. A brief acknowledgment of their response (1 sentence)
2. One follow-up question that builds on their answer
3. ${group_mode ? 'A suggestion for how others can contribute' : 'An optional vocabulary tip if relevant'}

Keep responses natural, encouraging, and appropriate for ${cefr_level} level.
Make questions open-ended to promote speaking practice.
Avoid yes/no questions unless leading to elaboration.`;

    const userPrompt = group_mode 
      ? `Based on the student's response, generate a follow-up question that can involve other group members and keeps the conversation flowing naturally.`
      : `Based on the student's response, generate an engaging follow-up question that encourages them to elaborate and practice speaking.`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;

    // Extract question from AI response (assumes question is the last sentence ending with ?)
    const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim());
    const question = sentences.find(s => s.includes('?')) || sentences[sentences.length - 1] + '?';
    const acknowledgment = sentences[0];

    // Store the question in database
    const { data: questionRecord, error } = await supabase
      .from('speaking_questions')
      .insert({
        session_id: group_mode ? null : session_id,
        group_session_id: group_mode ? session_id : null,
        question_text: question.trim(),
        question_type,
        ai_analysis: {
          acknowledgment,
          full_response: aiResponse,
          conversation_turn: conversation_history.length + 1
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing question:', error);
    }

    console.log(`Generated ${question_type} question for session ${session_id}`);

    return new Response(JSON.stringify({
      question: question.trim(),
      acknowledgment,
      full_response: aiResponse,
      question_id: questionRecord?.id,
      conversation_tips: group_mode ? 
        ['Encourage others to share their experiences', 'Ask follow-up questions to your peers'] :
        ['Take your time to think', 'Use examples from your experience']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-question-leader:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});