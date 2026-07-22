// Thinking Workflow — forces the Architect to reason before it writes.
// The 6 questions are answered silently and returned as a `reasoning_trace`
// on the blueprint. Never shown to students; used by QA + logs.

export const THINKING_WORKFLOW_PROMPT = `
## THINKING WORKFLOW (answer silently before writing anything)

Before you produce ANY blueprint field, answer these six questions in your
internal reasoning. Do not skip. Do not merge. The final blueprint must be
traceable back to your answers.

1. What can children/learners naturally DO with this topic?
2. What real places / settings fit this topic?
3. What problem could the characters solve using this topic?
4. What grammar naturally appears when solving that problem?
5. Which games make sense for that grammar + topic?
6. How should the lesson end so the learner feels the win?

Only after all six are answered may you write the blueprint. Emit the six
answers in a compact 'reasoning_trace' field so downstream QA can verify
each blueprint decision inherits from a specific answer above.
`.trim();
