
// Dictionary API service for definitions
export interface DefinitionResult {
  word: string;
  phonetic?: string;
  definition: string;
  partOfSpeech?: string;
  example?: string;
  synonyms?: string[];
  audioUrl?: string;
}

export async function fetchDefinition(word: string, signal?: AbortSignal): Promise<DefinitionResult | null> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`,
      { signal }
    );
    
    if (!response.ok) {
      throw new Error('Word not found');
    }
    
    const data = await response.json();
    const entry = data[0];
    const meaning = entry.meanings?.[0];
    const definitionObj = meaning?.definitions?.[0];
    
    return {
      word: entry.word,
      phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
      definition: definitionObj?.definition || 'No definition available',
      partOfSpeech: meaning?.partOfSpeech,
      example: definitionObj?.example,
      synonyms: definitionObj?.synonyms || meaning?.synonyms,
      audioUrl: entry.phonetics?.find((p: any) => p.audio)?.audio
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    return null;
  }
}

// Comprehensive fallback definitions for common ESL words
export const fallbackDefinitions: Record<string, DefinitionResult> = {
  // Basic greetings and common words
  hello: {
    word: "hello",
    phonetic: "həˈloʊ",
    definition: "used as a greeting or to begin a phone conversation",
    partOfSpeech: "exclamation",
    example: "Hello, how are you today?",
    synonyms: ["hi", "greetings", "hey"]
  },
  hi: {
    word: "hi",
    phonetic: "haɪ",
    definition: "used as a friendly greeting",
    partOfSpeech: "exclamation",
    example: "Hi there! Nice to see you.",
    synonyms: ["hello", "hey"]
  },
  goodbye: {
    word: "goodbye",
    phonetic: "ɡʊdˈbaɪ",
    definition: "used to express good wishes when parting",
    partOfSpeech: "exclamation",
    example: "Goodbye, see you tomorrow!",
    synonyms: ["bye", "farewell"]
  },
  
  // Animals
  cat: {
    word: "cat",
    phonetic: "kæt",
    definition: "a small domesticated carnivorous mammal with soft fur",
    partOfSpeech: "noun",
    example: "The cat is sleeping on the sofa.",
    synonyms: ["feline", "kitten"]
  },
  dog: {
    word: "dog",
    phonetic: "dɔːɡ",
    definition: "a domesticated carnivorous mammal that is kept as a pet",
    partOfSpeech: "noun",
    example: "The dog loves to play in the park.",
    synonyms: ["puppy", "canine"]
  },
  horse: {
    word: "horse",
    phonetic: "hɔːrs",
    definition: "a large hoofed mammal used for riding and carrying loads",
    partOfSpeech: "noun",
    example: "The horse galloped across the field.",
    synonyms: ["stallion", "mare"]
  },
  bird: {
    word: "bird",
    phonetic: "bɜːrd",
    definition: "a warm-blooded egg-laying vertebrate with feathers and wings",
    partOfSpeech: "noun",
    example: "The bird is singing in the tree.",
    synonyms: ["fowl", "avian"]
  },
  fish: {
    word: "fish",
    phonetic: "fɪʃ",
    definition: "a limbless cold-blooded vertebrate animal that lives in water",
    partOfSpeech: "noun",
    example: "We saw colorful fish in the aquarium.",
    synonyms: ["seafood"]
  },
  
  // Common objects
  book: {
    word: "book",
    phonetic: "bʊk",
    definition: "a written or printed work consisting of pages bound together",
    partOfSpeech: "noun",
    example: "I'm reading a fascinating book about history.",
    synonyms: ["volume", "publication", "text"]
  },
  house: {
    word: "house",
    phonetic: "haʊs",
    definition: "a building for human habitation",
    partOfSpeech: "noun",
    example: "They live in a beautiful house near the lake.",
    synonyms: ["home", "residence"]
  },
  car: {
    word: "car",
    phonetic: "kɑːr",
    definition: "a motor vehicle with four wheels for carrying passengers",
    partOfSpeech: "noun",
    example: "She drives her car to work every day.",
    synonyms: ["automobile", "vehicle"]
  },
  phone: {
    word: "phone",
    phonetic: "foʊn",
    definition: "a device used to communicate with people at a distance",
    partOfSpeech: "noun",
    example: "Please answer the phone when it rings.",
    synonyms: ["telephone", "mobile"]
  },
  computer: {
    word: "computer",
    phonetic: "kəmˈpjuːtər",
    definition: "an electronic device for storing and processing data",
    partOfSpeech: "noun",
    example: "I use my computer for work and entertainment.",
    synonyms: ["laptop", "PC"]
  },
  
  // Nature
  tree: {
    word: "tree",
    phonetic: "triː",
    definition: "a woody perennial plant with a trunk and branches",
    partOfSpeech: "noun",
    example: "The old oak tree provides shade in summer.",
    synonyms: ["plant", "timber"]
  },
  water: {
    word: "water",
    phonetic: "ˈwɔːtər",
    definition: "a colorless, transparent, odorless liquid essential for life",
    partOfSpeech: "noun",
    example: "Please drink plenty of water to stay healthy.",
    synonyms: ["liquid", "H2O"]
  },
  sun: {
    word: "sun",
    phonetic: "sʌn",
    definition: "the star around which the earth orbits",
    partOfSpeech: "noun",
    example: "The sun is shining brightly today.",
    synonyms: ["solar", "daylight"]
  },
  
  // Education
  learn: {
    word: "learn",
    phonetic: "lɜːrn",
    definition: "acquire knowledge or skill through study or experience",
    partOfSpeech: "verb",
    example: "Children learn through play and exploration.",
    synonyms: ["study", "master", "understand"]
  },
  teacher: {
    word: "teacher",
    phonetic: "ˈtiːtʃər",
    definition: "a person who teaches, especially in a school",
    partOfSpeech: "noun",
    example: "My teacher helped me understand the lesson.",
    synonyms: ["instructor", "educator"]
  },
  student: {
    word: "student",
    phonetic: "ˈstuːdənt",
    definition: "a person who is studying at a school or university",
    partOfSpeech: "noun",
    example: "The student asked an excellent question.",
    synonyms: ["pupil", "learner"]
  },
  school: {
    word: "school",
    phonetic: "skuːl",
    definition: "an institution for educating children",
    partOfSpeech: "noun",
    example: "The children walk to school every morning.",
    synonyms: ["academy", "institution"]
  },
  
  // Food
  food: {
    word: "food",
    phonetic: "fuːd",
    definition: "any nutritious substance that people eat or drink",
    partOfSpeech: "noun",
    example: "Healthy food gives us energy and nutrients.",
    synonyms: ["meal", "nutrition"]
  },
  apple: {
    word: "apple",
    phonetic: "ˈæpəl",
    definition: "a round fruit with red or green skin and white flesh",
    partOfSpeech: "noun",
    example: "An apple a day keeps the doctor away.",
    synonyms: ["fruit"]
  },
  bread: {
    word: "bread",
    phonetic: "bred",
    definition: "food made of flour, water, and yeast baked into loaves",
    partOfSpeech: "noun",
    example: "We had fresh bread for breakfast.",
    synonyms: ["loaf", "toast"]
  },
  
  // Basic verbs
  go: {
    word: "go",
    phonetic: "ɡoʊ",
    definition: "move from one place to another; travel",
    partOfSpeech: "verb",
    example: "Let's go to the park this afternoon.",
    synonyms: ["travel", "move", "proceed"]
  },
  come: {
    word: "come",
    phonetic: "kʌm",
    definition: "move toward or arrive at a particular place",
    partOfSpeech: "verb",
    example: "Please come here and help me.",
    synonyms: ["arrive", "approach"]
  },
  see: {
    word: "see",
    phonetic: "siː",
    definition: "perceive with the eyes; discern visually",
    partOfSpeech: "verb",
    example: "I can see the mountains from my window.",
    synonyms: ["look", "observe", "view"]
  },
  
  // Colors
  red: {
    word: "red",
    phonetic: "red",
    definition: "of a color like that of blood, fire, or rubies",
    partOfSpeech: "adjective",
    example: "She wore a beautiful red dress.",
    synonyms: ["crimson", "scarlet"]
  },
  blue: {
    word: "blue",
    phonetic: "bluː",
    definition: "of a color like that of the sky or sea on a sunny day",
    partOfSpeech: "adjective",
    example: "The blue ocean sparkled in the sunlight.",
    synonyms: ["azure", "navy"]
  },
  green: {
    word: "green",
    phonetic: "ɡriːn",
    definition: "of a color like that of grass or emeralds",
    partOfSpeech: "adjective",
    example: "The green leaves rustle in the wind.",
    synonyms: ["emerald", "lime"]
  }
};

export function getFallbackDefinition(word: string): DefinitionResult | null {
  const fallback = fallbackDefinitions[word.toLowerCase()];
  if (fallback) {
    return fallback;
  }
  
  // Create a helpful default definition for unknown words
  return {
    word: word,
    definition: `This is a word that students are learning. While we don't have the exact definition available offline, you can use this word in your English practice.`,
    partOfSpeech: "word",
    example: `Try using "${word}" in a sentence to practice your English.`
  };
}
