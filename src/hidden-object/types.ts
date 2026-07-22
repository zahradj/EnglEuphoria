import type { ReinforcementTarget } from "@/coherence/types";

export type HubId = "playground" | "academy" | "success";
export type CefrLevel = "PreA1" | "A1" | "A2" | "B1" | "B2" | "C1";

export interface HiddenTarget {
  /** Word or short phrase the learner must find. */
  label: string;
  /** Prompt line shown in the checklist ("Find the …"). */
  prompt: string;
  /** Normalised x/y (0-1) coordinates of the target's centre in the scene. */
  x: number;
  y: number;
  /** Click radius as a fraction of the scene width (0-1). */
  radius: number;
  /** Language target this find reinforces. */
  reinforces: ReinforcementTarget;
  /** Optional short definition surfaced on success (Academy/Success). */
  definition?: string;
  /** Optional preposition hint for spatial-language work (A1+). */
  preposition?: string;
}

export interface HiddenObjectScene {
  id: string;
  hub: HubId;
  cefr: CefrLevel;
  /** Theme / setting used for the AI-generated scene image. */
  theme: string;
  /** Image prompt — real image_url is filled in later by the media pipeline. */
  image_prompt: string;
  /** Bound scene image (nullable at generation time). */
  image_url: string | null;
  /** Ordered checklist of hidden targets (2–8 items depending on hub). */
  targets: HiddenTarget[];
  /** Optional narrative framing shown before play. */
  intro?: string;
  /** Optional celebratory line shown after all items are found. */
  outro?: string;
}
