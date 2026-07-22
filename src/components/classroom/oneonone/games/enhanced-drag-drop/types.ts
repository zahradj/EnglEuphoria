
export interface MatchItem {
  id: string;
  content: string;
  matchId: string;
  type: 'word' | 'definition' | 'image';
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  difficulty: number;
}

export interface DragDropGameState {
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  matches: Record<string, string>;
  score: number;
  isLoading: boolean;
}
