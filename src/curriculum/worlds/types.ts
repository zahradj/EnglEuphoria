// World registry — types
// A "World" is a thematic skin wrapped around a CEFR-driven unit.
// Worlds NEVER define learning content. They define mood, mascots, visuals,
// gameplay identity. The CEFR roadmap stays the source of truth.

export type EmotionalTone =
  | 'safe-welcoming'
  | 'adventurous-energetic'
  | 'curious-futuristic'
  | 'social-playful'
  | 'funny-magical'
  | 'calm-exploratory'
  | 'empowering-exciting'
  | 'epic-adventurous'
  | 'mysterious-magical'
  | 'innovative-intelligent';

export type GameplayIdentity =
  | 'greeting-quests'
  | 'animal-rescue'
  | 'rocket-navigation'
  | 'restaurant-roleplay'
  | 'monster-customization'
  | 'treasure-hunt'
  | 'rescue-mission'
  | 'fossil-collection'
  | 'hidden-object-quest'
  | 'invention-challenge';

export interface VisualStyle {
  setting: string;
  props: string[];
}

export interface World {
  id?: string;            // db uuid, optional in-memory
  slug: string;
  name: string;
  hub: 'playground' | 'academy' | 'success';
  cefrBand: string;       // 'A1' | 'A2' | ...
  visualStyle: VisualStyle;
  emotionalTone: EmotionalTone;
  gameplayIdentity: GameplayIdentity;
  palette: string[];      // hex
  mascots: string[];
  musicMood: string;
  suggestedActivityTypes: string[];
  topicAffinity: string[];
  displayOrder: number;
}
