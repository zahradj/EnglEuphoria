import scenePets from "@/assets/story/scene-pets.jpg";
import sceneJungle from "@/assets/story/scene-jungle.jpg";
import sceneOcean from "@/assets/story/scene-ocean.jpg";

export type StoryPage = {
  id: string;
  image: string;
  /** Full sentences for the pre-read (assigned before the lesson). */
  text: string[];
  /**
   * Same sentences with a single blank marked as "___" per sentence.
   * Each blank has an answer + 2 distractors (all from Lessons 1–3 vocab).
   */
  gaps: { sentence: string; answer: string; options: string[] }[];
};

export const STORY_TITLE = "Cat and Dog's Big Day";

export const STORY_PAGES: StoryPage[] = [
  {
    id: "pets",
    image: scenePets,
    text: [
      "It is a small white cat.",
      "It is a big brown dog.",
      "The cat and the dog are friends.",
    ],
    gaps: [
      { sentence: "It is a small white ___.", answer: "cat", options: ["cat", "fish", "tiger"] },
      { sentence: "It is a big ___ dog.", answer: "brown", options: ["brown", "orange", "red"] },
      { sentence: "The cat and the ___ are friends.", answer: "dog", options: ["dog", "crab", "monkey"] },
    ],
  },
  {
    id: "jungle",
    image: sceneJungle,
    text: [
      "They go to the jungle.",
      "They see an orange tiger.",
      "They see a brown monkey.",
    ],
    gaps: [
      { sentence: "They go to the ___.", answer: "jungle", options: ["jungle", "sea", "park"] },
      { sentence: "They see an orange ___.", answer: "tiger", options: ["tiger", "fish", "cat"] },
      { sentence: "They see a ___ monkey.", answer: "brown", options: ["brown", "white", "red"] },
    ],
  },
  {
    id: "ocean",
    image: sceneOcean,
    text: [
      "They go to the sea.",
      "They see a small orange fish.",
      "They see a red crab. What a fun day!",
    ],
    gaps: [
      { sentence: "They go to the ___.", answer: "sea", options: ["sea", "jungle", "house"] },
      { sentence: "They see a small orange ___.", answer: "fish", options: ["fish", "tiger", "dog"] },
      { sentence: "They see a ___ crab.", answer: "red", options: ["red", "brown", "white"] },
    ],
  },
];

export type Level = "preA1" | "A1" | "A2";

export type ComprehensionQ = {
  q: string;
  options: string[];
  answer: string;
};

/**
 * Comprehension questions tiered by CEFR level.
 * Pre-A1: yes/no or one-word identification.
 * A1: "What color…?" / "What animal…?" simple wh-questions.
 * A2: full sentence questions stacking color + size + animal.
 */
