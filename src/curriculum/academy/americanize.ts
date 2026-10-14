// American English for the Academy (course voice = standard American English; CLAUDE.md voice rule).
// The public Oxford lists used as a private level reference are written with British spellings, so the item checker maps the
// American form back to the British headword before looking up its CEFR level. Self-contained.

/** American form -> the British headword used by the Oxford lists (single words only). */
export const AMERICAN_TO_OXFORD: Record<string, string> = {
  center: 'centre',
  theater: 'theatre',
  meter: 'metre',
  kilometer: 'kilometre',
  liter: 'litre',
  program: 'programme',
  gray: 'grey',
  practice: 'practise',
  favorite: 'favourite',
  neighbor: 'neighbour',
  neighborhood: 'neighbourhood',
  humor: 'humour',
  rumor: 'rumour',
  favor: 'favour',
  behavior: 'behaviour',
  honor: 'honour',
  harbor: 'harbour',
  flavor: 'flavour',
  color: 'colour',
  colorful: 'colourful',
  colored: 'coloured',
  traveler: 'traveller',
  analyze: 'analyse',
  apologize: 'apologise',
  summarize: 'summarise',
  license: 'licence',
  defense: 'defence',
  offense: 'offence',
  fulfill: 'fulfil',
  enroll: 'enrol',
  canceled: 'cancelled',
  traveled: 'travelled',
  mom: 'mum',
  trash: 'rubbish',
  sidewalk: 'pavement',
  pants: 'trousers',
  sweater: 'jumper',
  truck: 'lorry',
  gas: 'petrol',
  cookie: 'biscuit',
  candy: 'sweets',
  math: 'maths',
  takeout: 'takeaway',
  apartment: 'flat',
  line: 'queue',
  fall: 'autumn',
  toward: 'towards',
};

/** Headword to look up in a British-spelled reference list for a normalised item. */
export function referenceForms(norm: string): string[] {
  const a = AMERICAN_TO_OXFORD[norm];
  return a ? [norm, a] : [norm];
}
