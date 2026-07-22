
// Translation service
export async function fetchTranslation(word: string, targetLanguage: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${targetLanguage}`,
      { signal }
    );
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    return null;
  }
}

// Comprehensive fallback translations for common ESL words
export const fallbackTranslations: Record<string, Record<string, string>> = {
  // Greetings
  hello: { ar: "مرحبا", es: "hola", fr: "bonjour", de: "hallo" },
  hi: { ar: "أهلا", es: "hola", fr: "salut", de: "hi" },
  goodbye: { ar: "مع السلامة", es: "adiós", fr: "au revoir", de: "auf wiedersehen" },
  
  // Animals
  cat: { ar: "قطة", es: "gato", fr: "chat", de: "katze" },
  dog: { ar: "كلب", es: "perro", fr: "chien", de: "hund" },
  horse: { ar: "حصان", es: "caballo", fr: "cheval", de: "pferd" },
  bird: { ar: "طائر", es: "pájaro", fr: "oiseau", de: "vogel" },
  fish: { ar: "سمك", es: "pez", fr: "poisson", de: "fisch" },
  
  // Objects
  book: { ar: "كتاب", es: "libro", fr: "livre", de: "buch" },
  house: { ar: "بيت", es: "casa", fr: "maison", de: "haus" },
  car: { ar: "سيارة", es: "coche", fr: "voiture", de: "auto" },
  phone: { ar: "هاتف", es: "teléfono", fr: "téléphone", de: "telefon" },
  computer: { ar: "حاسوب", es: "computadora", fr: "ordinateur", de: "computer" },
  
  // Nature
  tree: { ar: "شجرة", es: "árbol", fr: "arbre", de: "baum" },
  water: { ar: "ماء", es: "agua", fr: "eau", de: "wasser" },
  sun: { ar: "شمس", es: "sol", fr: "soleil", de: "sonne" },
  
  // Education
  learn: { ar: "يتعلم", es: "aprender", fr: "apprendre", de: "lernen" },
  teacher: { ar: "معلم", es: "profesor", fr: "professeur", de: "lehrer" },
  student: { ar: "طالب", es: "estudiante", fr: "étudiant", de: "schüler" },
  school: { ar: "مدرسة", es: "escuela", fr: "école", de: "schule" },
  
  // Food
  food: { ar: "طعام", es: "comida", fr: "nourriture", de: "essen" },
  apple: { ar: "تفاحة", es: "manzana", fr: "pomme", de: "apfel" },
  bread: { ar: "خبز", es: "pan", fr: "pain", de: "brot" },
  
  // Verbs
  go: { ar: "يذهب", es: "ir", fr: "aller", de: "gehen" },
  come: { ar: "يأتي", es: "venir", fr: "venir", de: "kommen" },
  see: { ar: "يرى", es: "ver", fr: "voir", de: "sehen" },
  
  // Colors
  red: { ar: "أحمر", es: "rojo", fr: "rouge", de: "rot" },
  blue: { ar: "أزرق", es: "azul", fr: "bleu", de: "blau" },
  green: { ar: "أخضر", es: "verde", fr: "vert", de: "grün" }
};

export function getFallbackTranslation(word: string, targetLanguage: string): string | null {
  const wordTranslations = fallbackTranslations[word.toLowerCase()];
  if (wordTranslations?.[targetLanguage]) {
    return wordTranslations[targetLanguage];
  }
  
  // Return a helpful message for unknown words
  const languageNames: Record<string, string> = {
    ar: "Arabic",
    es: "Spanish", 
    fr: "French",
    de: "German"
  };
  
  const langName = languageNames[targetLanguage] || targetLanguage;
  return `Translation to ${langName} not available offline`;
}
