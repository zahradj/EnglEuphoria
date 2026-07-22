// CEFR Roadmap types — pure pedagogy. No themes, mascots, or visuals here.

export type CefrLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface CefrBucket {
  index: number;                  // 0-based, maps 1:1 to a unit/world
  unitNumber: number;             // 1-based, for display
  unitTitle: string;              // pedagogical title, world skin will replace later for display
  topics: string[];               // canonical topic slugs (used for theme fit)
  grammarFocus: string[];
  vocabularyFocus: string[];
  communicativeGoal: string;
  successCriteria: string[];
  reviewTargets: string[];        // recycled from earlier buckets
}

export interface CefrRoadmap {
  level: CefrLevel;
  hub: 'playground' | 'academy' | 'success';
  buckets: CefrBucket[];
  vocabularyArc: string[];        // ordered union of all vocab
  grammarArc: string[];           // ordered union of all grammar
}
