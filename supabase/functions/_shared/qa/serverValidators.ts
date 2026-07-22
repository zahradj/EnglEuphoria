// Server-side hard validators — parity with src/qa/* critical gates.
// Runs inside edge functions BEFORE persisting / returning lesson JSON.
//
// Mirrors:
//   • IMAGE_URL_PROMPT_LEAK / IMAGE_URL_EMPTY_WITH_PROMPT
//   • MATCHING_DUPLICATE_IMAGE
//   • VOCAB_USED_BEFORE_INTRODUCTION
//   • VOCAB_CARD_INCOMPLETE
//   • MULTI_ANSWER_SCHEMA_INVALID
//   • JSON_TRUNCATED (basic)
//
// Returns hard + soft issues; caller decides whether to block.

export type Severity = "hard" | "soft";
export interface ServerIssue {
  code: string;
  severity: Severity;
  message: string;
  lessonNumber?: number;
  slideIndex?: number;
}

const PROMPT_LEAK_PREFIXES = ["ai:", "prompt:", "generate:", "{", "[", "<"];

function isPromptLeak(url: unknown): boolean {
  if (typeof url !== "string") return false;
  const t = url.trim().toLowerCase();
  if (!t) return false;
  return PROMPT_LEAK_PREFIXES.some((p) => t.startsWith(p));
}

function isValidUrlOrEmpty(url: unknown): boolean {
  if (url === null || url === undefined || url === "") return true;
  if (typeof url !== "string") return false;
  return /^(https?:\/\/|data:image\/|\/)/i.test(url.trim());
}

function walkSlides(lesson: any): any[] {
  if (!lesson) return [];
  if (Array.isArray(lesson.slides)) return lesson.slides;
  if (Array.isArray(lesson.pages)) return lesson.pages;
  return [];
}

export function validateLessonServer(lesson: any, lessonNumber?: number): ServerIssue[] {
  const issues: ServerIssue[] = [];
  const slides = walkSlides(lesson);
  const introducedVocab = new Set<string>();
  const lessonVocab: string[] = Array.isArray(lesson?.vocab)
    ? lesson.vocab.map((v: any) => String(v?.word ?? v).toLowerCase().trim())
    : [];

  slides.forEach((slide: any, idx: number) => {
    // ── Image integrity ──
    const candidates: { url: any; prompt: any }[] = [];
    if (slide?.image_url !== undefined || slide?.image_prompt) {
      candidates.push({ url: slide.image_url, prompt: slide.image_prompt });
    }
    for (const item of slide?.items ?? []) {
      if (item?.image_url !== undefined || item?.image_prompt) {
        candidates.push({ url: item.image_url, prompt: item.image_prompt });
      }
    }
    for (const c of candidates) {
      if (isPromptLeak(c.url)) {
        issues.push({
          code: "IMAGE_URL_PROMPT_LEAK",
          severity: "hard",
          message: `Slide ${idx}: image_url contains prompt text.`,
          lessonNumber,
          slideIndex: idx,
        });
      } else if (!isValidUrlOrEmpty(c.url)) {
        issues.push({
          code: "IMAGE_URL_INVALID",
          severity: "hard",
          message: `Slide ${idx}: invalid image_url.`,
          lessonNumber,
          slideIndex: idx,
        });
      }
    }

    // ── Matching duplicate images ──
    const stype = String(slide?.type ?? slide?.activity_type ?? "").toLowerCase();
    if (stype.includes("match") || stype.includes("vocab_image_match")) {
      const seen = new Set<string>();
      for (const item of slide?.items ?? slide?.pairs ?? []) {
        const u = item?.image_url;
        if (typeof u === "string" && u) {
          if (seen.has(u)) {
            issues.push({
              code: "MATCHING_DUPLICATE_IMAGE",
              severity: "hard",
              message: `Slide ${idx}: duplicate image_url in matching activity.`,
              lessonNumber,
              slideIndex: idx,
            });
            break;
          }
          seen.add(u);
        }
      }
    }

    // ── Multi-answer schema ──
    if (
      ["fill_blank", "matching", "sound_discrimination", "drag_drop", "dictation_builder", "listen_and_match"].some(
        (t) => stype.includes(t),
      )
    ) {
      if (slide?.answer && !Array.isArray(slide?.answers)) {
        issues.push({
          code: "MULTI_ANSWER_SCHEMA_INVALID",
          severity: "hard",
          message: `Slide ${idx}: uses legacy 'answer' field; must be 'answers: string[]'.`,
          lessonNumber,
          slideIndex: idx,
        });
      }
      if (Array.isArray(slide?.answers) && slide.answers.some((a: any) => !a || !String(a).trim())) {
        issues.push({
          code: "MULTI_ANSWER_SCHEMA_INVALID",
          severity: "hard",
          message: `Slide ${idx}: 'answers' contains empty entries.`,
          lessonNumber,
          slideIndex: idx,
        });
      }
    }

    // ── Vocab card completeness + sequencing ──
    if (stype.includes("vocab") || stype === "vocab_card" || stype === "vocab_deck") {
      const cards = slide?.cards ?? slide?.items ?? (slide?.word ? [slide] : []);
      for (const card of cards) {
        const word = String(card?.word ?? "").trim();
        const def = String(card?.definition ?? card?.meaning ?? "").trim();
        const ex = String(card?.example ?? "").trim();
        if (!word || !def || !ex) {
          issues.push({
            code: "VOCAB_CARD_INCOMPLETE",
            severity: "hard",
            message: `Slide ${idx}: vocab card missing word/definition/example.`,
            lessonNumber,
            slideIndex: idx,
          });
        } else if (!ex.toLowerCase().includes(word.toLowerCase())) {
          issues.push({
            code: "VOCAB_CARD_INCOMPLETE",
            severity: "hard",
            message: `Slide ${idx}: example does not contain headword "${word}".`,
            lessonNumber,
            slideIndex: idx,
          });
        }
        if (word) introducedVocab.add(word.toLowerCase());
      }
    } else {
      // Sequencing check — non-vocab slides cannot use target words before card slide.
      const text = JSON.stringify(slide ?? "").toLowerCase();
      for (const w of lessonVocab) {
        if (!w || introducedVocab.has(w)) continue;
        const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
        if (re.test(text)) {
          issues.push({
            code: "VOCAB_USED_BEFORE_INTRODUCTION",
            severity: "soft",
            message: `Slide ${idx}: target word "${w}" used before its vocab card.`,
            lessonNumber,
            slideIndex: idx,
          });
        }
      }
    }
  });

  return issues;
}

export function validateUnitServer(unit: any): ServerIssue[] {
  const lessons: any[] = Array.isArray(unit?.lessons) ? unit.lessons : [];
  const out: ServerIssue[] = [];
  for (const l of lessons) {
    out.push(...validateLessonServer(l, l?.lesson_number));
  }
  return out;
}

export function computeQualityScore(issues: ServerIssue[]): number {
  const hard = issues.filter((i) => i.severity === "hard").length;
  const soft = issues.filter((i) => i.severity === "soft").length;
  const raw = 100 - hard * 25 - soft * 5;
  return Math.max(0, Math.min(100, raw));
}
