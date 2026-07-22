
import { WheelConfig, WheelSegment } from "./types";

export function generateWheelContent(config: WheelConfig): WheelSegment[] {
  const contentSets = {
    vocabulary: [
      "Define: Magnificent", "Use 'Determine' in a sentence", "Synonym for 'Happy'",
      "Antonym for 'Large'", "Spell: Necessary", "What is an adjective?",
      "Name 3 colors", "Plural of 'Child'"
    ],
    grammar: [
      "Past tense of 'Run'", "What is a verb?", "Give an example of a noun",
      "Use 'However' correctly", "What's a compound sentence?", "Active vs Passive voice",
      "Name 3 prepositions", "What is an adverb?"
    ],
    conversation: [
      "Describe your weekend", "Talk about your favorite food", "What's your dream job?",
      "Tell a funny story", "Describe your best friend", "What makes you happy?"
    ],
    story: [
      "A magical forest", "Space adventure", "Time travel", "Talking animals",
      "Underwater city", "Flying carpet", "Secret door", "Invisible cloak",
      "Robot friend", "Magic potion"
    ]
  };

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const content = contentSets[config.id as keyof typeof contentSets] || contentSets.vocabulary;
  
  return content.slice(0, config.segments).map((item, index) => ({
    id: `segment-${index}`,
    content: item,
    color: colors[index % colors.length],
    type: config.id as WheelSegment['type']
  }));
}

export const defaultWheelConfigs: WheelConfig[] = [
  { id: 'vocabulary', name: 'Vocabulary', segments: 8, description: 'Word definitions and usage' },
  { id: 'grammar', name: 'Grammar', segments: 8, description: 'Grammar rules and examples' },
  { id: 'conversation', name: 'Conversation', segments: 6, description: 'Speaking prompts' },
  { id: 'story', name: 'Story Time', segments: 10, description: 'Creative story prompts' }
];
