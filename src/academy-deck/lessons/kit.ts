// Small helpers shared by the B1 Season 1 lessons (cast positions, teach pictures). Academy-only; no other hub imports this.
import type { CastName, TeachArt } from '../types';

export type Pose = 'happy' | 'wave' | 'thumbs' | 'neutral';

/** A cast member on the scene plate: left, right or centre, with an expression. */
export const who = (w: CastName, pos: 'left' | 'right' | 'center', expr: Pose = 'happy') => ({ who: w, pos, expr });
/** A teach picture from the card ids (`public/academy-art/cards`); until the sticker exists the frame label shows. */
export const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
/** Letter tiles: a word or sentence shown as plain tiles (verbs, sentences). */
export const L = (text: string): TeachArt => ({ type: 'letters', text });
