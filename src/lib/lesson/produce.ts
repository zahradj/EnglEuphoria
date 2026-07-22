// ⚠️ AUTOMATICALLY GENERATED FILE VIA UNIT FACTORY - DO NOT EDIT BY HAND

export interface ProduceItem {
  id: string;
  name: string;
  image: string;
  emoji: string;
  category: "core" | "expansion" | "complex" | "people";
}

export interface StoryScene {
  id: number;
  image: string;
  text: string;
  gapWord: string;
}

/**
 * 🍏 UNIFIED LEXICAL CATALOG FOR THE PRODUCE UNIT
 * Houses all items from Lesson 1, Lesson 2, Lesson 3, and relational terms.
 * Image paths are placeholders; routes render via `emoji` until art ships.
 */
export const PRODUCE_VOCAB: ProduceItem[] = [
  // Lesson 1 Core Items (capped at 3)
  { id: "p1", name: "apple",      image: "", emoji: "🍎", category: "core" },
  { id: "p2", name: "banana",     image: "", emoji: "🍌", category: "core" },
  { id: "p3", name: "carrot",     image: "", emoji: "🥕", category: "core" },

  // Lesson 2 Expansion Items (3 new elements)
  { id: "p4", name: "strawberry", image: "", emoji: "🍓", category: "expansion" },
  { id: "p5", name: "broccoli",   image: "", emoji: "🥦", category: "expansion" },
  { id: "p6", name: "lemon",      image: "", emoji: "🍋", category: "expansion" },

  // Lesson 3 Complex Stacking Items (3 advanced items)
  { id: "p7", name: "watermelon", image: "", emoji: "🍉", category: "complex" },
  { id: "p8", name: "pumpkin",    image: "", emoji: "🎃", category: "complex" },
  { id: "p9", name: "cucumber",   image: "", emoji: "🥒", category: "complex" },

  // Level-Appropriate Relational Items
  { id: "p10", name: "boy",  image: "", emoji: "👦", category: "people" },
  { id: "p11", name: "girl", image: "", emoji: "👧", category: "people" },
  { id: "p12", name: "baby", image: "", emoji: "👶", category: "people" },
];

/**
 * 🔒 IMMUTABLE OSASCOMP INDEFINITE ARTICLE EVALUATOR
 * Returns "a" / "an" based on the first descriptor's leading vowel sound.
 * e.g., article("small") => "a", article("enormous") => "an".
 */
export function article(firstDescriptor: string): string {
  const normalized = firstDescriptor.toLowerCase().trim();
  if (normalized.length === 0) return "a";
  return /^[aeiou]/i.test(normalized) ? "an" : "a";
}

/**
 * 👋 MANDATORY SIGN / GESTURE DICTIONARY MAP FOR LESSON 4
 * Anchors sensory meaning visually during the silent onboarding phase.
 */
export const STORY_SIGN_LANG_MAP: Record<string, { description: string; emoji: string }> = {
  apple:      { description: "Rub tummy clockwise",                        emoji: "🍎" },
  watermelon: { description: "Form a large sphere with both hands",        emoji: "🍉" },
  strawberry: { description: "Pinch fingers together and bite lightly",    emoji: "🍓" },
  happy:      { description: "Smile widely and tap chest twice",           emoji: "😊" },
  garden:     { description: "Spread arms wide outward to indicate fields",emoji: "🏡" },
};

/**
 * 📚 LESSON 4 STORYBOOK: "THE MAGIC GARDEN RESCUE" SCENES
 */
export const STORY_PAGES: StoryScene[] = [
  {
    id: 1,
    image: "",
    text: "The boy and girl look at the tree. It has a small red apple.",
    gapWord: "apple",
  },
  {
    id: 2,
    image: "",
    text: "Look! In the green grass, there is a big green watermelon.",
    gapWord: "watermelon",
  },
  {
    id: 3,
    image: "",
    text: "The children are happy because they love fresh fruit from the garden.",
    gapWord: "happy",
  },
];
