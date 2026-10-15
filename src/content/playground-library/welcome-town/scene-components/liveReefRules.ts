/* Pure rules for Live Reef (LiveReefScene) — kept out of the component so the voice bake script
 * (scripts/generate-voice-cache.mjs) bakes exactly the lines the game says. */

/** "What's the crab doing?" */
export const reefAsk = (name: string) => `What's the ${name} doing?`;
/** "The crab is walking." (a plural name: "The fish are swimming.") */
export const reefSentence = (name: string, doing: string, plural = false) => `The ${name} ${plural ? 'are' : 'is'} ${doing}.`;

export const REEF_START = 'Look! Who is in the reef? Say what it is doing!';
export const REEF_WRONG = 'Look again! What is it doing?';
