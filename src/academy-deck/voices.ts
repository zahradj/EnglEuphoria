// Academy cast -> recorded voice. INTERIM: approved American voices (src/lib/speechPolicy.ts VOICE_PROFILES) until the owner designs the
// teen voices with scripts/academy-voice-design.mjs; then ONLY this map changes (and the clips are re-baked). Academy-only (hub separation).
// Liam, Elli, Will and Matilda are all labelled "american" in the policy; never put an accented voice here.
import type { CastName } from './types';

export const ACADEMY_VOICES: Record<CastName, string> = {
  Vee: 'TX3LPaxmHKxFdv7VOQHJ', // Liam
  Ava: 'MF3mGyEYCl7XYWbV9V6O', // Elli
  Theo: 'bIHbv24MWmeRgasZH58o', // Will
  Mia: 'XrExE9yKIg1WjnnlVkGX', // Matilda
};
