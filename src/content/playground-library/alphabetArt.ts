/**
 * One illustration + one clear picture-word per letter, for the alphabet
 * games' "model first" stage (Alphabet Station) and anywhere else a lesson
 * needs "A is for apple".
 *
 * Pictures are flat kawaii art on a transparent background (no emoji, no 3D).
 * 16 come from the existing item library (`/lep1/items`); the 10 letters it
 * had no picture for (E F I J K Q U V X Z) were generated with Canva in the same
 * kawaii style (white page background knocked out to real alpha) into
 * `/lep1/alphabet`.
 * The picture-word is spoken with the normal recorded voice; the letter NAME
 * and SOUND always come from the recorded letter clips (see CLAUDE.md).
 */
export interface LetterArt {
  word: string;
  img: string;
}

const item = (file: string) => `/lep1/items/${file}`;
const drawn = (file: string) => `/lep1/alphabet/${file}`;

export const ALPHABET_ART: Record<string, LetterArt> = {
  a: { word: 'apple', img: item('item-apple.png') },
  b: { word: 'ball', img: item('item-ball.png') },
  c: { word: 'cat', img: item('item-cat.png') },
  d: { word: 'duck', img: item('item-duck-yellow.png') },
  e: { word: 'egg', img: drawn('item-egg.png') },
  f: { word: 'fish', img: drawn('item-fish.png') },
  g: { word: 'grapes', img: item('item-grapes.png') },
  h: { word: 'hat', img: item('item-hat.png') },
  i: { word: 'igloo', img: drawn('item-igloo.png') },
  j: { word: 'jelly', img: drawn('item-jelly.png') },
  k: { word: 'key', img: drawn('item-key.png') },
  l: { word: 'leaf', img: item('item-leaf.png') },
  m: { word: 'moon', img: item('item-moon.png') },
  n: { word: 'nut', img: item('item-nut.png') },
  o: { word: 'orange', img: item('item-orange.png') },
  p: { word: 'pizza', img: item('item-pizza.png') },
  q: { word: 'queen', img: drawn('item-queen.png') },
  r: { word: 'rainbow', img: item('item-rainbow.png') },
  s: { word: 'sun', img: item('item-sun.png') },
  t: { word: 'turtle', img: item('item-turtle.png') },
  u: { word: 'umbrella', img: drawn('item-umbrella.png') },
  v: { word: 'van', img: drawn('item-van.png') },
  w: { word: 'water', img: item('item-water.png') },
  x: { word: 'xylophone', img: drawn('item-xylophone.png') },
  y: { word: 'yo-yo', img: item('item-yoyo.png') },
  z: { word: 'zebra', img: drawn('item-zebra.png') },
};

export function artFor(letter: string): LetterArt | undefined {
  return ALPHABET_ART[letter.toLowerCase()];
}
