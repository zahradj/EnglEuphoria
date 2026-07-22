/**
 * Blueprint External Shim
 * -----------------------
 * Single boundary between the (portable) playground-blueprint module and the
 * rest of the host app. If you swap this folder in from another Lovable
 * project, this is the ONLY file whose import paths may need adjusting.
 *
 * Rule: nothing inside src/playground-blueprint/** may import from outside
 * the blueprint except via this file.
 */

export { playElevenLabs } from "@/lib/elevenLabsAudio";
export type {
  HomeworkPack,
  HomeworkTask,
  HomeworkTaskType,
} from "@/coherence/types";
