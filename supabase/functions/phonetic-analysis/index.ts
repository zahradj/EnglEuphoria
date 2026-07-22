import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const _auth = await requireAuth(req);
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });


  try {
    const { studentAudio, targetWord, targetPhonemes } = await req.json();

    if (!studentAudio || !targetWord) {
      return new Response(
        JSON.stringify({ error: 'studentAudio and targetWord are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use Gemini to analyze the transcription against target phonemes
    const analysisPrompt = `You are a phonetics expert for ESL students. Analyze the student's pronunciation attempt.

TARGET WORD: "${targetWord}"
TARGET PHONEMES: ${targetPhonemes?.length ? targetPhonemes.join(', ') : 'auto-detect from the word'}

The student recorded audio which was transcribed. Based on your analysis, provide:

1. A mastery score (0-100) based on phonetic accuracy
2. Breakdown of each phoneme with accuracy percentage and specific feedback
3. Overall feedback message appropriate for a young learner

Respond in this exact JSON format:
{
  "masteryScore": <number 0-100>,
  "phonemeBreakdown": [
    {
      "phoneme": "<IPA symbol>",
      "accuracy": <number 0-100>,
      "feedback": "<specific, encouraging tip>"
    }
  ],
  "overallFeedback": "<encouraging message>",
  "errorType": "<substitution|omission|distortion|none>",
  "feedbackVisual": "<mouth_position|pulsing_letter|try_again|celebration>"
}

Scoring guide:
- 85-100%: Gold Star — Celebration animation
- 50-84%: Soft Correction — Show the specific tip
- 0-49%: Replay Prime — Watch and listen again`;

    // First, transcribe the audio
    const transcribeResponse = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Transcribe this audio recording of a student trying to say the word "${targetWord}". Return ONLY the transcribed text, nothing else.`
              },
              {
                type: 'image_url',
                image_url: { url: studentAudio }
              }
            ]
          }
        ],
      }),
    });

    let transcribedText = targetWord; // fallback
    if (transcribeResponse.ok) {
      const transcribeData = await transcribeResponse.json();
      transcribedText = transcribeData.choices?.[0]?.message?.content?.trim() || targetWord;
    }

    console.log('Transcribed:', transcribedText, '| Target:', targetWord);

    // Now analyze phonetic accuracy
    const analysisResponse = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview',
        messages: [
          {
            role: 'user',
            content: `${analysisPrompt}\n\nSTUDENT'S TRANSCRIBED SPEECH: "${transcribedText}"\n\nReturn ONLY the JSON, no markdown fences.`
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errText = await analysisResponse.text();
      console.error('Analysis error:', errText);
      throw new Error('Phonetic analysis failed');
    }

    const analysisData = await analysisResponse.json();
    let resultText = analysisData.choices?.[0]?.message?.content || '';
    
    // Strip markdown fences if present
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      console.error('Failed to parse analysis result:', resultText);
      result = {
        masteryScore: 50,
        phonemeBreakdown: [],
        overallFeedback: 'Good try! Let\'s practice again.',
        errorType: 'none',
        feedbackVisual: 'try_again',
      };
    }

    return new Response(
      JSON.stringify({
        ...result,
        transcribedText,
        targetWord,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in phonetic-analysis:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
