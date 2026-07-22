/**
 * Canvas Engine Schema — shared by Playground / Academy / Success.
 *
 * The canvas is a 16:9 box where every element is positioned in PERCENT (0–100).
 * This means the same JSON renders identically on a phone, tablet, or 4K monitor.
 *
 * Two slide types use this:
 *  - canvas_game     → drag-and-drop / sorting / matching games
 *  - living_canvas   → layered click-to-reveal storytelling (and optional drag mix)
 *
 * A third slide type, scaffolded_media, uses ScaffoldedPlayer instead.
 */

export type CanvasInteraction = 'none' | 'draggable' | 'reveal' | 'target';
export type CanvasAnimIn = 'fade' | 'pop' | 'slide-up' | 'none';
export type CanvasRevealAnim = 'fade' | 'lift' | 'shrink' | 'fly';

export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'shape';
  /** Image URL when type='image' */
  src?: string;
  /** Text content when type='text' */
  text?: string;
  /** Background color for shape/text bubble (hex) */
  color?: string;

  /** Position & size — all in percent of canvas (0–100). */
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
  z_index?: number;

  animation_in?: CanvasAnimIn;
  interaction?: CanvasInteraction;

  /** ── Drag-and-drop ───────────────────── */
  target_x?: number;
  target_y?: number;
  /** Snap radius in percent (default 10) */
  snap_tolerance?: number;
  /** TTS text or audio URL played on correct snap */
  success_sfx?: string;
  fail_sfx?: string;

  /** ── Click-to-reveal ─────────────────── */
  reveal_sfx?: string;
  reveal_anim?: CanvasRevealAnim;
}

export interface CanvasGameSlide {
  type: 'canvas_game';
  title?: string;
  instruction?: string;
  instruction_audio?: string; // TTS text
  background_image?: string;
  elements: CanvasElement[];
  voice?: { text: string; autoPlay?: boolean };
}

export interface LivingCanvasSlide {
  type: 'living_canvas';
  title?: string;
  instruction?: string;
  instruction_audio?: string;
  background_image?: string;
  elements: CanvasElement[];
  voice?: { text: string; autoPlay?: boolean };
}

export interface ScaffoldedMediaSegment {
  start_time: number;
  end_time: number;
  question: {
    prompt: string;
    options: string[];
    answer: string;
    replay_hint?: string;
  };
}

export interface ScaffoldedMediaSlide {
  type: 'scaffolded_media';
  title?: string;
  media_url: string;
  media_kind: 'youtube' | 'audio' | 'video';
  transcript?: string;
  segments: ScaffoldedMediaSegment[];
  voice?: { text: string; autoPlay?: boolean };
}

export type AnyCanvasSlide = CanvasGameSlide | LivingCanvasSlide | ScaffoldedMediaSlide;

export type Hub = 'playground' | 'academy' | 'success';

export const HUB_SNAP_TOLERANCE: Record<Hub, number> = {
  playground: 12,
  academy: 10,
  success: 8,
};

export const HUB_FRAME: Record<Hub, string> = {
  playground: 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50',
  academy: 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50',
  success: 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50',
};

/** Validate & normalize an element coming from AI / JSON imports. */
export function normalizeElement(raw: any, idx: number): CanvasElement | null {
  if (!raw || typeof raw !== 'object') return null;
  const x = clamp(Number(raw.x ?? raw.x_percent ?? 50), 0, 100);
  const y = clamp(Number(raw.y ?? raw.y_percent ?? 50), 0, 100);
  const width = clamp(Number(raw.width ?? raw.width_percent ?? 15), 2, 100);
  const el: CanvasElement = {
    id: String(raw.id ?? `el_${idx}_${Math.random().toString(36).slice(2, 7)}`),
    type: (raw.type === 'text' || raw.type === 'shape') ? raw.type : 'image',
    src: raw.src ?? raw.image_url,
    text: raw.text,
    color: raw.color,
    x, y, width,
    height: raw.height != null ? clamp(Number(raw.height), 2, 100) : undefined,
    rotation: raw.rotation ?? 0,
    z_index: raw.z_index ?? raw.zIndex ?? 1,
    animation_in: raw.animation_in ?? 'fade',
    interaction: (['draggable', 'reveal', 'target', 'none'].includes(raw.interaction))
      ? raw.interaction
      : 'none',
    target_x: raw.target_x != null ? clamp(Number(raw.target_x), 0, 100) : undefined,
    target_y: raw.target_y != null ? clamp(Number(raw.target_y), 0, 100) : undefined,
    snap_tolerance: raw.snap_tolerance ?? 10,
    success_sfx: raw.success_sfx,
    fail_sfx: raw.fail_sfx,
    reveal_sfx: raw.reveal_sfx,
    reveal_anim: raw.reveal_anim ?? 'fade',
  };
  return el;
}

function clamp(n: number, lo: number, hi: number) {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}
