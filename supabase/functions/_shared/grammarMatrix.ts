// Curriculum Brain — Grammar Progression Matrix
// Grammar MUST be selected from the topic's communicative goal + CEFR level.
// Grammar must NEVER be fixed across units (no "It is a..." repeated everywhere).
//
// Pipeline contract enforced by buildGrammarDirective():
//   Topic -> Communication Goal -> Vocabulary -> Grammar -> Activities -> Assessment

export interface TopicGrammarSpec {
  /** Topic keywords (lowercased substrings matched against the unit topic). */
  keywords: string[];
  /** What the student must be able to DO with language about this topic. */
  communicationGoal: string;
  /** CEFR-stratified grammar structures. Pick the highest entry <= learner CEFR. */
  grammarByCefr: Partial<Record<CefrLevel, string[]>>;
  /** Sample sentences modelling the target grammar in topic context. */
  examples: string[];
}

export type CefrLevel = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1";

const CEFR_ORDER: CefrLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1"];

export const GRAMMAR_MATRIX: TopicGrammarSpec[] = [
  {
    keywords: ["greeting", "greetings", "introduction", "introductions", "hello", "hi", "meet"],
    communicationGoal: "Greet someone, say your name, and close a short first-meeting exchange.",
    grammarByCefr: {
      "Pre-A1": ["Hello!", "Hi!", "My name is ___", "Nice to meet you", "Goodbye"],
      "A1": ["My name is ___", "I am ___", "What's your name?", "Nice to meet you"],
      "A2": ["Polite opening and closing phrases", "Short introduction exchange"],
      "B1": ["Small-talk openings", "Follow-up questions for introductions"],
    },
    examples: ["Hello! My name is Pip.", "Hi! My name is Bella.", "Nice to meet you!"],
  },
  {
    keywords: ["animal", "pet", "zoo", "wildlife"],
    communicationGoal: "Describe animals (what they are, what they have, what they do).",
    grammarByCefr: {
      "Pre-A1": ["It is a ___", "It has ___", "Adjectives (big, small, fast)"],
      "A1": ["It is / It has + adjectives", "Plural nouns (cats, dogs)"],
      "A2": ["Present Simple for habits (eats, lives, sleeps)", "Comparatives (bigger than)"],
      "B1": ["Relative clauses (an animal that lives in...)", "Superlatives"],
    },
    examples: ["It is a tiger.", "It has stripes.", "Tigers live in the jungle."],
  },
  {
    keywords: ["family", "relative", "parent"],
    communicationGoal: "Introduce family members and talk about relationships.",
    grammarByCefr: {
      "Pre-A1": ["This is my ___", "I have ___", "Possessive adjectives (my, your)"],
      "A1": ["Possessive 's", "have / has got"],
      "A2": ["Present Simple (works, lives)", "Object pronouns"],
      "B1": ["Used to (for past family habits)", "Relative clauses (the brother who...)"],
    },
    examples: ["This is my mother.", "I have one sister.", "My brother's name is Sam."],
  },
  {
    keywords: ["food", "fruit", "drink", "meal", "cook"],
    communicationGoal: "Express likes, dislikes and preferences about food.",
    grammarByCefr: {
      "Pre-A1": ["I like ___", "I don't like ___", "Do you like ___?"],
      "A1": ["Countable / uncountable (an apple, some rice)", "a / an / some"],
      "A2": ["Quantifiers (much, many, a lot of)", "Would like for polite requests"],
      "B1": ["First conditional (If I eat..., I will...)", "Used to for past habits"],
    },
    examples: ["I like apples.", "Do you like pizza?", "I don't like fish."],
  },
  {
    keywords: ["school", "classroom", "study"],
    communicationGoal: "Talk about classroom objects and school activities.",
    grammarByCefr: {
      "Pre-A1": ["There is ___", "There are ___", "This is / These are"],
      "A1": ["Prepositions of place (on, in, under)", "Plurals"],
      "A2": ["Present Continuous (I am studying)", "Can for ability"],
      "B1": ["Modals must / have to for rules", "Reported speech (the teacher said...)"],
    },
    examples: ["There is a book on the desk.", "These are my pencils."],
  },
  {
    keywords: ["routine", "daily", "habit", "morning", "day"],
    communicationGoal: "Describe daily habits and routines.",
    grammarByCefr: {
      "Pre-A1": ["Simple verbs (wake up, eat, sleep)", "Times of day"],
      "A1": ["Present Simple", "Adverbs of frequency (always, usually, never)"],
      "A2": ["Time expressions (at 7, on Monday, in the morning)"],
      "B1": ["Present Simple vs Present Continuous", "Used to for past routines"],
    },
    examples: ["I wake up at 7.", "I usually brush my teeth.", "She never eats breakfast."],
  },
  {
    keywords: ["weather", "season", "climate"],
    communicationGoal: "Describe current weather and seasonal conditions.",
    grammarByCefr: {
      "Pre-A1": ["It is ___ (sunny, hot, cold)"],
      "A1": ["It is + adjective", "Basic Present Continuous (It is raining)"],
      "A2": ["Present Continuous for now vs Present Simple for general"],
      "B1": ["Future with going to / will for forecasts"],
    },
    examples: ["It is sunny.", "It is raining.", "Tomorrow it will be cold."],
  },
  {
    keywords: ["place", "city", "town", "country", "direction"],
    communicationGoal: "Describe locations and give directions.",
    grammarByCefr: {
      "Pre-A1": ["Prepositions (in, on, next to)"],
      "A1": ["There is / There are + place", "Prepositions of place"],
      "A2": ["Imperatives for directions (turn, go, cross)"],
      "B1": ["Relative clauses (the city where I live)"],
    },
    examples: ["The bank is next to the school.", "Turn left at the corner."],
  },
  {
    keywords: ["job", "work", "profession", "career"],
    communicationGoal: "Talk about jobs, abilities and workplace skills.",
    grammarByCefr: {
      "Pre-A1": ["I am a ___", "Job nouns"],
      "A1": ["Can / Can't for ability", "Present Simple (works, helps)"],
      "A2": ["Have to for obligations", "Adverbs of manner"],
      "B1": ["Present Perfect for experience (I have worked...)"],
      "B2": ["Passive voice (is employed by...)"],
    },
    examples: ["She is a doctor.", "He can fix cars.", "Nurses have to work at night."],
  },
  {
    keywords: ["future", "plan", "tomorrow", "next"],
    communicationGoal: "Talk about future plans and intentions.",
    grammarByCefr: {
      "A1": ["Tomorrow / next week + Present Simple"],
      "A2": ["Going to for plans", "Present Continuous for arrangements"],
      "B1": ["Will vs going to", "First conditional"],
      "B2": ["Future Continuous / Future Perfect"],
    },
    examples: ["I am going to visit my grandma.", "We will travel next summer."],
  },
  {
    keywords: ["experience", "travel", "have you ever"],
    communicationGoal: "Share past experiences and travel stories.",
    grammarByCefr: {
      "A2": ["Past Simple (regular & irregular)"],
      "B1": ["Present Perfect (have you ever...?)", "Past Simple vs Present Perfect"],
      "B2": ["Past Perfect", "Narrative tenses"],
      "C1": ["Mixed conditionals for hypothetical past experiences"],
    },
    examples: ["I have been to Spain.", "Have you ever tried sushi?"],
  },
  {
    keywords: ["hobby", "free time", "sport", "music"],
    communicationGoal: "Talk about hobbies and free-time activities.",
    grammarByCefr: {
      "Pre-A1": ["I like ___ + noun"],
      "A1": ["Verb + -ing (I like swimming)", "Present Simple"],
      "A2": ["Adverbs of frequency", "How often...?"],
      "B1": ["Gerunds vs infinitives (enjoy doing / want to do)"],
    },
    examples: ["I like playing football.", "She enjoys reading books."],
  },
  {
    keywords: ["health", "body", "doctor", "sick"],
    communicationGoal: "Describe symptoms and give health advice.",
    grammarByCefr: {
      "A1": ["I have + symptom (a headache)"],
      "A2": ["Should / shouldn't for advice"],
      "B1": ["If you ___, you should ___ (zero/first conditional)"],
      "B2": ["Modals of speculation (might, could, must)"],
    },
    examples: ["I have a sore throat.", "You should drink water."],
  },
  {
    keywords: ["shopping", "clothes", "money", "store"],
    communicationGoal: "Make purchases and talk about prices.",
    grammarByCefr: {
      "A1": ["How much is...?", "This / that / these / those"],
      "A2": ["Comparatives (cheaper, more expensive)"],
      "B1": ["Too / enough", "Indirect questions (Could you tell me how much...?)"],
    },
    examples: ["How much is this shirt?", "These shoes are cheaper than those."],
  },
];

