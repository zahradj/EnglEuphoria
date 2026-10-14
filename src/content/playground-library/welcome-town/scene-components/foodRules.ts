/* Pure rules for the Food Festival games (FoodSurveyScene, FestivalCafeScene) — kept out of the components so tests and
 * the voice-cache extractor say exactly the same sentences. */

export const surveyQuestion = (food: string, name: string) => `Do you like ${food}, ${name}?`;
export const surveyAnswer = (yes: boolean) => (yes ? 'Yes, I do!' : 'No, I don’t.');
export const surveyReport = (name: string, food: string, yes: boolean) => `${name} ${yes ? 'likes' : 'doesn’t like'} ${food}.`;

/** The tray matches the order when it holds exactly the ordered menu items (any order, no extras, no repeats). */
export function trayMatches(tray: number[], order: number[]): boolean {
  const t = [...new Set(tray)].sort((a, b) => a - b);
  const o = [...new Set(order)].sort((a, b) => a - b);
  return t.length === tray.length && t.length === o.length && t.every((x, i) => x === o[i]);
}

export const CAFE_WRONG = 'Hmm, that’s not my order. Listen again!';
export const CAFE_YES = 'Yes, please!';
