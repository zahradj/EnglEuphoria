import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Character voice mappings to ElevenLabs voices
const CHARACTER_VOICES = {
  // Friendly characters (child-appropriate)
  'friendly_teacher': '9BWtsMINqrJLrRacOk9x', // Aria - warm, friendly
  'story_narrator': 'EXAVITQu4vr4xnSDxMaL', // Sarah - clear, storytelling
  'game_host': 'TX3LPaxmHKxFdv7VOQHJ', // Liam - energetic, fun
  
  // Student/child characters
  'student_friend': 'XB0fDUnXU5powFXDhCwa', // Charlotte - young, friendly
  'playful_character': 'pFZP5JQG7iQjIQuC4Bku', // Lily - playful, light
  
  // Animal/fantasy characters
  'animal_friend': 'SAz9YHcvj6GT2YYXdXww', // River - distinctive, fun
  'magical_guide': 'XrExE9yKIg1WjnnlVkGX', // Matilda - mysterious, wise
  
  // Educational characters
  'pronunciation_coach': 'FGY2WhTYpPnrIDTdsKH5', // Laura - clear, patient
  'vocabulary_helper': 'IKne3meq5aSn9XLyUdCD', // Charlie - encouraging, clear
  
  // Default fallback
  'default': '9BWtsMINqrJLrRacOk9x' // Aria
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, characterType = 'default', settings = {} } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      console.error('ELEVENLABS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Voice service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the appropriate voice for this character type
    const voiceId = (CHARACTER_VOICES as Record<string, string>)[characterType] || CHARACTER_VOICES.default;
    
    console.log(`Generating voice for character: ${characterType}, text: "${text.substring(0, 50)}..."`);

    // Default voice settings optimized for children's content
    const defaultSettings = {
      stability: 0.6,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    };

    const voiceSettings = { ...defaultSettings, ...settings };

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: voiceSettings
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Voice generation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioData = await response.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioData)));
    
    console.log(`Successfully generated voice for ${characterType}`);

    return new Response(
      JSON.stringify({ 
        audioContent: audioBase64,
        characterType,
        voiceId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-character-voices function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
