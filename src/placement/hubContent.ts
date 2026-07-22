// Hub-aware placement content — single source of truth for all three hubs.
// Loaded from public.placement_content (one row per hub), falls back to defaults.
//
// The Playground content keeps Pip + picture-quiz semantics. Academy / Success
// use the same shape so the Placement Studio can edit them identically.

import { supabase } from '@/integrations/supabase/client';

export type HubKey = 'playground' | 'academy' | 'success';

export interface PlacementOption {
  label: string;
  image: string;
  imagePrompt?: string;
}

export interface PlacementQuestion {
  id: string;
  prompt: string;
  audioPrompt: string;
  audioUrl?: string | null;
  options: PlacementOption[];
  correctIndex: number;
  difficulty: number;
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  listening?: boolean;
}

export interface PlacementSection {
  id: string;
  title: string;
  cardTitle: string;
  cardBody: string;
  questions: PlacementQuestion[];
}

export interface PipVoice {
  voiceId: string;
  label: string;
  intro: string;
  introAudioUrl?: string | null;
  encouragements: string[];
  /** Optional avatar image (Cast Vault character or generated). */
  avatarUrl?: string | null;
  /** Linked Cast Vault character id (if chosen from the vault). */
  characterId?: string | null;
}

export interface PlacementFrontPage {
  title: string;
  subtitle: string;
  chips: string[];
  ctaPrimary: string;
  ctaBeginner: string;
}

export interface HubPlacementContent {
  version: number;
  frontPage: PlacementFrontPage;
  pip: PipVoice;
  passThreshold: number;
  sections: PlacementSection[];
}

const img = (name: string) => `/placement/${name}`;

