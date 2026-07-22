// Early Learner Mode — strict prompt block injected when the audience
// is pre-readers / early readers (Playground all levels, Academy ≤A1).
// These rules mirror the QA validators in `src/qa/validators/earlyLearner.ts`
// so the generator produces compliant output on the first pass.

export interface EarlyLearnerContext {
  hub: 'playground' | 'academy' | 'success' | string;
  level: string;
}

export function isEarlyLearner(ctx: EarlyLearnerContext): boolean {
  const hub = (ctx.hub || '').toLowerCase();
  const lvl = (ctx.level || '').trim();
  if (hub === 'playground') return true;
  if (hub === 'academy' && (lvl === 'Pre-A1' || lvl === 'A1')) return true;
  return false;
}

export function buildEarlyLearnerPromptBlock(ctx: EarlyLearnerContext): string {
  if (!isEarlyLearner(ctx)) return '';
  return `
🧒 EARLY LEARNER MODE (HARD RULES — non-negotiable)
Audience: pre-readers / early readers. They learn from VISUALS + AUDIO, never from long text.

1. INSTRUCTION LENGTH
   • Every instruction / prompt / question ≤ 6 words.
   • Imperatives only: "Tap the cat.", "Drag to box.", "Match the picture.".
   • Total visible words per slide ≤ 12 (title + body + activity prompt combined).

2. VISUAL-FIRST ANSWERS
   • Every multiple-choice, matching, drag, listen-and-match option MUST carry
     an "image_prompt" string. Text labels are optional decoration only.
   • NEVER emit text-only options for early learners.

3. AUDIO IS MANDATORY
   • Every slide MUST include { "voice": { "text": "<≤6 words>", "autoPlay": true } }.
   • voice.text is what the student HEARS — write it as a simple spoken instruction.

4. NO ABSTRACT QUESTIONS
   • Forbidden words in any prompt: "why", "how come", "explain", "describe",
     "elaborate", "justify", "in your own words", "compare and contrast",
     "what do you think about".
   • Use point-and-name tasks instead.

5. NO READING PASSAGES
   • No multi-sentence paragraphs. No comprehension prose.
   • Comprehension = picture-pointing or listen-and-tap, never reading.

Violations are hard-blocked at QA and will force a full regeneration.
`.trim();
}
