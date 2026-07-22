import { requireAuth } from "../_shared/authGuard.ts";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── CEFR Pedagogy Rules ──────────────────────────────────────────────
// Hard pedagogical constraints injected per level. These are the "concrete walls"
// that prevent the AI from producing generic, repetitive output.
const CEFR_RULES: Record<string, string> = {
  A1: `CEFR LEVEL: A1 (Absolute Beginner)
- Sentence length: MAX 5 words.
- Grammar: Present simple only. "I am / You are / It is". No tenses beyond present.
- Vocabulary: Concrete, highly visual nouns (objects, animals, food, colors, numbers, family).
- NO abstract concepts. NO idioms. NO conditionals.
- Activities: Picture matching, Total Physical Response (TPR), chants, simple labeling.
- Tone: Extremely warm, repetitive, playful. Treat every win as a celebration.`,

  A2: `CEFR LEVEL: A2 (Elementary)
- Sentence length: MAX 8 words.
- Grammar: Present simple + present continuous + past simple (regular verbs) + "going to" future.
- Vocabulary: Daily routines, hobbies, weather, shopping, directions, simple feelings.
- Activities: Information gap, simple roleplay (ordering food, asking directions), picture description.
- Tone: Encouraging and concrete. Always tie new language to a real-life situation.`,

  B1: `CEFR LEVEL: B1 (Intermediate)
- Sentence length: MAX 15 words.
- Grammar: All past tenses, present perfect, first conditional, modal verbs (should, must, might).
- Vocabulary: Travel, work, opinions, plans, experiences, technology.
- Activities: Structured roleplays (job interview, travel scenario), opinion polls, short debates with sentence frames.
- Tone: Conversational and curious. Encourage opinion-sharing with scaffolding.`,

  B2: `CEFR LEVEL: B2 (Upper-Intermediate)
- Sentence length: Natural — no cap, but prefer clarity.
- Grammar: All conditionals, passive voice, reported speech, relative clauses, perfect continuous tenses.
- Vocabulary: Abstract topics (ethics, society, environment, careers), collocations, phrasal verbs.
- Activities: Free roleplay, structured debate (for/against), case studies, news article discussion.
- Tone: Intellectually engaging. Challenge with nuance, idioms, and register awareness.`,

  C1: `CEFR LEVEL: C1 (Advanced)
- Sentence length: Sophisticated and varied.
- Grammar: Inversion, cleft sentences, advanced modals, subjunctive, hedging language.
- Vocabulary: Idioms, advanced collocations, register shifts (formal ↔ informal), academic language.
- Activities: Open debate, presentations, negotiation, critical analysis, persuasive writing prompts.
- Tone: Professional and sophisticated. Treat the student as an intellectual peer.`,
};

// Map hub → default CEFR level when the caller doesn't pass one explicitly.
// Backward compatible with existing frontend calls.
const HUB_DEFAULT_CEFR: Record<string, string> = {
  playground: "A1",
  academy: "B1",
  success: "C1",
};