// ===== Playground (the existing, full, picture-based test) =====
export const DEFAULT_PLAYGROUND_CONTENT: HubPlacementContent = {
  version: 1,
  frontPage: {
    title: "Hi! I'm Pip the Fox.",
    subtitle:
      "Tap the pictures you know. It's a tiny game — just to see what English you already love!",
    chips: ['~3 minutes', '10 pictures', 'Just for fun'],
    ctaPrimary: 'Take the picture quiz',
    ctaBeginner: "I'm a true beginner",
  },
  pip: {
    voiceId: 'kPtEHAvRnjUJFv7SK9WI',
    label: 'Pip the Fox',
    intro: "Hi friend! I'm Pip. Let's play a picture game together. Ready?",
    encouragements: [
      'Great choice! Keep going!',
      'Wow, you are so smart!',
      'Nice work, I love that!',
      "You're doing great!",
      'Yes! High five!',
    ],
    avatarUrl: '/mascots/pip-fox-welcome.png',
  },
  passThreshold: 0.8,
  sections: [
    {
      id: 'section_1',
      title: 'Section 1 — Starter',
      cardTitle: "Let's begin!",
      cardBody: 'Tap the picture that matches.',
      questions: [
        { id: 'pg-1-cat', prompt: 'Which one is a CAT?', audioPrompt: 'Tap the cat.', difficulty: 0.1, targetLevel: 'A1', correctIndex: 1, options: [
          { label: 'Dog', image: img('dog.png'), imagePrompt: 'a happy friendly dog' },
          { label: 'Cat', image: img('cat.png'), imagePrompt: 'a cute orange cat' },
          { label: 'Rabbit', image: img('rabbit.png'), imagePrompt: 'a fluffy white rabbit' },
          { label: 'Bird', image: img('bird.png'), imagePrompt: 'a small blue bird' },
        ]},
        { id: 'pg-1-red', prompt: 'Which one is RED?', audioPrompt: 'Tap the red one.', difficulty: 0.1, targetLevel: 'A1', correctIndex: 2, options: [
          { label: 'Blue', image: img('blue.png'), imagePrompt: 'a blue paint splash circle' },
          { label: 'Green', image: img('green.png'), imagePrompt: 'a green paint splash circle' },
          { label: 'Red', image: img('red.png'), imagePrompt: 'a red paint splash circle' },
          { label: 'Yellow', image: img('yellow.png'), imagePrompt: 'a yellow paint splash circle' },
        ]},
        { id: 'pg-1-apple', prompt: 'Which one is an APPLE?', audioPrompt: 'Tap the apple.', difficulty: 0.15, targetLevel: 'A1', correctIndex: 1, options: [
          { label: 'Banana', image: img('banana.png'), imagePrompt: 'a yellow banana' },
          { label: 'Apple', image: img('apple.png'), imagePrompt: 'a shiny red apple' },
          { label: 'Grapes', image: img('grapes.png'), imagePrompt: 'a bunch of purple grapes' },
          { label: 'Orange', image: img('orange.png'), imagePrompt: 'a round orange fruit' },
        ]},
        { id: 'pg-1-sun', prompt: 'Which one is the SUN?', audioPrompt: 'Tap the sun.', difficulty: 0.15, targetLevel: 'A1', correctIndex: 3, options: [
          { label: 'Moon', image: img('moon.png'), imagePrompt: 'a crescent moon' },
          { label: 'Star', image: img('star.png'), imagePrompt: 'a yellow star' },
          { label: 'Cloud', image: img('cloud.png'), imagePrompt: 'a fluffy white cloud' },
          { label: 'Sun', image: img('sun.png'), imagePrompt: 'a bright yellow sun with rays' },
        ]},
        { id: 'pg-1-count', prompt: 'Listen: How many apples?', audioPrompt: 'Listen! How many apples? Tap the right number.', difficulty: 0.4, targetLevel: 'A1', listening: true, correctIndex: 2, options: [
          { label: 'One', image: img('count-1.png'), imagePrompt: 'one red apple' },
          { label: 'Two', image: img('count-2.png'), imagePrompt: 'two red apples' },
          { label: 'Three', image: img('count-3.png'), imagePrompt: 'three red apples' },
          { label: 'Four', image: img('count-4.png'), imagePrompt: 'four red apples' },
        ]},
      ],
    },
    {
      id: 'section_2',
      title: 'Section 2 — Bigger challenges',
      cardTitle: 'Amazing!',
      cardBody: 'You aced the first section! Ready for some bigger challenges?',
      questions: [
        { id: 'pg-2-drink', prompt: 'Which one can you DRINK?', audioPrompt: 'Tap the one you can drink.', difficulty: 0.25, targetLevel: 'A1', correctIndex: 1, options: [
          { label: 'Pizza', image: img('pizza.png'), imagePrompt: 'a slice of cheese pizza' },
          { label: 'Milk', image: img('milk.png'), imagePrompt: 'a glass of milk' },
          { label: 'Cookie', image: img('cookie.png'), imagePrompt: 'a chocolate chip cookie' },
          { label: 'Bread', image: img('bread.png'), imagePrompt: 'a loaf of bread' },
        ]},
        { id: 'pg-2-jumping', prompt: 'Which one is JUMPING?', audioPrompt: 'Tap the one that is jumping.', difficulty: 0.35, targetLevel: 'A1', correctIndex: 2, options: [
          { label: 'Standing', image: img('standing.png'), imagePrompt: 'a child standing still' },
          { label: 'Running', image: img('running.png'), imagePrompt: 'a child running fast' },
          { label: 'Jumping', image: img('jumping.png'), imagePrompt: 'a child jumping in the air' },
          { label: 'Sleeping', image: img('sleeping.png'), imagePrompt: 'a child sleeping in bed' },
        ]},
        { id: 'pg-2-grammar-is', prompt: 'Which sentence is correct?', audioPrompt: 'Listen and choose the right sentence.', difficulty: 0.55, targetLevel: 'A2', listening: true, correctIndex: 0, options: [
          { label: 'The dog is happy.', image: img('happy-dog.png'), imagePrompt: 'a happy smiling dog' },
          { label: 'The dog am happy.', image: img('happy-dog.png') },
          { label: 'The dog be happy.', image: img('happy-dog.png') },
          { label: 'The dog are happy.', image: img('happy-dog.png') },
        ]},
        { id: 'pg-2-grammar-like', prompt: 'Complete: "I ___ ice cream."', audioPrompt: 'I blank ice cream. Choose the right word.', difficulty: 0.65, targetLevel: 'A2', listening: true, correctIndex: 1, options: [
          { label: 'liking', image: img('ice-cream.png'), imagePrompt: 'a colorful ice cream cone' },
          { label: 'like', image: img('ice-cream.png') },
          { label: 'likes', image: img('ice-cream.png') },
          { label: 'liked it', image: img('ice-cream.png') },
        ]},
        { id: 'pg-2-clock', prompt: "Which clock shows THREE o'clock?", audioPrompt: "Find the clock that shows three o'clock.", difficulty: 0.7, targetLevel: 'B1', correctIndex: 2, options: [
          { label: "One o'clock", image: img('clock-1.svg') },
          { label: "Two o'clock", image: img('clock-2.svg') },
          { label: "Three o'clock", image: img('clock-3.svg') },
          { label: "Four o'clock", image: img('clock-4.svg') },
        ]},
      ],
    },
  ],
};

