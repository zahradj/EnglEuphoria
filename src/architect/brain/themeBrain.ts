// Theme Brain — reusable ingredients per theme.
// Stops the Architect from re-inventing settings/objects/rewards every lesson.
// Extend freely; every card must stay concrete + child-safe.

export interface ThemeCard {
  theme: string;
  characters: string[];
  settings: string[];
  objects: string[];
  actions: string[];
  rewards: string[];
  sampleGrammarGoals: string[]; // maps into grammarFromGoal.ts families
}

export const THEME_BRAIN: Record<string, ThemeCard> = {
  colors: {
    theme: 'colors',
    characters: ['Pip', 'Bella'],
    settings: ['playground', 'art room', 'park', 'rainbow hill'],
    objects: ['balloon', 'kite', 'crayon', 'paint', 'flower'],
    actions: ['paint', 'find', 'match', 'collect', 'decorate'],
    rewards: ['Rainbow Badge', 'Color Star'],
    sampleGrammarGoals: ['identify'],
  },
  animals: {
    theme: 'animals',
    characters: ['Pip', 'Zuri the Zookeeper'],
    settings: ['zoo', 'jungle', 'farm', 'ocean'],
    objects: ['lion', 'elephant', 'fish', 'bird', 'rabbit'],
    actions: ['feed', 'rescue', 'match', 'listen', 'guess'],
    rewards: ['Animal Friend Badge', 'Habitat Sticker'],
    sampleGrammarGoals: ['identify', 'preference'],
  },
  food: {
    theme: 'food',
    characters: ['Pip', 'Chef Momo'],
    settings: ['kitchen', 'market', 'picnic', 'restaurant'],
    objects: ['apple', 'bread', 'cheese', 'juice', 'cake'],
    actions: ['taste', 'cook', 'share', 'buy', 'order'],
    rewards: ['Master Chef Hat', 'Golden Spoon'],
    sampleGrammarGoals: ['preference', 'identify'],
  },
  space: {
    theme: 'space',
    characters: ['Pip', 'Astro'],
    settings: ['rocket', 'moon', 'planet', 'space station'],
    objects: ['star', 'planet', 'rocket', 'comet', 'astronaut'],
    actions: ['launch', 'explore', 'count', 'land', 'discover'],
    rewards: ['Explorer Badge', 'Star Coin'],
    sampleGrammarGoals: ['identify', 'location'],
  },
  school: {
    theme: 'school',
    characters: ['Pip', 'Miss Ivy'],
    settings: ['classroom', 'playground', 'library', 'lunchroom'],
    objects: ['book', 'pencil', 'bag', 'chair', 'board'],
    actions: ['read', 'write', 'share', 'ask', 'listen'],
    rewards: ['Gold Star', 'Reading Ribbon'],
    sampleGrammarGoals: ['identify', 'location'],
  },
  family: {
    theme: 'family',
    characters: ['Pip', 'Mama Pip', 'Papa Pip'],
    settings: ['home', 'garden', 'park', 'grandma\'s house'],
    objects: ['mom', 'dad', 'sister', 'brother', 'baby'],
    actions: ['hug', 'help', 'play', 'share', 'love'],
    rewards: ['Family Heart Badge'],
    sampleGrammarGoals: ['identify', 'preference'],
  },
  weather: {
    theme: 'weather',
    characters: ['Pip', 'Cloudy'],
    settings: ['sky', 'beach', 'mountain', 'city street'],
    objects: ['sun', 'rain', 'snow', 'cloud', 'wind'],
    actions: ['watch', 'dress', 'run', 'jump', 'shelter'],
    rewards: ['Weather Wizard Badge'],
    sampleGrammarGoals: ['describe', 'identify'],
  },
};

export function findThemeCard(theme?: string): ThemeCard | null {
  if (!theme) return null;
  const key = theme.toLowerCase().trim();
  if (THEME_BRAIN[key]) return THEME_BRAIN[key];
  // partial match: e.g. "bright colors" → colors
  for (const [k, card] of Object.entries(THEME_BRAIN)) {
    if (key.includes(k)) return card;
  }
  return null;
}

export function buildThemeBrainPrompt(theme?: string): string {
  const card = findThemeCard(theme);
  const header = [
    '## THEME KNOWLEDGE BASE (retrieve, never invent)',
    'You do NOT invent lesson ingredients. You RETRIEVE them from the Theme',
    'Brain below. Inventing parallel objects, settings, or rewards is the #1',
    'reason lessons feel generic. Bind every slide to items from this card.',
    'If the seed theme is missing from the knowledge base, pick the closest',
    'card and state the substitution in `blueprint.design_workflow.notes`.',
  ].join('\n');
  if (!card) {
    const known = Object.keys(THEME_BRAIN).join(', ');
    return `${header}\n\nAvailable theme cards: ${known}. No card matched the seed — pick the closest one and log the substitution.`;
  }
  return [
    header,
    '',
    `### Theme card: "${card.theme}"`,
    `- Characters: ${card.characters.join(', ')}`,
    `- Settings: ${card.settings.join(', ')}`,
    `- Concrete objects (image anchors): ${card.objects.join(', ')}`,
    `- Actions (verbs for TPR + games): ${card.actions.join(', ')}`,
    `- Rewards: ${card.rewards.join(', ')}`,
    `- Natural communication goals: ${card.sampleGrammarGoals.join(', ')}`,
    '',
    'Binding rules:',
    '- Vocabulary cards MUST be drawn from `objects` (with the theme adjective when relevant, e.g. "red balloon").',
    '- TPR / game verbs MUST be drawn from `actions`.',
    '- Story setting MUST be one of `settings`.',
    '- Story characters MUST be from `characters` (Pip is always eligible).',
    '- Celebration reward MUST be one of `rewards`.',
  ].join('\n');
}