export const COMPREHENSION: Record<Level, ComprehensionQ[]> = {
  preA1: [
    { q: "Is the cat white?", options: ["Yes", "No"], answer: "Yes" },
    { q: "Is the tiger blue?", options: ["Yes", "No"], answer: "No" },
    { q: "Is the dog big?", options: ["Yes", "No"], answer: "Yes" },
  ],
  A1: [
    { q: "What color is the tiger?", options: ["orange", "brown", "white"], answer: "orange" },
    { q: "What color is the monkey?", options: ["brown", "red", "orange"], answer: "brown" },
    { q: "Where do they go first?", options: ["jungle", "sea", "house"], answer: "jungle" },
    { q: "What animal is red?", options: ["crab", "fish", "tiger"], answer: "crab" },
  ],
  A2: [
    {
      q: "What does the cat look like?",
      options: ["It is a small white cat.", "It is a big brown cat.", "It is a red small cat."],
      answer: "It is a small white cat.",
    },
    {
      q: "What does the dog look like?",
      options: ["It is a big brown dog.", "It is a small white dog.", "It is an orange big dog."],
      answer: "It is a big brown dog.",
    },
    {
      q: "What do they see in the sea?",
      options: [
        "A small orange fish and a red crab.",
        "A brown monkey and an orange tiger.",
        "A white cat and a brown dog.",
      ],
      answer: "A small orange fish and a red crab.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Post-reading: Look & Say (A2 / B1 / B2)                                   */
/* -------------------------------------------------------------------------- */
/**
 * Inspired by a classroom "Look & Say" organizer (Who · Where · What).
 * After reading the story, students rebuild the gist using a graphic
 * organizer. The intensity scales with CEFR level:
 *
 *  - A2 → ONE short sentence per slot (Who / Where / What).
 *  - B1 → TWO ideas per slot, joined with "because" / "and".
 *  - B2 → A 3–4 sentence retell with sequencing (first / then / finally),
 *         feelings and cause/effect.
 *
 * Each prompt has a model answer used for self-check + TTS playback.
 */
export type LookSayLevel = "A2" | "B1" | "B2";

export type LookSaySlot = {
  /** Visible label, e.g. "👤 Who". */
  label: string;
  /** Question shown under the label. */
  prompt: string;
  /** Sentence frame the student fills in (placeholder for the blank). */
  frame: string;
  /** Model answer used for reveal + TTS. */
  model: string;
};

export type LookSayCard = {
  pageId: StoryPage["id"];
  title: string;
  slots: LookSaySlot[];
};

export const LOOK_AND_SAY: Record<LookSayLevel, LookSayCard[]> = {
  A2: [
    {
      pageId: "pets",
      title: "The cat and the dog",
      slots: [
        { label: "👤 Who", prompt: "Who is in the story?", frame: "It is a ___ and a ___.", model: "It is a cat and a dog." },
        { label: "📍 Where", prompt: "Where are they?", frame: "They are at ___.", model: "They are at home." },
        { label: "❓ What", prompt: "What are they?", frame: "They are ___.", model: "They are friends." },
      ],
    },
    {
      pageId: "jungle",
      title: "In the jungle",
      slots: [
        { label: "👤 Who", prompt: "Who do they see?", frame: "They see a ___ and a ___.", model: "They see a tiger and a monkey." },
        { label: "📍 Where", prompt: "Where do they go?", frame: "They go to the ___.", model: "They go to the jungle." },
        { label: "❓ What", prompt: "What colour is the tiger?", frame: "The tiger is ___.", model: "The tiger is orange." },
      ],
    },
    {
      pageId: "ocean",
      title: "At the sea",
      slots: [
        { label: "👤 Who", prompt: "Who do they see in the sea?", frame: "They see a ___ and a ___.", model: "They see a fish and a crab." },
        { label: "📍 Where", prompt: "Where do they go next?", frame: "They go to the ___.", model: "They go to the sea." },
        { label: "❓ What", prompt: "What colour is the crab?", frame: "The crab is ___.", model: "The crab is red." },
      ],
    },
  ],
  B1: [
    {
      pageId: "pets",
      title: "The cat and the dog",
      slots: [
        { label: "👤 Who", prompt: "Who are the main characters and what do they look like?", frame: "The story is about ___ and ___.", model: "The story is about a small white cat and a big brown dog." },
        { label: "📍 Where", prompt: "Where does the story start and why?", frame: "It starts at ___ because ___.", model: "It starts at home because the cat and the dog are friends and live together." },
        { label: "❓ What", prompt: "What do they decide to do?", frame: "They decide to ___ because ___.", model: "They decide to go on a trip because they want to see new places." },
      ],
    },
    {
      pageId: "jungle",
      title: "In the jungle",
      slots: [
        { label: "👤 Who", prompt: "Who do they meet and what do they look like?", frame: "They meet ___ and ___.", model: "They meet an orange tiger and a brown monkey." },
        { label: "📍 Where", prompt: "Where are they and what is it like?", frame: "They are in the ___ and it is ___.", model: "They are in the jungle and it is green and full of trees." },
        { label: "❓ What", prompt: "What happens and how do they feel?", frame: "They ___ and they feel ___.", model: "They look at the animals and they feel excited because everything is new." },
      ],
    },
    {
      pageId: "ocean",
      title: "At the sea",
      slots: [
        { label: "👤 Who", prompt: "Who do they see and what do they look like?", frame: "They see ___ and ___.", model: "They see a small orange fish and a red crab." },
        { label: "📍 Where", prompt: "Where are they and why is it different?", frame: "They are at the ___ and it is different because ___.", model: "They are at the sea and it is different because everything is wet and blue." },
        { label: "❓ What", prompt: "What happens at the end of the day?", frame: "At the end of the day, ___ because ___.", model: "At the end of the day, they go home because they had a lot of fun." },
      ],
    },
  ],
  B2: [
    {
      pageId: "pets",
      title: "The cat and the dog",
      slots: [
        { label: "👤 Who", prompt: "Introduce the characters and their personalities.", frame: "First, ___. Then, ___. Finally, ___.", model: "First, we meet a small, curious white cat. Then, we meet a big, friendly brown dog. Finally, we see that despite their differences, they are best friends." },
        { label: "📍 Where", prompt: "Describe the setting and how it changes through the story.", frame: "The story moves from ___ to ___ and finally to ___.", model: "The story moves from a cozy home, to the wild jungle, and finally to the open sea, showing how friendship can travel anywhere." },
        { label: "❓ What", prompt: "Explain the main events using cause and effect.", frame: "Because ___, they ___. As a result, ___.", model: "Because they were curious about the world, they left home together. As a result, they discovered new animals and learned that adventure is better when shared." },
      ],
    },
    {
      pageId: "jungle",
      title: "In the jungle",
      slots: [
        { label: "👤 Who", prompt: "Who do they meet and how do these characters react?", frame: "They encounter ___ who ___, and ___ who ___.", model: "They encounter an orange tiger who watches them carefully, and a brown monkey who jumps from tree to tree to greet them." },
        { label: "📍 Where", prompt: "Describe the jungle using your senses (see, hear, feel).", frame: "In the jungle, they see ___, they hear ___, and they feel ___.", model: "In the jungle, they see tall green trees, they hear birds singing loudly, and they feel the warm, wet air on their faces." },
        { label: "❓ What", prompt: "What problem or feeling appears here, and how is it solved?", frame: "At first ___, but then ___, so ___.", model: "At first the cat is a little scared of the tiger, but then the monkey makes them laugh, so they all become friends." },
      ],
    },
    {
      pageId: "ocean",
      title: "At the sea",
      slots: [
        { label: "👤 Who", prompt: "Who do they meet at the sea and how are they different from before?", frame: "Unlike the jungle animals, the ___ and the ___ ___.", model: "Unlike the jungle animals, the small orange fish and the red crab live in the water and move in completely different ways." },
        { label: "📍 Where", prompt: "Compare the sea to the other places they visited.", frame: "The sea is more ___ than ___ because ___.", model: "The sea is more peaceful than the jungle because everything is blue and quiet under the waves." },
        { label: "❓ What", prompt: "What is the message of the story? Justify your answer.", frame: "The message is that ___ because ___.", model: "The message is that friends can enjoy any adventure together because being with someone you trust turns even a strange place into a great day." },
      ],
    },
  ],
};