// ===== Academy default (teen-friendly, mixed CEFR) =====
export const DEFAULT_ACADEMY_CONTENT: HubPlacementContent = {
  version: 1,
  frontPage: {
    title: 'Welcome to your Academy placement.',
    subtitle: 'A quick check to find your perfect English level. ~10 minutes.',
    chips: ['~10 minutes', '15 questions', 'CEFR-aligned'],
    ctaPrimary: 'Start the placement',
    ctaBeginner: "I'm a true beginner",
  },
  pip: {
    voiceId: 'XrExE9yKIg1WjnnlVkGX',
    label: 'Nova the Owl',
    intro: "Hi! I'm Nova. Take a deep breath and pick the best answer — you've got this.",
    encouragements: ['Nice thinking!', 'Keep it up!', 'Strong choice.', 'You got this.'],
    avatarUrl: '/mascots/nova-owl-welcome.png',
  },
  passThreshold: 0.7,
  sections: [
    {
      id: 'academy_core',
      title: 'Core grammar & vocabulary',
      cardTitle: "Let's begin",
      cardBody: 'Pick the option that completes each sentence best.',
      questions: [
        { id: 'ac-1', prompt: 'She ___ my sister.', audioPrompt: 'She blank my sister. Choose the right word.', difficulty: 0.1, targetLevel: 'A1', correctIndex: 1, options: [
          { label: 'are', image: '' }, { label: 'is', image: '' }, { label: 'am', image: '' }, { label: 'be', image: '' },
        ]},
        { id: 'ac-2', prompt: 'I ___ to school every day.', audioPrompt: 'I blank to school every day.', difficulty: 0.15, targetLevel: 'A1', correctIndex: 0, options: [
          { label: 'go', image: '' }, { label: 'goes', image: '' }, { label: 'going', image: '' }, { label: 'went', image: '' },
        ]},
        { id: 'ac-3', prompt: 'There ___ three books on the desk.', audioPrompt: 'There blank three books on the desk.', difficulty: 0.2, targetLevel: 'A1', correctIndex: 1, options: [
          { label: 'is', image: '' }, { label: 'are', image: '' }, { label: 'be', image: '' }, { label: 'am', image: '' },
        ]},
        { id: 'ac-4', prompt: 'Last weekend I ___ a great movie.', audioPrompt: 'Last weekend I blank a great movie.', difficulty: 0.3, targetLevel: 'A2', correctIndex: 1, options: [
          { label: 'watch', image: '' }, { label: 'watched', image: '' }, { label: 'watching', image: '' }, { label: 'have watch', image: '' },
        ]},
        { id: 'ac-5', prompt: 'My brother is ___ than me.', audioPrompt: 'My brother is blank than me.', difficulty: 0.35, targetLevel: 'A2', correctIndex: 2, options: [
          { label: 'tall', image: '' }, { label: 'more tall', image: '' }, { label: 'taller', image: '' }, { label: 'tallest', image: '' },
        ]},
        { id: 'ac-6', prompt: 'We ___ pizza for dinner last night.', audioPrompt: 'We blank pizza for dinner last night.', difficulty: 0.4, targetLevel: 'A2', correctIndex: 2, options: [
          { label: 'eat', image: '' }, { label: 'eats', image: '' }, { label: 'ate', image: '' }, { label: 'eating', image: '' },
        ]},
        { id: 'ac-7', prompt: 'If it rains tomorrow, we ___ at home.', audioPrompt: 'If it rains tomorrow, we blank at home.', difficulty: 0.5, targetLevel: 'B1', correctIndex: 1, options: [
          { label: 'stay', image: '' }, { label: 'will stay', image: '' }, { label: 'would stay', image: '' }, { label: 'stayed', image: '' },
        ]},
        { id: 'ac-8', prompt: 'I ___ in this city since 2020.', audioPrompt: 'I blank in this city since 2020.', difficulty: 0.55, targetLevel: 'B1', correctIndex: 2, options: [
          { label: 'live', image: '' }, { label: 'lived', image: '' }, { label: 'have lived', image: '' }, { label: 'am living', image: '' },
        ]},
        { id: 'ac-9', prompt: 'She told me that she ___ tired.', audioPrompt: 'She told me that she blank tired.', difficulty: 0.6, targetLevel: 'B1', correctIndex: 1, options: [
          { label: 'is', image: '' }, { label: 'was', image: '' }, { label: 'be', image: '' }, { label: 'being', image: '' },
        ]},
        { id: 'ac-10', prompt: 'The homework ___ by every student before Friday.', audioPrompt: 'The homework blank by every student before Friday.', difficulty: 0.65, targetLevel: 'B1', correctIndex: 2, options: [
          { label: 'must do', image: '' }, { label: 'must doing', image: '' }, { label: 'must be done', image: '' }, { label: 'must been done', image: '' },
        ]},
        { id: 'ac-11', prompt: 'If I ___ more time, I would learn another language.', audioPrompt: 'If I blank more time, I would learn another language.', difficulty: 0.75, targetLevel: 'B2', correctIndex: 1, options: [
          { label: 'have', image: '' }, { label: 'had', image: '' }, { label: 'would have', image: '' }, { label: 'will have', image: '' },
        ]},
        { id: 'ac-12', prompt: 'By next year, she ___ from university.', audioPrompt: 'By next year, she blank from university.', difficulty: 0.8, targetLevel: 'B2', correctIndex: 2, options: [
          { label: 'will graduate', image: '' }, { label: 'graduates', image: '' }, { label: 'will have graduated', image: '' }, { label: 'is graduating', image: '' },
        ]},
        { id: 'ac-13', prompt: 'I wish I ___ how to play the guitar.', audioPrompt: 'I wish I blank how to play the guitar.', difficulty: 0.85, targetLevel: 'B2', correctIndex: 1, options: [
          { label: 'know', image: '' }, { label: 'knew', image: '' }, { label: 'have known', image: '' }, { label: 'am knowing', image: '' },
        ]},
        { id: 'ac-14', prompt: 'Hardly ___ the bus when it started raining.', audioPrompt: 'Hardly blank the bus when it started raining.', difficulty: 0.9, targetLevel: 'C1', correctIndex: 1, options: [
          { label: 'I had boarded', image: '' }, { label: 'had I boarded', image: '' }, { label: 'I boarded', image: '' }, { label: 'did I board', image: '' },
        ]},
        { id: 'ac-15', prompt: 'Not only ___ the deadline, but he also exceeded expectations.', audioPrompt: 'Not only blank the deadline, but he also exceeded expectations.', difficulty: 0.95, targetLevel: 'C1', correctIndex: 1, options: [
          { label: 'he met', image: '' }, { label: 'did he meet', image: '' }, { label: 'he did meet', image: '' }, { label: 'met he', image: '' },
        ]},
      ],
    },
  ],
};

