import { requireAuth } from "../_shared/authGuard.ts";
// generate-placement-test
// Three Isolated Hub Funnels — three completely separate System Prompts.
// HARD-WIRED to Gemini direct (GEMINI_API_KEY). Lovable AI Gateway is forbidden
// at runtime per project memory: runtime-ai-gemini-only.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Hub = "playground" | "academy" | "success";
type Locale = "en" | "es" | "ar" | "fr" | "tr" | "it";

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Spanish (Español)",
  ar: "Arabic (العربية)",
  fr: "French (Français)",
  tr: "Turkish (Türkçe)",
  it: "Italian (Italiano)",
};

interface PlacementQuestion {
  skill: string;
  cefr_level: string;
  task_instruction_localized: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  audio_script: string | null;
  image_prompt: string;
}

const PLAYGROUND_PROMPT = `You are an expert Early Childhood English Teacher designing a dynamic placement test for a young child (Age 4-9). The test must be highly engaging, simple, and strictly Pre-A1 to A1 CEFR level.

Because the student is young and cannot read complex text, every question must rely heavily on visuals and audio.

Output a strict JSON array of 5 questions. Each question object must contain:
- skill: 'vocabulary', 'listening', or 'basic_grammar'.
- cefr_level: 'Pre-A1' or 'A1'.
- question_text: Very short text (e.g., 'What is this?', 'Where is the cat?').
- options: Array of 3 simple string options.
- correct_answer: The correct string (must exactly match one of options).
- audio_script: A script for ElevenLabs to read out loud to the child. Slow, cheerful, encouraging.
- image_prompt: 'Flat 2D vector illustration, cute cartoon style for young children. 60% of the image must be colored in the brand primary color: Bright Orange. Subject: [describe the vocabulary word or scene clearly]'.

Do not include any content related to school exams, teen drama, or adult concepts. Output ONLY the JSON array, no markdown.`;

const ACADEMY_PROMPT = `You are an expert Middle and High School English Teacher designing an adaptive placement test for a teenager (Age 10-17). The test should evaluate CEFR levels from A1 up to B2.

The context must be relatable to teenagers: school assignments, sports, technology, friendships, and hobbies.

Output a strict JSON array of 7 progressive questions (starting easy, getting harder). Each question object must contain:
- skill: 'grammar', 'reading_comprehension', 'vocabulary', or 'listening'.
- cefr_level: The specific level being tested ('A1' | 'A2' | 'B1' | 'B2').
- question_text: The test question or fill-in-the-blank sentence.
- options: Array of 4 string options.
- correct_answer: The correct string (must exactly match one of options).
- audio_script: For listening questions, a natural teenager / friendly teacher script. Otherwise null.
- image_prompt: 'Modern webtoon / comic book illustration style. Relatable teenage characters. 60% of the image must be colored in the brand primary color: Electric Purple. Subject: [describe the school or social scene]'.

Do not use childish vocabulary (like 'Meow') or heavy corporate/business concepts. Output ONLY the JSON array, no markdown.`;

const SUCCESS_PROMPT = `You are an expert Corporate English Assessor and University ESL Professor designing a placement test for an adult professional (Age 18+). The test must evaluate CEFR levels from A2 to C1.

The context must be strictly professional and mature: workplace emails, business negotiations, university lectures, networking, and international travel.

Output a strict JSON array of 8 progressive questions. Each question object must contain:
- skill: 'advanced_grammar', 'idioms', 'business_vocabulary', or 'professional_listening'.
- cefr_level: The specific level being tested ('A2' | 'B1' | 'B2' | 'C1').
- question_text: A sophisticated question, email snippet, or contextual problem.
- options: Array of 4 plausible string options (testing nuance).
- correct_answer: The correct string (must exactly match one of options).
- audio_script: For listening questions, a professional adult script (boss in meeting, airport announcer, client call). Otherwise null.
- image_prompt: 'Sleek, modern editorial photography or highly polished corporate vector art. Professional adult characters in workplace or university settings. 60% of the image must be colored in the brand primary color: Mint Green. Subject: [describe the business or travel scene]'.

Do not use any child-like themes, cartoons, or high-school drama scenarios. Output ONLY the JSON array, no markdown.`;

const ANTI_CHEAT_RULE = `\n\nCRITICAL ANTI-CHEATING RULE FOR EVERY image_prompt: Always begin the image_prompt with the literal sentence: "CRITICAL: DO NOT include any text, letters, or words in the image. DO NOT reveal the literal answer. Create a generalized, ambiguous visual context only." Never put the correct answer word literally in the image scene.`;

const globalizationRule = (locale: Locale): string => `

GLOBALIZATION RULE (STRICT — applies to EVERY question object):
- task_instruction_localized: ONE short instruction (e.g. "Listen and choose the picture", "Fill in the blank", "Choose the correct word") translated INTO ${LOCALE_NAMES[locale]} ONLY. This is the ONLY translated field. If the locale is English, write it in English.
- question_text: STRICTLY ENGLISH.
- options: STRICTLY ENGLISH.
- correct_answer: STRICTLY ENGLISH and must exactly match one entry in options.
- audio_script: STRICTLY ENGLISH when present. Return null when the skill is not a listening skill.
- image_prompt: STRICTLY ENGLISH (internal use). Must begin with the anti-cheat sentence and must NOT include any literal answer text.
Never translate question_text, options, correct_answer, or audio_script. Never embed the localized instruction inside question_text.`;

const promptFor = (hub: Hub, locale: Locale): string => {
  const base = hub === "playground" ? PLAYGROUND_PROMPT
    : hub === "academy" ? ACADEMY_PROMPT
    : SUCCESS_PROMPT;
  return base + ANTI_CHEAT_RULE + globalizationRule(locale);
};

function stripCodeFence(text: string): string {
  let s = text.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  return s.trim();
}

async function callGeminiDirect(
  systemInstruction: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const _auth = await requireAuth(req);
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json().catch(() => ({}));
    const hub: Hub = body?.hub === "playground" || body?.hub === "academy" || body?.hub === "success"
      ? body.hub
      : "academy";
    const interests: string[] = Array.isArray(body?.interests) ? body.interests.slice(0, 6) : [];
    const age: number | undefined = typeof body?.age === "number" ? body.age : undefined;

    // Accept either `userLocale` or `nativeLanguage`. Strip region (ar-SA → ar).
    const rawLocale: string = String(body?.userLocale ?? body?.nativeLanguage ?? "en")
      .toLowerCase().split("-")[0];
    const locale: Locale = (["en", "es", "ar", "fr", "tr", "it"] as const).includes(rawLocale as Locale)
      ? (rawLocale as Locale)
      : "en";

    const userPrompt = [
      `Generate the placement test now.`,
      age ? `Student age: ${age}.` : "",
      interests.length ? `Student interests (use to pick relatable contexts): ${interests.join(", ")}.` : "",
      `Localize task_instruction_localized into ${LOCALE_NAMES[locale]}. All other content stays in English.`,
      `Return ONLY the JSON array, nothing else.`,
    ].filter(Boolean).join("\n");

    const raw = await callGeminiDirect(promptFor(hub, locale), userPrompt);
    const cleaned = stripCodeFence(raw);

    let questions: PlacementQuestion[];
    try {
      questions = JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`Invalid JSON from Gemini: ${(e as Error).message}`);
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Gemini returned an empty test");
    }

    return new Response(
      JSON.stringify({ hub, locale, questions, provider: "gemini-direct" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("[generate-placement-test]", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
