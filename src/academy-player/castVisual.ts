// Academy cast — visual identity used for PLACEHOLDER art until the real Canva pictures exist.
// Colours come from the cast vault `visual_blueprint` palettes (snapshot 2026-10-08). The real art must follow the vault's
// visual_blueprint (semi-realistic illustrated teens, crisp black ink outlines, soft cel-shading, no photo border).
import type { CastName, Expression } from './scriptTypes';

export interface CastLook {
  name: CastName;
  skin: string;
  hair: string;
  top: string;
  accent: string;
  /** short caption for the placeholder */
  note: string;
  hairStyle: 'wavy' | 'curly' | 'ponytail' | 'short';
  glasses?: boolean;
}

export const CAST_LOOK: Record<CastName, CastLook> = {
  Vee: { name: 'Vee', skin: '#e0b48f', hair: '#1e3a8a', top: '#3b82f6', accent: '#93c5fd', note: 'mentor', hairStyle: 'short' },
  Ava: { name: 'Ava', skin: '#e8c4a0', hair: '#8b5e3c', top: '#e5e5e5', accent: '#4f46e5', note: 'student', hairStyle: 'wavy' },
  Theo: { name: 'Theo', skin: '#a9714b', hair: '#2b1d12', top: '#bcd4e6', accent: '#f5f5f0', note: 'student', hairStyle: 'curly' },
  Mia: { name: 'Mia', skin: '#c99a6b', hair: '#4b2e1e', top: '#ea580c', accent: '#0d9488', note: 'student', hairStyle: 'ponytail', glasses: true },
};

export const EXPRESSIONS: readonly Expression[] = ['neutral', 'happy', 'curious', 'surprised', 'thinking', 'concerned'] as const;

/** Background placeholders: a calm gradient per scene id until the real full-bleed picture exists. */
export const BG_LOOK: Record<string, { from: string; to: string; label: string }> = {
  'classroom-morning': { from: '#cfe4ff', to: '#f7ecd0', label: 'Classroom, morning' },
  'classroom-evening': { from: '#f7c9a0', to: '#7b6ba8', label: 'Classroom, evening' },
  'phone-profile-closeup': { from: '#1f2a44', to: '#3d4f7c', label: 'Phone, profile' },
};
export const bgLook = (id: string) => BG_LOOK[id] ?? { from: '#27304a', to: '#46557f', label: id };

/** Placeholder picture for a vocabulary card until the real card art exists: a big friendly icon on a coloured tile. */
const CARD_ICONS: Record<string, { icon: string; hue: number }> = {
  'card-student': { icon: '🎒', hue: 265 }, 'card-teacher': { icon: '🧑‍🏫', hue: 230 }, 'card-friend': { icon: '🤝', hue: 290 }, 'card-class': { icon: '🏫', hue: 215 },
  'card-hello': { icon: '👋', hue: 280 }, 'card-welcome': { icon: '🚪', hue: 250 }, 'card-meet': { icon: '🙌', hue: 300 }, 'card-nice': { icon: '😊', hue: 320 },
  'card-name': { icon: '🏷️', hue: 240 }, 'card-online': { icon: '🟢', hue: 200 }, 'card-group': { icon: '👥', hue: 260 },
  'card-new': { icon: '✨', hue: 285 }, 'card-member': { icon: '🎟️', hue: 225 }, 'card-introduce': { icon: '🎤', hue: 310 },
};
export const cardIcon = (id: string) => CARD_ICONS[id] ?? { icon: '⭐', hue: 260 };

/** Accent colours for chat senders and name plates (UI only; independent of the art palette). */
export const SPEAKER_COLOR: Record<string, string> = { Vee: '#60a5fa', Ava: '#a78bfa', Theo: '#34d399', Mia: '#fb923c', Unknown: '#f59e0b', You: '#8fa8ff', narrator: '#94a3b8' };
export const speakerColor = (who: string) => SPEAKER_COLOR[who] ?? '#a78bfa';
