// Re-export the Playground speech helper so `@/lib/lesson/speech` resolves
// for components living outside the playground-blueprint module.
export { speak, PLAYGROUND_VOICES } from "@/playground-blueprint/lib/speech";
export type { PlaygroundVoice } from "@/playground-blueprint/lib/speech";
