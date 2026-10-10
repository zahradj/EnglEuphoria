/** Pre-A1 scene kinds that own real synced state (see PlayUnitLesson.tsx for why some kinds are left out).
 *  Shared so A1/A2 lessons that embed a Pre-A1 game (`kind: 'prea1'`) sync it the same way. */
export const PREA1_REAL_SYNC_KINDS: ReadonlySet<string> = new Set<string>([
  'meet', 'sound-model', 'echo', 'video-check', 'sentence-build', 'who-said-it',
  'listen-repeat-cards', 'roleplay', 'join-stage', 'alphabet-blocks',
  'trophy-chest', 'color-model', 'color-quiz', 'color-spot', 'shape-model', 'toy-model',
  'train-recall', 'color-spy', 'color-simon', 'color-mix', 'shape-builder', 'secret-card', 'listen-colour', 'shape-fishing', 'pattern-train', 'tick-cross', 'story-order', 'story-video', 'odd-one-out', 'shape-torch', 'mystery-bag', 'tpr-actions', 'rapid-recall', 'sticker-reward', 'home-mission', 'lift-flap', 'draw-path', 'tile-reveal', 'tidy-up', 'color-monsters', 'peek-pop', 'claw-machine', 'ring-toss', 'simon-touch', 'body-stack', 'face-builder', 'sound-pick', 'sand-prints', 'shape-magic', 'shape-peek', 'shape-sorter', 'shape-bubbles', 'monster-maker', 'count-parts', 'robo-copy', 'move-match', 'part-peek', 'family-photo', 'size-line', 'cookie-faces', 'whos-missing', 'family-tree', 'duck-feed', 'night-sounds', 'feed-pip', 'cafe-order', 'party-belt', 'smoothie-bar', 'buzzer-show', 'house-hide', 'moving-day', 'house-builder', 'whose-room', 'door-knock', 'house-board', 'photo-snap', 'farm-wash', 'animal-parade', 'animal-riddle', 'farm-verse', 'recall-warmup', 'shadow-match', 'stepping-stones', 'flipbook',
  'name-gate', 'meet-group', 'friend-pop', 'feelings-tap', 'feelings-wheel',
  'x-is-feeling', 'he-she-model', 'feelings-dice', 'he-she-say', 'i-am-feeling',
  'feeling-quiz', 'feelings-bingo',
  'numbers-learn', 'numbers-review', 'candle-cake', 'count-balloons',
  'age-balloons', 'meet-greet', 'age-quiz', 'spin-wheel', 'picture-match',
  'first-sound', 'sound-blend', 'letter-match', 'letter-blocks', 'whats-missing', 'sort-basket', 'grammar-gap', 'color-play',
  'gather', 'voice-stage',
]);
