/** Go Fish! rules (pure, no React / audio — tested in goFish.test.ts). Cards are labels; each label is in the game
 *  exactly twice. Pairs leave the hands at once ("Lucky! A pair!"). */
export interface FishState {
  child: string[];
  friend: string[];
  pond: string[];
  childPairs: string[];
  friendPairs: string[];
}

/** Move every pair in a hand to the pair pile. */
export function settle(hand: string[], pairs: string[]): { hand: string[]; pairs: string[] } {
  const out = [...hand];
  const got = [...pairs];
  for (let i = 0; i < out.length; i++) {
    const j = out.indexOf(out[i], i + 1);
    if (j > i) { got.push(out[i]); out.splice(j, 1); out.splice(i, 1); i -= 1; }
  }
  return { hand: out, pairs: got };
}

export function startState(child: string[], friend: string[], pond: string[]): FishState {
  const c = settle(child, []);
  const f = settle(friend, []);
  return { child: c.hand, friend: f.hand, pond: [...pond], childPairs: c.pairs, friendPairs: f.pairs };
}

/** The child asks for `label`. Returns the new state and whether the friend had it ('yes') or the child fished
 *  ('fish', with the card drawn, if any). */
export function childAsks(s: FishState, label: string): { state: FishState; result: 'yes' | 'fish'; drawn?: string } {
  if (s.friend.includes(label)) {
    const friend = [...s.friend]; friend.splice(friend.indexOf(label), 1);
    const c = settle([...s.child, label], s.childPairs);
    return { state: { ...s, friend, child: c.hand, childPairs: c.pairs }, result: 'yes' };
  }
  const [drawn, ...pond] = s.pond;
  if (!drawn) return { state: s, result: 'fish' };
  const c = settle([...s.child, drawn], s.childPairs);
  return { state: { ...s, pond, child: c.hand, childPairs: c.pairs }, result: 'fish', drawn };
}

/** The friend's question: the first card in the friend's hand (undefined = no cards). */
export const friendWants = (s: FishState): string | undefined => s.friend[0];

/** The child answered the friend truthfully: give the card, or the friend fishes. */
export function friendAsks(s: FishState): { state: FishState; result: 'yes' | 'fish' | 'none'; label?: string } {
  const label = friendWants(s);
  if (!label) return { state: s, result: 'none' };
  if (s.child.includes(label)) {
    const child = [...s.child]; child.splice(child.indexOf(label), 1);
    const f = settle([...s.friend, label], s.friendPairs);
    return { state: { ...s, child, friend: f.hand, friendPairs: f.pairs }, result: 'yes', label };
  }
  const [drawn, ...pond] = s.pond;
  if (!drawn) return { state: s, result: 'fish', label };
  const f = settle([...s.friend, drawn], s.friendPairs);
  return { state: { ...s, pond, friend: f.hand, friendPairs: f.pairs }, result: 'fish', label };
}

export const isOver = (s: FishState) => s.child.length === 0;