/** Generic fallback when no topic keyword matches — still CEFR-progressive. */
const FALLBACK_GRAMMAR_BY_CEFR: Record<CefrLevel, string[]> = {
  "Pre-A1": ["This is ___", "It is ___", "I have ___"],
  "A1": ["Present Simple (affirmative & negative)", "a / an / the"],
  "A2": ["Past Simple", "Comparatives & superlatives"],
  "B1": ["Present Perfect", "First & second conditionals"],
  "B2": ["Passive voice", "Reported speech"],
  "C1": ["Mixed conditionals", "Advanced discourse markers"],
};

function pickAtOrBelow(spec: Partial<Record<CefrLevel, string[]>>, cefr: CefrLevel): { level: CefrLevel; items: string[] } | null {
  const idx = CEFR_ORDER.indexOf(cefr);
  for (let i = idx; i >= 0; i--) {
    const lvl = CEFR_ORDER[i];
    const items = spec[lvl];
    if (items && items.length) return { level: lvl, items };
  }
  return null;
}

export interface ResolvedGrammar {
  matchedTopic: string | null;
  communicationGoal: string;
  cefrUsed: CefrLevel;
  grammar: string[];
  examples: string[];
}

export function resolveGrammarFromMatrix(topic: string, cefr: string): ResolvedGrammar {
  const cefrSafe: CefrLevel = (CEFR_ORDER as string[]).includes(cefr) ? (cefr as CefrLevel) : "A1";
  const t = (topic || "").toLowerCase();
  const match = GRAMMAR_MATRIX.find((s) => s.keywords.some((k) => t.includes(k)));
  if (match) {
    const picked = pickAtOrBelow(match.grammarByCefr, cefrSafe);
    return {
      matchedTopic: match.keywords[0],
      communicationGoal: match.communicationGoal,
      cefrUsed: picked?.level ?? cefrSafe,
      grammar: picked?.items ?? FALLBACK_GRAMMAR_BY_CEFR[cefrSafe],
      examples: match.examples,
    };
  }
  return {
    matchedTopic: null,
    communicationGoal: `Enable the learner to communicate meaningfully about "${topic}" at ${cefrSafe}.`,
    cefrUsed: cefrSafe,
    grammar: FALLBACK_GRAMMAR_BY_CEFR[cefrSafe],
    examples: [],
  };
}

