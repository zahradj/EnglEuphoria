// IronLMS Game Engine Types

// Target Groups - determines visual style and language
export type TargetGroup = 'playground' | 'academy' | 'hub';

// Game Modes
export type GameMode = 'mechanic' | 'context' | 'application';

// MODE 1: THE MECHANIC (Multiple Choice Drill)
export interface MechanicQuestion {
  id: number;
  query: string;
  options: string[];
  correctIndex: number;
  feedback: string;
}

export interface MechanicGame {
  type: 'mechanic';
  title: string;
  questions: MechanicQuestion[];
}

// MODE 2: THE CONTEXT (Interactive Reading)
export interface ClickableWord {
  word: string;
  definition: string;
}

export interface ContextGame {
  type: 'context';
  title: string;
  storyText: string;
  clickableWords: ClickableWord[];
}

// MODE 3: THE APPLICATION (Scenario/Roleplay)
export interface ScenarioChoice {
  text: string;
  score: number;
  response: string;
  isCorrect: boolean;
}

export interface ApplicationGame {
  type: 'application';
  title: string;
  scenario: string;
  choices: ScenarioChoice[];
}

// Union type for all games
export type IronLMSGame = MechanicGame | ContextGame | ApplicationGame;

// Generation request
export interface GameGenerationRequest {
  targetGroup: TargetGroup;
  topic: string;
  gameMode: GameMode;
  cefrLevel?: string;
  questionCount?: number; // For mechanic mode
}

// Game completion result
export interface GameResult {
  score: number;
  maxScore: number;
  timeSpent?: number;
  correctAnswers?: number;
  totalQuestions?: number;
}

// Map system names to target groups
export function mapSystemToTargetGroup(system: string): TargetGroup {
  const systemLower = system.toLowerCase();
  if (systemLower.includes('kid') || systemLower.includes('playground') || systemLower.includes('early')) {
    return 'playground';
  }
  if (systemLower.includes('teen') || systemLower.includes('academy')) {
    return 'academy';
  }
  return 'hub';
}
