/**
 * Maps AI-generated lesson screens to SlideRenderer format
 * Enhanced with validation, fallbacks, and debug logging
 */

const DEBUG = false; // Set to true for development debugging

export function mapScreenToSlide(screen: any, screenIndex: number) {
  // Validate required fields
  if (!screen.screenType) {
    console.warn(`Screen ${screenIndex + 1} missing screenType`, screen);
  }
  if (!screen.title) {
    console.warn(`Screen ${screenIndex + 1} missing title`, screen);
  }
  if (!screen.content) {
    console.warn(`Screen ${screenIndex + 1} missing content`, screen);
  }

  const baseSlide = {
    title: screen.title || `Screen ${screenIndex + 1}`,
    content: screen.content || {},
    durationSeconds: screen.durationSeconds || 60,
    xpReward: screen.xpReward || 20,
    ...screen
  };

  // Map screen types to SlideRenderer expected types
  const typeMapping: Record<string, string> = {
    'home': 'warmup',
    'vocabulary': 'vocabulary',
    'vocabulary_preview': 'vocabulary_preview',
    'phonics': 'phonics',
    'grammar': 'grammar_focus',
    'grammar_focus': 'grammar_focus',
    'dialogue': 'dialogue_practice',
    'dialogue_practice': 'dialogue_practice',
    'listening': 'listening_comprehension',
    'listening_comprehension': 'listening_comprehension',
    'reading': 'reading',
    'speaking': 'speaking_practice',
    'speaking_practice': 'speaking_practice',
    'sentence_builder': 'sentence_builder',
    'matching': 'match',
    'drag_drop': 'drag_drop',
    'spinning_wheel': 'spinning_wheel',
    'sorting': 'sorting',
    'quiz': 'end_quiz',
    'end_quiz': 'end_quiz',
    'badge_reward': 'rewards',
    'rewards': 'rewards',
    'celebration': 'celebration',
    'controlled_practice': 'controlled_practice',
    'point_and_say': 'point_and_say'
  };

  const screenType = screen.screenType?.toLowerCase() || screen.type?.toLowerCase() || '';
  const mappedType = typeMapping[screenType] || screenType || 'default';

  if (!typeMapping[screenType] && screenType && screenType !== 'default') {
    console.warn(`Unknown screen type: ${screenType} (screen ${screenIndex + 1})`);
  }

  if (DEBUG) {
    console.log(`Mapping screen ${screenIndex + 1}:`, {
      originalType: screenType,
      mappedType,
      hasContent: !!screen.content,
      contentKeys: screen.content ? Object.keys(screen.content) : []
    });
  }

  const mappedSlide = {
    ...baseSlide,
    type: mappedType,
    slideNumber: screenIndex + 1
  };

  // Handle warmup/home screens with object content
  if (mappedType === 'warmup' && typeof mappedSlide.content === 'object') {
    const content = mappedSlide.content as any;
    // Ensure we have a displayable prompt
    if (!mappedSlide.prompt) {
      mappedSlide.prompt = content.welcomeMessage || content.previewText || mappedSlide.title;
    }
  }

  // Add fallback content for specific types
  if (mappedType === 'vocabulary' && mappedSlide.content.words) {
    mappedSlide.content.words = mappedSlide.content.words.map((word: any) => ({
      word: word.word || 'Unknown',
      ipa: word.ipa || '',
      definition: word.definition || 'No definition available',
      examples: word.examples || [],
      imagePrompt: word.imagePrompt || 'Generic illustration',
      audioPlaceholder: word.audioPlaceholder || `audio/vocab/${word.word}.mp3`,
      ...word
    }));
  }

  return mappedSlide;
}

export function mapLessonScreens(screens: any[]) {
  return screens.map((screen, index) => mapScreenToSlide(screen, index));
}