/**
 * Binding directive prepended to every brain prompt.
 * Forces Topic -> Goal -> Vocab -> Grammar -> Activities pipeline
 * and forbids the "It is a..." everywhere antipattern.
 */
export function buildGrammarDirective(topic: string, cefr: string, overrideGoal?: string, overrideGrammar?: string[]): string {
  const r = resolveGrammarFromMatrix(topic, cefr);
  const goal = overrideGoal?.trim() || r.communicationGoal;
  const grammar = overrideGrammar?.length ? overrideGrammar : r.grammar;
  return [
    `=== CURRICULUM BRAIN — GRAMMAR SELECTION (BINDING) ===`,
    `Pipeline: Topic -> Communication Goal -> Vocabulary -> Grammar -> Activities -> Assessment.`,
    `Grammar MUST be chosen because it enables the communication goal for THIS topic at THIS CEFR.`,
    `Grammar MUST NOT be repeated across unrelated units (no "It is a..." everywhere).`,
    ``,
    `Topic: ${topic}`,
    `CEFR target: ${cefr} (matrix level used: ${r.cefrUsed})`,
    `Communication goal: ${goal}`,
    `Required grammar structures (teach & recycle): ${grammar.join(" | ")}`,
    r.examples.length ? `Reference model sentences: ${r.examples.join(" / ")}` : "",
    ``,
    `Hard rules:`,
    `1. Every lesson activity must let the learner USE the grammar above to talk about the topic.`,
    `2. Do NOT introduce grammar from other units unless it appears in "Required grammar structures".`,
    `3. Vocabulary must be chosen to feed these grammar structures (e.g. plural nouns if grammar is "There are...").`,
    `4. Assessment items must check the SAME grammar in the SAME topic context.`,
    `=== END GRAMMAR SELECTION ===`,
  ].filter(Boolean).join("\n");
}