// ===== Success / Professional default =====
export const DEFAULT_SUCCESS_CONTENT: HubPlacementContent = {
  version: 1,
  frontPage: {
    title: 'Welcome to your Success placement.',
    subtitle: 'A professional English check to match you with the right level. ~10 minutes.',
    chips: ['~10 minutes', '15 questions', 'Business English'],
    ctaPrimary: 'Start the placement',
    ctaBeginner: "I'm a true beginner",
  },
  pip: {
    voiceId: 'nPczCjzI2devNBz1zQrb',
    label: 'Atlas the Falcon',
    intro: "Welcome. I'm Atlas. I'll guide you through a short professional English check.",
    encouragements: ['Excellent.', 'Well reasoned.', 'Good call.', 'Confident choice.'],
    avatarUrl: '/mascots/atlas-falcon-welcome.png',
  },
  passThreshold: 0.7,
  sections: [
    {
      id: 'success_core',
      title: 'Professional English',
      cardTitle: "Let's begin",
      cardBody: 'Choose the most professional option for each sentence.',
      questions: [
        { id: 'su-1', prompt: 'I ___ writing to enquire about your services.', audioPrompt: 'I blank writing to enquire about your services.', difficulty: 0.2, targetLevel: 'A2', correctIndex: 0, options: [
          { label: 'am', image: '' }, { label: 'is', image: '' }, { label: 'be', image: '' }, { label: 'was', image: '' },
        ]},
        { id: 'su-2', prompt: 'Please ___ the report by end of day.', audioPrompt: 'Please blank the report by end of day.', difficulty: 0.25, targetLevel: 'A2', correctIndex: 1, options: [
          { label: 'send to', image: '' }, { label: 'send', image: '' }, { label: 'sending', image: '' }, { label: 'sent', image: '' },
        ]},
        { id: 'su-3', prompt: "I'd like to ___ a meeting for Thursday.", audioPrompt: "I'd like to blank a meeting for Thursday.", difficulty: 0.3, targetLevel: 'A2', correctIndex: 2, options: [
          { label: 'make', image: '' }, { label: 'put', image: '' }, { label: 'schedule', image: '' }, { label: 'do', image: '' },
        ]},
        { id: 'su-4', prompt: 'Could you ___ me know once the file is ready?', audioPrompt: 'Could you blank me know once the file is ready?', difficulty: 0.4, targetLevel: 'B1', correctIndex: 0, options: [
          { label: 'let', image: '' }, { label: 'make', image: '' }, { label: 'tell', image: '' }, { label: 'inform', image: '' },
        ]},
        { id: 'su-5', prompt: 'We need to ___ a deadline by Friday.', audioPrompt: 'We need to blank a deadline by Friday.', difficulty: 0.5, targetLevel: 'B1', correctIndex: 1, options: [
          { label: 'catch', image: '' }, { label: 'meet', image: '' }, { label: 'reach', image: '' }, { label: 'arrive', image: '' },
        ]},
        { id: 'su-6', prompt: 'The proposal ___ to the client yesterday.', audioPrompt: 'The proposal blank to the client yesterday.', difficulty: 0.55, targetLevel: 'B1', correctIndex: 2, options: [
          { label: 'sent', image: '' }, { label: 'has sent', image: '' }, { label: 'was sent', image: '' }, { label: 'sending', image: '' },
        ]},
        { id: 'su-7', prompt: 'I look forward to ___ from you soon.', audioPrompt: 'I look forward to blank from you soon.', difficulty: 0.6, targetLevel: 'B1', correctIndex: 2, options: [
          { label: 'hear', image: '' }, { label: 'heard', image: '' }, { label: 'hearing', image: '' }, { label: 'have heard', image: '' },
        ]},
        { id: 'su-8', prompt: "Apologies for the delay — I've been ___ with several projects.", audioPrompt: "Apologies for the delay — I've been blank with several projects.", difficulty: 0.65, targetLevel: 'B2', correctIndex: 1, options: [
          { label: 'busy', image: '' }, { label: 'tied up', image: '' }, { label: 'closed', image: '' }, { label: 'doing', image: '' },
        ]},
        { id: 'su-9', prompt: 'I see your point, ___ I have a different perspective.', audioPrompt: 'I see your point, blank I have a different perspective.', difficulty: 0.7, targetLevel: 'B2', correctIndex: 2, options: [
          { label: 'so', image: '' }, { label: 'because', image: '' }, { label: 'however', image: '' }, { label: 'therefore', image: '' },
        ]},
        { id: 'su-10', prompt: 'The new policy will ___ effect from next quarter.', audioPrompt: 'The new policy will blank effect from next quarter.', difficulty: 0.75, targetLevel: 'B2', correctIndex: 1, options: [
          { label: 'make', image: '' }, { label: 'take', image: '' }, { label: 'have', image: '' }, { label: 'do', image: '' },
        ]},
        { id: 'su-11', prompt: 'Were it not for her input, the project ___ have failed.', audioPrompt: 'Were it not for her input, the project blank have failed.', difficulty: 0.85, targetLevel: 'C1', correctIndex: 2, options: [
          { label: 'will', image: '' }, { label: 'may', image: '' }, { label: 'would', image: '' }, { label: 'shall', image: '' },
        ]},
        { id: 'su-12', prompt: 'Sales ___ a sharp downturn in Q3.', audioPrompt: 'Sales blank a sharp downturn in Q3.', difficulty: 0.85, targetLevel: 'C1', correctIndex: 1, options: [
          { label: 'saw', image: '' }, { label: 'experienced', image: '' }, { label: 'underwent', image: '' }, { label: 'felt', image: '' },
        ]},
        { id: 'su-13', prompt: 'It ___ that revenue will dip slightly next quarter.', audioPrompt: 'It blank that revenue will dip slightly next quarter.', difficulty: 0.85, targetLevel: 'C1', correctIndex: 0, options: [
          { label: 'appears', image: '' }, { label: 'is', image: '' }, { label: 'will be', image: '' }, { label: 'did', image: '' },
        ]},
        { id: 'su-14', prompt: 'The committee took the proposal ___ advisement before deciding.', audioPrompt: 'The committee took the proposal blank advisement before deciding.', difficulty: 0.9, targetLevel: 'C1', correctIndex: 2, options: [
          { label: 'in', image: '' }, { label: 'on', image: '' }, { label: 'under', image: '' }, { label: 'over', image: '' },
        ]},
        { id: 'su-15', prompt: 'Such was the impact of the launch ___ rivals scrambled to respond.', audioPrompt: 'Such was the impact of the launch blank rivals scrambled to respond.', difficulty: 0.95, targetLevel: 'C1', correctIndex: 1, options: [
          { label: 'so', image: '' }, { label: 'that', image: '' }, { label: 'which', image: '' }, { label: 'as', image: '' },
        ]},
      ],
    },
  ],
};

