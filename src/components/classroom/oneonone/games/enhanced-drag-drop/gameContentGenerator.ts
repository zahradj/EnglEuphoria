
import { GameMode, MatchItem } from "./types";

export const generateGameContent = async (mode: GameMode): Promise<{
  leftItems: MatchItem[];
  rightItems: MatchItem[];
}> => {
  // Simulated AI content generation - in real app, this would call an AI service
  const contentSets = {
    'word-definition': [
      { word: 'Happy', definition: 'Feeling joy or pleasure' },
      { word: 'Bright', definition: 'Giving out light; shining' },
      { word: 'Quick', definition: 'Moving fast or doing something rapidly' },
      { word: 'Calm', definition: 'Not showing excitement or worry' },
      { word: 'Strong', definition: 'Having great power or force' }
    ],
    'category-sort': [
      { word: 'Apple', definition: 'Fruit' },
      { word: 'Car', definition: 'Transportation' },
      { word: 'Dog', definition: 'Animal' },
      { word: 'Blue', definition: 'Color' },
      { word: 'Book', definition: 'Object' }
    ],
    'image-word': [
      { word: '🐶', definition: 'Dog' },
      { word: '🌞', definition: 'Sun' },
      { word: '🏠', definition: 'House' },
      { word: '📚', definition: 'Book' },
      { word: '🚗', definition: 'Car' }
    ],
    'grammar-function': [
      { word: 'runs quickly', definition: 'Adverb' },
      { word: 'beautiful flower', definition: 'Adjective' },
      { word: 'the cat sleeps', definition: 'Verb' },
      { word: 'big house', definition: 'Noun' },
      { word: 'under the table', definition: 'Preposition' }
    ]
  };

  const content = contentSets[mode.id as keyof typeof contentSets] || contentSets['word-definition'];
  
  const leftItems = content.map((item, index) => ({
    id: `left-${index}`,
    content: item.word,
    matchId: `match-${index}`,
    type: 'word' as const
  }));

  const rightItems = content.map((item, index) => ({
    id: `right-${index}`,
    content: item.definition,
    matchId: `match-${index}`,
    type: 'definition' as const
  }));

  // Shuffle the right items
  const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);

  return { leftItems, rightItems: shuffledRight };
};
