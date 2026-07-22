// Sound Effects Constants for Early Learners
// These are placeholder URLs - replace with actual sound file URLs

export const SOUND_EFFECTS = {
  // Interaction sounds
  knock: '/sounds/knock.mp3',
  pop: '/sounds/pop.mp3',
  highFive: '/sounds/high-five.mp3',
  click: '/sounds/click.mp3',
  
  // Celebration sounds
  confetti: '/sounds/confetti.mp3',
  cheer: '/sounds/cheer.mp3',
  fanfare: '/sounds/fanfare.mp3',
  sparkle: '/sounds/sparkle.mp3',
  
  // Character sounds
  bennyHello: '/sounds/benny-hello.mp3',
  bennyGreeting: '/sounds/benny-greeting.mp3',
  bennyExcited: '/sounds/benny-excited.mp3',
  bennySad: '/sounds/benny-sad.mp3',
  bennyEncourage: '/sounds/benny-encourage.mp3',
  
  // Mood sounds
  happySun: '/sounds/happy-sun.mp3',
  sadCloud: '/sounds/sad-cloud.mp3',
  
  // Feedback sounds
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  complete: '/sounds/complete.mp3',
  star: '/sounds/star.mp3',
  
  // UI sounds
  whoosh: '/sounds/whoosh.mp3',
  ding: '/sounds/ding.mp3',
  bubble: '/sounds/bubble.mp3',
} as const;

export type SoundEffectKey = keyof typeof SOUND_EFFECTS;

// Helper function to play a sound effect
export const playSound = (key: SoundEffectKey, volume: number = 1.0): void => {
  try {
    const audio = new Audio(SOUND_EFFECTS[key]);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(err => {
      console.warn(`Failed to play sound: ${key}`, err);
    });
  } catch (err) {
    console.warn(`Failed to create audio for: ${key}`, err);
  }
};