// Topics the AI defaults to over and over. We tell it to AVOID these unless
// the user explicitly requested them in the topic field.
const OVERUSED_TOPIC_BANLIST = [
  "colors", "apples", "hello how are you", "my family", "the weather",
  "my pet", "fruits", "animals at the zoo", "what is your name",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });


  try {
    const body = await req.json();
    const {
      hub,
      topic,
      targetGrammar,
      targetVocabulary,
      mode,
      previousSlideContent,
      prompt: userInjectPrompt,
      studentAge,
      lessonPrompt,
      cefr_level: cefrLevelInput,
      unit_id,
    } = body;

    const validHubs = ["playground", "academy", "success"];
    if (!hub || !validHubs.includes(hub)) {
      return new Response(
        JSON.stringify({ error: "Invalid hub. Must be: playground, academy, or success" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Resolve CEFR level: explicit input > hub default
    const cefrLevel = (cefrLevelInput && CEFR_RULES[cefrLevelInput])
      ? cefrLevelInput
      : HUB_DEFAULT_CEFR[hub];
    const cefrRules = CEFR_RULES[cefrLevel];

    // Cycle 3 — strict unit hand-off. If unit_id is provided, fetch the parent
    // unit-lock and prepend the global pedagogy preamble + lock block so the
    // planner cannot drift off-theme, off-grammar, or off-vocabulary.
    let unitLockPreamble = "";
    let unitLockMeta: Record<string, unknown> | null = null;
    if (unit_id) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const unitRes = await fetch(
          `${SUPABASE_URL}/rest/v1/curriculum_units?id=eq.${unit_id}&select=hub,cefr_level,theme,target_grammar,target_vocabulary_pool`,
          { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
        );
        const unitArr = unitRes.ok ? await unitRes.json() : [];
        const unit = Array.isArray(unitArr) && unitArr[0];
        if (
          unit && unit.hub && unit.cefr_level && unit.theme &&
          unit.target_grammar && Array.isArray(unit.target_vocabulary_pool) &&
          unit.target_vocabulary_pool.length >= 5
        ) {
          const { buildHubCefrPreamble, buildUnitLockBlock, normalizeHub, normalizeCefr } =
            await import("../_shared/pedagogy/index.ts");
          const h = normalizeHub(unit.hub);
          const c = normalizeCefr(unit.cefr_level);
          if (h && c) {
            unitLockPreamble =
              `${buildHubCefrPreamble(h, c)}\n\n${buildUnitLockBlock(h, c, {
                theme: unit.theme,
                target_grammar: unit.target_grammar,
                target_vocabulary_pool: unit.target_vocabulary_pool,
              })}\n\n`;
            unitLockMeta = {
              hub: h, cefr: c, theme: unit.theme,
              target_grammar: unit.target_grammar,
              target_vocabulary_pool: unit.target_vocabulary_pool,
              vocab_count: unit.target_vocabulary_pool.length,
            };

          }
        } else if (unit) {
          console.warn("UNIT_NOT_LOCKED:", unit_id, "missing lock fields — legacy mode");
        }
      } catch (e) {
        console.warn("Unit-lock fetch failed:", (e as Error).message);
      }
    }

    const generationMode = mode || "full_deck";
    if (generationMode === "full_deck" && (!topic || typeof topic !== "string" || topic.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: "Topic is required for full deck generation" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    if ((topic && topic.length > 500) || (targetGrammar && targetGrammar.length > 500) || (targetVocabulary && targetVocabulary.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Input fields must be under 500 characters" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    let hubContext = "";
    let duration = 60;
    switch (hub) {
      case "playground":
        duration = 30;
        hubContext = `Hub: The Playground (Kids ages 4-9). Duration: EXACTLY 30 minutes.
Tone: HIGH-ENERGY, gamified, colorful, fun characters. Phonics focus is critical.
Video Song Channels: Super Simple Songs, Cocomelon, Maple Leaf Learning, Pinkfong, English Singsing.
Hub Colors: Primary #FE6A2F (Orange), Accent #FEFBDD (Yellow).`;
        break;
      case "academy":
        duration = 60;
        hubContext = `Hub: The Academy (Teens ages 12-17). Duration: EXACTLY 60 minutes.
Tone: Grammar-focused deep learning with engaging teen-relevant contexts (tech, hobbies, travel, social media, music). Challenge critical thinking.
Video Channels: BBC Learning English, English with Lucy, mmmEnglish, Learn English with TV Series.
Hub Colors: Primary #6B21A8 (Purple), Accent #F5F3FF (Lavender).`;
        break;
      case "success":
        duration = 60;
        hubContext = `Hub: The Success Hub (Professional Adults 18+). Duration: EXACTLY 60 minutes.
Tone: Professional coaching, business English, career-focused. Include role-play scenarios. Focus on professional vocabulary, idiomatic expressions, formal/informal register.
Video Channels: BBC Learning English, Business English Pod, English with Lucy, TED-Ed.
Hub Colors: Primary #059669 (Emerald Green), Accent #F0FDFA (Mint).`;
        break;
    }

    // Anti-repetition: a random seed nudges Gemini away from the same defaults
    // every time, and we explicitly ban overused topics.
    const variationSeed = Math.random().toString(36).slice(2, 10);
    const banList = OVERUSED_TOPIC_BANLIST
      .filter(t => !topic || !topic.toLowerCase().includes(t.split(" ")[0]))
      .join(", ");

    const SCHEMA_BLOCK = `Each slide MUST follow this exact schema:
{
  "ppp_stage": "Warm-Up | Presentation | Practice | Production | Review",
  "phase": "warm-up | presentation | practice | production | review",
  "slide_type": "title | video_song | vocabulary_image | grammar_presentation | interactive_quiz | roleplay | debate | activity | speaking_prompt | concept_check",
  "interaction_type": "read | fill-in-the-blank | roleplay | open-question | matching | quiz",
  "title": "A short slide title (3-6 words)",
  "headline": "The main large text shown to the student",
  "content": "The main educational text, dialogue, or example for this slide",
  "body_text": "Secondary text, instructions, or quiz options",
  "video_url": "A real YouTube URL (https://www.youtube.com/results?search_query=...) or null",
  "visual_keyword": "A highly specific 1-2 word search term for an HD Unsplash photo (e.g. 'busy-airport', 'angry-customer'). Use kebab-case.",
  "visual_search_keyword": "Same as visual_keyword (kept for backward compatibility)",
  "image_prompt": "A detailed visual prompt that perfectly matches this slide (used for AI image generation)",
  "interactive_options": ["Used when slide_type is interactive_quiz, roleplay, debate, or activity. For quiz: answer options. For roleplay: character lines. For debate: for/against arguments. For activity: step-by-step instructions."],
  "teacher_instructions": "A clear, concise guide for the teacher on how to run this slide",
  "teacher_notes": {
    "script": "Exactly what the teacher should say out loud",
    "ccq": ["Concept Check Question 1", "Concept Check Question 2"],
    "step_down": "How to simplify this slide for a struggling student",
    "step_up": "How to extend this slide for a fast finisher"
  }
}

INTERACTIVE SLIDE ARCHETYPES (use these — do not default to plain text slides):
- "roleplay": Two-character dialogue (e.g. customer & waiter). interactive_options lists the lines.
- "debate": A motion + for/against arguments. Used for B1+. interactive_options lists 3-4 arguments per side.
- "activity": A hands-on task (drag-and-drop, matching, sorting, find-the-mistake). interactive_options lists items + correct grouping.
- "interactive_quiz": Multiple choice. interactive_options lists 3-4 answer choices, with the correct one prefixed by "✓ ".`;

    let systemPrompt: string;
    let userPrompt: string;

    if (generationMode === "single_slide") {
      systemPrompt = `${unitLockPreamble}You are the Engleuphoria Master Curriculum Architect. Generate a SINGLE slide for an ESL lesson using the PPP (Presentation, Practice, Production) methodology.

${hubContext}

${cefrRules}

Output ONLY a valid JSON object (not an array) matching this schema. No markdown, no code blocks.

${SCHEMA_BLOCK}

RULES:
- For video slides, use https://www.youtube.com/results?search_query=ENCODED_TERMS format with real ESL channel terms.
- The visual_search_keyword must be highly specific (e.g. 'happy_student', 'airport_luggage').
- teacher_notes MUST be a nested object — never a plain string.
- AVOID these overused defaults: ${banList}.`;

      const prevContext = previousSlideContent ? `\nContext from the previous slide: ${JSON.stringify(previousSlideContent)}` : "";
      userPrompt = `${userInjectPrompt || "Create an engaging slide for this lesson."}${prevContext}\nHub: ${hub}, CEFR: ${cefrLevel}, Topic: ${topic || "General English"}\nVariation seed: ${variationSeed} (use this to ensure your output differs from previous generations).`;

    } else {
      systemPrompt = `${unitLockPreamble}You are an elite Cambridge-certified ESL curriculum designer. You are NOT a generic content generator — you are a level-aware ESL specialist who refuses to produce repetitive or off-level content.

You MUST build this lesson using the strict PPP framework:
- Presentation: introduce the grammar/vocabulary clearly with concrete examples and visuals.
- Practice: create controlled exercises (fill-in-the-blank, matching, MCQ).
- Production: create a free-speaking roleplay or debate scenario so the student naturally uses the target language.

${hubContext}

${cefrRules}

Create a world-class 8-to-10 slide ESL lesson deck strictly following the PPP (Presentation, Practice, Production) methodology with deep scaffolding.

Output ONLY a valid JSON object (no markdown, no code blocks) matching this schema:
{
  "lesson_title": "A creative, engaging lesson title (NOT generic — tied directly to the requested topic)",
  "target_goal": "A single sentence describing what the student will be able to do by the end (e.g. 'Master the present continuous to describe ongoing actions').",
  "target_grammar": "The primary grammar/structure focus",
  "target_vocabulary": "Key vocabulary items (comma-separated)",
  "roadmap": ["Warm-up", "Presentation", "Practice", "Production", "Review"],
  "slides": [ /* array of slide objects */ ]
}

${SCHEMA_BLOCK}

CRITICAL RULES:
1. Strict PPP flow. Use ppp_stage values: Warm-Up → Presentation → Practice → Production → Review.
2. Duration: ${duration} minutes total.
3. Every slide MUST have BOTH a real YouTube URL (when relevant) AND a specific visual_search_keyword + image_prompt.
4. teacher_notes is ALWAYS an object with script, ccq (array), step_down, step_up. Never a plain string.
5. Use real famous ESL channels (BBC Learning English, English with Lucy, Super Simple Songs, etc.) for video URLs.
6. AT LEAST 3 of the slides MUST be interactive archetypes (roleplay, debate, activity, or interactive_quiz). NO all-text decks.
7. The lesson MUST stay strictly within the CEFR level above. Do NOT use grammar or vocabulary above the level cap.
8. AVOID these overused default topics unless the user explicitly requested them: ${banList}.
9. The lesson_title and slide content MUST be specific to the requested topic — never default to colors/apples/family/weather unless the user asked for it.

REQUIRED SLIDE SEQUENCE:
- Slide 1 — ppp_stage "Warm-Up", slide_type "title": lesson title + objectives.
- Slide 2 — ppp_stage "Warm-Up", slide_type "video_song": YouTube warm-up video.
- Slides 3-4 — ppp_stage "Presentation", slide_type "vocabulary_image" or "grammar_presentation": introduce target language with visuals + clear teacher script.
- Slides 5-7 — ppp_stage "Practice": MIX interactive_quiz + activity + (roleplay for A2+, debate for B1+). Step-Up / Step-Down REQUIRED in teacher_notes.
- Slide 8 — ppp_stage "Production", slide_type "speaking_prompt" or "roleplay" or "debate": free production task with CCQs.
- Slide 9 (optional) — ppp_stage "Review", slide_type "concept_check": exit ticket.`;

      userPrompt = `Create a complete PPP lesson deck for:
Topic: "${topic.trim()}"
CEFR Level: ${cefrLevel}
Variation seed: ${variationSeed} (use this to ensure your output differs from previous generations — vary your examples, scenarios, and characters).${
        targetGrammar ? `\nTarget Grammar/Structure: ${targetGrammar.trim()}` : ""
      }${
        targetVocabulary ? `\nTarget Vocabulary: ${targetVocabulary.trim()}` : ""
      }${
        studentAge ? `\nStudent Age/Level: ${studentAge}` : ""
      }${
        hub === "playground"
          ? `\n\nIMPORTANT — PLAYGROUND HUB AUDIENCE: Students are 4 to 9 years old. Use ultra-simple vocabulary, very short sentences (max 5 words per CEFR cap), lots of repetition, songs, chants, and visual cues. Avoid abstract grammar terms — teach patterns through examples and play. Tone must be warm, playful, and encouraging.`
          : ""
      }${
        lessonPrompt ? `\n\nAdditional context & instructions from the curriculum:\n${lessonPrompt.trim()}` : ""
      }`;
    }

    // Call AI with automatic failover (Gemini direct -> Lovable Gateway)
    const { aiCallWithFailover } = await import("../_shared/aiFailover.ts");
    let rawText = "";
    try {
      const result = await aiCallWithFailover({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        maxTokens: 8192,
        responseFormat: "json",
      });
      rawText = result.text;
      console.log(`Lesson plan generated via ${result.provider}`);
    } catch (aiErr) {
      console.error("AI failover exhausted:", aiErr);
      return new Response(
        JSON.stringify({
          error: true,
          message: "The AI curriculum engine is currently unavailable. Please try again in a few seconds.",
          details: aiErr instanceof Error ? aiErr.message : String(aiErr),
        }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    if (!rawText) {
      console.error("Empty Gemini response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "AI returned empty response" }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Defensive: strip ```json fences if Gemini ignored responseMimeType
    rawText = rawText.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Failed to parse AI JSON:", parseErr, rawText);
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON", raw: rawText }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Cycle 3 — post-generation forbidden-term validator with one retry.
    if (unitLockMeta) {
      const { findForbiddenThemeHit, normalizeCefr } = await import(
        "../_shared/pedagogy/index.ts"
      );
      const c = normalizeCefr(String(unitLockMeta.cefr));
      const hit = c ? findForbiddenThemeHit(parsedData, c) : null;
      if (hit) {
        console.warn("LESSON_PLAN_LOCK_VIOLATION (attempt 1):", hit);
        try {
          const repairPreamble =
            `🚫 REPAIR PASS — your previous output contained the forbidden term ` +
            `"${hit.term}" at path ${hit.path} (CEFR ${c}). ` +
            `Regenerate with zero references to wars, revolutions, empires, ` +
            `gladiators, or historical/political content. Stay STRICTLY inside the UNIT LOCK theme.\n\n`;
          const retry = await aiCallWithFailover({
            model: "gemini-2.5-flash",
            messages: [
              { role: "system", content: repairPreamble + systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            maxTokens: 8192,
            responseFormat: "json",
          });
          let retryText = retry.text.trim();
          if (retryText.startsWith("```")) {
            retryText = retryText.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
          }
          const retryParsed = JSON.parse(retryText);
          const retryHit = findForbiddenThemeHit(retryParsed, c!);
          if (!retryHit) {
            parsedData = retryParsed;
          } else {
            return new Response(
              JSON.stringify({
                error: "LESSON_LOCK_VIOLATION",
                message: `Lesson plan failed unit-lock validation: forbidden term "${retryHit.term}" at ${retryHit.path}`,
                violation: retryHit,
                unit_lock: unitLockMeta,
              }),
              { status: 422, headers: { ...CORS, "Content-Type": "application/json" } }
            );
          }
        } catch (repairErr) {
          console.error("Repair pass failed:", repairErr);
          return new Response(
            JSON.stringify({
              error: "LESSON_LOCK_VIOLATION",
              message: `Lesson plan failed unit-lock validation: forbidden term "${hit.term}" at ${hit.path}`,
              violation: hit,
              unit_lock: unitLockMeta,
            }),
            { status: 422, headers: { ...CORS, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Cycle 3 — final Slot-Fill drift overwrite. The lesson MUST inherit the
    // unit's theme/grammar/vocab — overwrite any LLM drift silently.
    if (unitLockMeta) {
      try {
        const { overwriteLessonDrift } = await import("../_shared/pedagogy/index.ts");
        const { lesson: corrected, drift } = overwriteLessonDrift(parsedData, {
          theme: String(unitLockMeta.theme),
          target_grammar: String(unitLockMeta.target_grammar),
          target_vocabulary_pool: (unitLockMeta.target_vocabulary_pool as string[]) || [],
        });
        if (drift.length) console.warn("🔒 Lesson-plan drift corrected:", drift.join(", "));
        parsedData = corrected;
      } catch (e) {
        console.warn("Drift overwrite skipped:", (e as Error).message);
      }
    }


    if (generationMode === "single_slide") {
      return new Response(
        JSON.stringify({ slide: parsedData, hub, cefr_level: cefrLevel, mode: "single_slide", unit_lock: unitLockMeta }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const lessonPlan = `# ${parsedData.lesson_title || topic.trim()}

## 📋 Target Summary
- **CEFR Level:** ${cefrLevel}
- **Grammar:** ${parsedData.target_grammar || 'N/A'}
- **Vocabulary:** ${parsedData.target_vocabulary || 'N/A'}
- **Duration:** ${duration} minutes
- **Hub:** ${hub.charAt(0).toUpperCase() + hub.slice(1)}

${(parsedData.slides || []).map((s: any, i: number) => {
  const tn = s.teacher_notes;
  const notesStr = typeof tn === 'object' && tn
    ? `Script: ${tn.script || ''}\nCCQs: ${(tn.ccq || []).join('; ')}\nStep-Down: ${tn.step_down || ''}\nStep-Up: ${tn.step_up || ''}`
    : (tn || '');
  const opts = Array.isArray(s.interactive_options) && s.interactive_options.length
    ? `\n*Interactive:* ${s.interactive_options.join(' | ')}`
    : '';
  return `### Slide ${i + 1} [${s.ppp_stage || ''} · ${s.slide_type || ''}]: ${s.headline}\n${s.body_text}${opts}\n\n*Teacher Notes:*\n${notesStr}`;
}).join('\n\n')}`;

    return new Response(
      JSON.stringify({
        lessonPlan,
        lessonData: parsedData,
        slides: parsedData.slides || [],
        lesson_title: parsedData.lesson_title,
        target_goal: parsedData.target_goal,
        target_grammar: parsedData.target_grammar,
        target_vocabulary: parsedData.target_vocabulary,
        roadmap: parsedData.roadmap || ["Warm-up", "Presentation", "Practice", "Production", "Review"],
        hub,
        cefr_level: cefrLevel,
        topic: topic?.trim(),
        mode: "full_deck",
        unit_lock: unitLockMeta,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
