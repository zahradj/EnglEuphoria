// Emotional-safety hard-block lexicon.
// Hits anywhere in lesson text → block severity.

export const UNSAFE_PHRASES: { phrase: RegExp; reason: string }[] = [
  { phrase: /\blaugh at\b/i, reason: 'humiliation prompt' },
  { phrase: /\bmake fun of\b/i, reason: 'bullying frame' },
  { phrase: /\bperform in front of (the )?class\b/i, reason: 'public performance without opt-out' },
  { phrase: /\bcompare yourself to (your )?classmates?\b/i, reason: 'public comparison' },
  { phrase: /\bwhich student is the (worst|dumbest|slowest)\b/i, reason: 'ranking peers negatively' },
  { phrase: /\bembarrass(ing|ed)?\b/i, reason: 'embarrassment framing' },
  { phrase: /\bnobody likes\b/i, reason: 'social exclusion' },
  { phrase: /\bsuicid(e|al)\b/i, reason: 'self-harm reference' },
  { phrase: /\bself[-\s]?harm\b/i, reason: 'self-harm reference' },
  { phrase: /\b(kill|hurt) (yourself|himself|herself)\b/i, reason: 'self-harm reference' },
  { phrase: /\bn[i1]gg(er|a)\b/i, reason: 'slur' },
  { phrase: /\bfag(got)?\b/i, reason: 'slur' },
  { phrase: /\bret(ar)?d(ed)?\b/i, reason: 'slur' },
  { phrase: /\bporn\b/i, reason: 'NSFW' },
  { phrase: /\bgambl(e|ing)\b/i, reason: 'gambling promotion' },
];

export const SPEAKING_TASK_RED_FLAGS: { phrase: RegExp; reason: string }[] = [
  { phrase: /\bin front of the (whole )?class\b/i, reason: 'forced public speaking' },
  { phrase: /\bif you (are )?wrong, .*(loser|punish|fail)/i, reason: 'shame penalty' },
];
