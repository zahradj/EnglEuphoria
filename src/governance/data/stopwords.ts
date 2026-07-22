// English function-word allowlist for the vocab engine.
// These are never flagged as off-vocab drift.

export const STOPWORDS: Set<string> = new Set([
  'a','an','the','and','or','but','so','if','then','than','as','at','by','for','from',
  'in','into','of','on','onto','to','with','without','about','over','under','up','down',
  'i','you','he','she','it','we','they','me','him','her','us','them','my','your','his',
  'its','our','their','this','that','these','those','here','there',
  'is','am','are','was','were','be','been','being','do','does','did','doing','done',
  'have','has','had','having','will','would','can','could','should','may','might','must',
  'shall','not','no','yes','very','just','also','too','only','more','most','some','any',
  'all','each','every','many','much','few','little','one','two','three','first','next',
  'now','today','tomorrow','yesterday','please','thanks','thank','hello','hi','bye',
  'what','when','where','why','how','who','whom','whose','which',
]);

export function tokenizeContentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}
