
export interface WheelSegment {
  id: string;
  content: string;
  color: string;
  type: 'question' | 'challenge' | 'vocabulary' | 'topic';
}

export interface WheelConfig {
  id: string;
  name: string;
  segments: number;
  description: string;
}

export interface SpinningWheelState {
  isSpinning: boolean;
  rotation: number;
  selectedSegment: WheelSegment | null;
  wheelConfig: WheelConfig;
  segments: WheelSegment[];
  score: number;
}
