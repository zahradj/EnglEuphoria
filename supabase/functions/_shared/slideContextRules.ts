/**
 * Slide-type Prompt Interceptor for text generation.
 * Returns an additional system instruction injected into the prompt
 * based on the slide type, so AI-generated copy stays pedagogically
 * aligned with the slide's purpose.
 */

export function slideTypeInstruction(slideType?: string): string {
  const t = (slideType || "").toLowerCase().trim();
  if (!t) return "";

  // Intro / opening / hook slides
  if (
    t === "intro" ||
    t === "introduction" ||
    t === "hero_media" ||
    t === "lesson_intro" ||
    t.includes("intro") ||
    t.includes("hook") ||
    t.includes("opening")
  ) {
    return "Provide a clear, engaging description identifying the core lesson objectives and what the student will achieve.";
  }

  // Vocabulary slides (flashcards, vocab lists, vocab intros)
  if (
    t === "vocabulary" ||
    t === "vocab" ||
    t === "vocab_list" ||
    t === "flashcard" ||
    t.includes("vocab")
  ) {
    return "Ensure the description perfectly matches the example sentence so the student clearly understands the context of the word.";
  }

  return "";
}
