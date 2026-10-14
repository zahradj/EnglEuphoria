/* Pure rules for the Monster Mood Machine (MoodMachineScene) — kept out of the component so the voice bake script
 * (scripts/generate-voice-cache.mjs) bakes exactly the lines the game says. */

/** "Bibi is scared because it's dark." */
export const moodSentence = (name: string, feeling: string, reason: string) => `${name} is ${feeling} because ${reason}.`;
/** What the machine says when a reason picture pops out: "Because it's dark!" */
export const moodReason = (reason: string) => `Because ${reason}!`;
/** The question after the reason: "How is Bibi?" */
export const moodAsk = (name: string) => `How is ${name}?`;

export const MOOD_PULL = 'Pull the lever!';
export const MOOD_WRONG = 'Hmm, look at the picture again!';
