// AI-phrasing & placeholder leak markers (case-insensitive).
export const AI_PHRASING_MARKERS: RegExp[] = [
  /\bas an ai\b/i,
  /\bi am an ai\b/i,
  /\bas a language model\b/i,
  /\bdelve into\b/i,
  /\bit is important to note\b/i,
  /\bin conclusion[, ]/i,
  /\bplease let me know\b/i,
  /\bcertainly! here'?s\b/i,
  /\bsure! here'?s\b/i,
  /\bi hope this helps\b/i,
];

export const PLACEHOLDER_LEAK_MARKERS: RegExp[] = [
  /\{\{[^}]+\}\}/,           // {{topic}}
  /\{[a-z_]+\}/i,            // {topic}
  /\[INSERT[^\]]*\]/i,       // [INSERT EXAMPLE]
  /\[TODO[^\]]*\]/i,
  /\bLOREM IPSUM\b/i,
  /\bsample text\b/i,
  /\bexample placeholder\b/i,
];
