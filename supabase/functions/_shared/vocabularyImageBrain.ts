/**
 * Vocabulary Image "Brain" — builds a fully-baked scene description for
 * vocabulary flashcard images, enforcing:
 *   1. Modesty Protocol (clothing + poses)
 *   2. Hub-specific clothing rules
 *   3. Age-appropriate art style per hub
 *   4. The 60% Branding Rule (50–60% of color area = hub primary family)
 *
 * The output of buildVocabularyPrompt() is the BASE scene prompt; the
 * generate-slide-image edge function still wraps it with applyHubStyle()
 * so the AI Art Director's house-style suffix remains in effect.
 */

import { normalizeArtHub, type ArtHub } from "./hubArtStyles.ts";

interface HubVisualRules {
  clothing: string;
  artStyle: string;
  brandColor: string;
  brandHex: string;
  brandFamily: string;
}

const RULES: Record<ArtHub, HubVisualRules> = {
  Playground: {
    clothing:
      "casual modest children's clothing — long t-shirts, full-length pants/shorts to the knee, simple dresses with sleeves; nothing tight or revealing",
    artStyle:
      "cute flat 2D cartoon / vector illustration in the spirit of a friendly children's picture book; rounded shapes, big expressive eyes, innocence and fun, joyful playful mood",
    brandColor: "warm orange (#FE6A2F) accented with sunny yellow (#FEFBDD)",
    brandHex: "#FE6A2F",
    brandFamily: "warm orange / yellow",
  },
  Academy: {
    clothing:
      "tidy school uniforms — button-up shirts, sweaters, knee-length skirts or trousers; modest, age-appropriate teen styling",
    artStyle:
      "modern comic / webtoon illustration with clean linework, relatable real-world teen scenarios (classroom, library, café, sports field); slice-of-life mood",
    brandColor: "rich purple (#6B21A8) with lavender (#F5F3FF)",
    brandHex: "#6B21A8",
    brandFamily: "purple / violet",
  },
  Success: {
    clothing:
      "business-casual professional attire — blazers, button-down shirts, modest blouses, tailored trousers or knee-length skirts; refined and respectful",
    artStyle:
      "professional editorial photography style, sleek and highly realistic, business and global scenarios (office, boardroom, airport lounge, conference)",
    brandColor: "emerald green (#059669) with mint (#F0FDFA)",
    brandHex: "#059669",
    brandFamily: "emerald / mint green",
  },
};

const MODESTY_PROTOCOL = [
  "[MODESTY PROTOCOL — STRICT, NON-NEGOTIABLE]",
  "• Clothing must be universally modest, professional, and respectful for an educational environment.",
  "• No tight, revealing, sheer, low-cut, midriff-baring, or culturally insensitive clothing.",
  "• Poses must be dignified and respectful — never suggestive, never provocative, never lying down in an intimate way.",
  "• No close physical contact between characters unless it is clearly familial or professional assistance (e.g. a teacher pointing to a book).",
  "• No alcohol, weapons, gambling, or mature themes.",
].join("\n");

export interface VocabularyBrainInput {
  vocabulary_word: string;
  example_sentence?: string;
  hub?: string;
}

export function buildVocabularyPrompt(input: VocabularyBrainInput): string {
  const hub = normalizeArtHub(input.hub);
  const rules = RULES[hub];
  const word = (input.vocabulary_word || "").trim();
  const sentence = (input.example_sentence || "").trim();

  return [
    `[VOCABULARY FLASHCARD IMAGE — focal word: "${word}"]`,
    `PRIMARY SUBJECT (MANDATORY): the image MUST clearly depict "${word}" as the large, centered, unambiguous hero of the composition. Do not substitute, omit, or abstract the subject.`,
    sentence
      ? `Scene context (for meaning only, never replaces the subject): "${sentence}".`
      : `Render a clear, literal depiction that teaches the meaning of "${word}".`,
    "",
    `[FRAMING — STRICT, NON-NEGOTIABLE]`,
    `EXTREME CLOSE-UP, tight sticker-style crop. The subject MUST fill 85–95% of the frame edge-to-edge, touching or nearly touching the top, bottom, and side margins. Zero empty padding, zero negative space, zero whitespace border around the subject. If the subject is small (an object, a shape, a face), zoom in until it fills the canvas. Treat the composition like a die-cut sticker: subject in the center, background reduced to a thin halo behind the subject only. Do NOT render the subject small, centered on a large empty canvas.`,
    "",
    `[BACKGROUND]`,
    `Plain, clean, softly lit background — solid off-white or a single gentle neutral tone, visible only as a thin halo behind the subject. No sky, no clouds, no busy scenery, no patterned wallpaper, no environmental storytelling. The background must never compete with the subject and must never occupy more than 15% of the frame.`,
    "",
    `[ART STYLE — ${hub} Hub]`,
    rules.artStyle + ".",
    "",
    `[CHARACTER WARDROBE]`,
    `All characters wear ${rules.clothing}.`,
    "",
    MODESTY_PROTOCOL,
    "",
    `[BRAND ACCENT RULE — accents only, never dominant]`,
    `Add small ${rules.brandFamily} (${rules.brandColor}) accents on props, clothing details, or a single small object — roughly 10–20% of the visible area. Brand color must NEVER be applied to the background, sky, walls, or floor, and must NEVER overwhelm the subject's natural colors.`,
    "",
    "No text, letters, numbers, or watermarks anywhere in the image. Centered, balanced composition, single clear subject filling the frame edge-to-edge.",
  ].join("\n");
}
