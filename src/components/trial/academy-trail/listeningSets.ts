// Academy trial Listening Lab sentences. Plain data (no React) so the voice bake script can read the exact
// lines and save a clip for each; the quest plays those saved files and never generates speech live.
import type { Difficulty } from "./levels";

export type ListeningQ = { id: string; target: string; options: string[] };

export const SETS: Record<Difficulty, ListeningQ[]> = {
  "pre-a1": [
    { id: "l1", target: "I have a cat.", options: ["I have a cat.", "I have a hat.", "I had a cat."] },
    { id: "l2", target: "It is hot today.", options: ["It is cold today.", "It is hot today.", "It was hot today."] },
    { id: "l3", target: "She is my mom.", options: ["She is my mom.", "He is my mom.", "She is my friend."] },
    { id: "l4", target: "I like apples.", options: ["I like apples.", "I like onions.", "I liked apples."] },
  ],
  standard: [
    { id: "l1", target: "I have three brothers.", options: ["I have three brothers.", "I have three sisters.", "I had three brothers."] },
    { id: "l2", target: "She doesn't like coffee.", options: ["She likes coffee.", "She doesn't like coffee.", "She doesn't like tea."] },
    { id: "l3", target: "We're going to the cinema tonight.", options: ["We went to the cinema tonight.", "We're going to the kitchen tonight.", "We're going to the cinema tonight."] },
    { id: "l4", target: "If I were rich, I would travel the world.", options: ["If I am rich, I travel the world.", "If I were rich, I would travel the world.", "If I were rich, I will travel the world."] },
  ],
  challenge: [
    { id: "l1", target: "I should have called you earlier.", options: ["I should call you earlier.", "I should have called you earlier.", "I shouldn't have called you earlier."] },
    { id: "l2", target: "She's been working here for nearly a decade.", options: ["She works here for nearly a decade.", "She's been working here for nearly a decade.", "She's been working there for nearly a decade."] },
    { id: "l3", target: "Had I known, I would've left sooner.", options: ["Had I know, I would've left sooner.", "If I knew, I will leave sooner.", "Had I known, I would've left sooner."] },
    { id: "l4", target: "The proposal was unanimously approved by the committee.", options: ["The proposal was unanimously approved by the committee.", "The proposal unanimously approved the committee.", "The committee was unanimously approved by the proposal."] },
  ],
};