export const HUB_DEFAULTS: Record<HubKey, HubPlacementContent> = {
  playground: DEFAULT_PLAYGROUND_CONTENT,
  academy: DEFAULT_ACADEMY_CONTENT,
  success: DEFAULT_SUCCESS_CONTENT,
};

export const HUB_LABELS: Record<HubKey, string> = {
  playground: 'Playground (Kids)',
  academy: 'Academy (Teens)',
  success: 'Success (Adults)',
};

const cache: Partial<Record<HubKey, HubPlacementContent>> = {};
const inflight: Partial<Record<HubKey, Promise<HubPlacementContent>>> = {};

export function resetHubContentCache(hub?: HubKey) {
  if (hub) {
    delete cache[hub];
    delete inflight[hub];
  } else {
    (Object.keys(cache) as HubKey[]).forEach((k) => delete cache[k]);
    (Object.keys(inflight) as HubKey[]).forEach((k) => delete inflight[k]);
  }
}

export async function loadHubPlacementContent(
  hub: HubKey,
  opts: { force?: boolean } = {},
): Promise<HubPlacementContent> {
  if (!opts.force) {
    if (cache[hub]) return cache[hub]!;
    if (inflight[hub]) return inflight[hub]!;
  }
  inflight[hub] = (async () => {
    try {
      const { data, error } = await supabase
        .from('placement_content')
        .select('content')
        .eq('hub', hub)
        .maybeSingle();
      if (error) throw error;
      if (data?.content) {
        cache[hub] = data.content as HubPlacementContent;
        return cache[hub]!;
      }
    } catch (e) {
      console.warn(`[placement-content:${hub}] DB load failed, using defaults:`, e);
    }
    cache[hub] = HUB_DEFAULTS[hub];
    return cache[hub]!;
  })();
  const result = await inflight[hub]!;
  delete inflight[hub];
  return result;
}

export async function saveHubPlacementContent(
  hub: HubKey,
  content: HubPlacementContent,
): Promise<void> {
  const { error } = await supabase
    .from('placement_content')
    .upsert({ hub, content: content as any }, { onConflict: 'hub' });
  if (error) throw error;
  cache[hub] = content;
}

// Realtime invalidation: when an admin saves new placement content for a hub,
// every live student session drops its cache so the next read re-fetches.
let realtimeAttached = false;
export function attachPlacementContentRealtime() {
  if (realtimeAttached) return;
  realtimeAttached = true;
  try {
    supabase
      .channel('placement-content-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'placement_content' },
        (payload: any) => {
          const hub = (payload?.new?.hub ?? payload?.old?.hub) as HubKey | undefined;
          if (hub) resetHubContentCache(hub);
        },
      )
      .subscribe();
  } catch (e) {
    console.warn('[placement-content] realtime subscribe failed', e);
  }
}

