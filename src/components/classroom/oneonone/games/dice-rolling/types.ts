
export interface DiceConfig {
  id: string;
  name: string;
  description: string;
  diceCount: number;
  type: 'vocabulary' | 'grammar' | 'story' | 'conversation';
}

export interface DiceResult {
  value: number;
  content: string;
  color: string;
}

export interface DiceGameState {
  diceConfig: DiceConfig;
  diceResults: DiceResult[];
  isRolling: boolean;
  aiChallenge: string;
  score: number;
  rollCount: number;
}
