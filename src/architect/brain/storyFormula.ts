// Story Design Formula — 5 fixed beats.
// The story arc is invariant; only the content changes per theme.

export const STORY_BEATS = ['Goal', 'Problem', 'Adventure', 'Success', 'Celebration'] as const;
export type StoryBeat = typeof STORY_BEATS[number];

export const STORY_FORMULA_PROMPT = `
## STORY DESIGN FORMULA (binding — never deviate)

Every lesson story MUST follow exactly 5 beats, in order:

1. **Goal** — the character wants something concrete and topic-bound.
2. **Problem** — a specific obstacle blocks the goal. Name it in one sentence.
3. **Adventure** — the character uses target vocabulary + the exact grammar
   frame to try to solve the problem. Every target word must appear at
   least once here.
4. **Success** — the problem is solved BY using the lesson language, not by
   accident or by an outside helper.
5. **Celebration** — a concrete reward from the Theme Brain (badge, star,
   sticker). The learner sees the win.

The blueprint MUST expose a \`story.problem\` field with the exact obstacle
sentence. Blueprints without an explicit problem are rejected.
`.trim();
