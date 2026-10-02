import { describe, expect, it } from 'vitest';
import {
  ACCENTED_VOICE_REPLACEMENT,
  REQUIRED_ACCENT,
  VOICE_PROFILES,
  approvedVoiceId,
  isApprovedVoice,
  languageLock,
  normalizeForSpeech,
  numberToWords,
  safeVoiceSettings,
  speechRisks,
  unresolvedSpeechRisks,
  voiceStatus,
} from './speechPolicy';

describe('voice accent policy', () => {
  it('the required accent is standard American English', () => {
    expect(REQUIRED_ACCENT).toBe('american');
  });

  it('knows which voices carry an accent (and those are not approved)', () => {
    expect(voiceStatus('pFZP5JQG7iQjIQuC4Bku')).toBe('accented'); // Lily, British
    expect(voiceStatus('zrHiDhphv9ZnVXBqCLjz')).toBe('accented'); // Mimi, Swedish
    expect(voiceStatus('jsCqWAovK2LkecY7zXl4')).toBe('approved'); // Freya
    expect(voiceStatus('some-custom-voice-id')).toBe('unverified');
    expect(isApprovedVoice('pFZP5JQG7iQjIQuC4Bku')).toBe(false);
  });

  it('every accented voice has an approved replacement, and replacements are approved', () => {
    for (const p of VOICE_PROFILES.filter((v) => v.accent !== REQUIRED_ACCENT)) {
      const repl = ACCENTED_VOICE_REPLACEMENT[p.id];
      expect(repl, `${p.name} needs a replacement`).toBeTruthy();
      expect(isApprovedVoice(repl), `${p.name} -> ${repl}`).toBe(true);
    }
  });

  it('approvedVoiceId swaps accented voices and leaves everything else alone', () => {
    expect(approvedVoiceId('pFZP5JQG7iQjIQuC4Bku')).toBe('cgSgspJ2msm6clMCkdW9');
    expect(approvedVoiceId('jsCqWAovK2LkecY7zXl4')).toBe('jsCqWAovK2LkecY7zXl4');
    expect(approvedVoiceId('custom-voice')).toBe('custom-voice');
  });

  it('replacements keep the speaker gender', () => {
    const gender = (id: string) => VOICE_PROFILES.find((v) => v.id === id)?.gender;
    for (const [from, to] of Object.entries(ACCENTED_VOICE_REPLACEMENT)) {
      expect(gender(to), `${from} -> ${to}`).toBe(gender(from));
    }
  });
});

describe('voice settings stay in the stable range', () => {
  it('raises stability and caps style', () => {
    expect(safeVoiceSettings({ stability: 0.25, style: 0.85, similarity_boost: 0.85 })).toEqual({ stability: 0.5, style: 0.4, similarity_boost: 0.85 });
    expect(safeVoiceSettings({ stability: 0.75, style: 0.3 })).toEqual({ stability: 0.75, style: 0.3 });
  });
  it('locks the language to English only where the model supports it', () => {
    expect(languageLock('eleven_turbo_v2_5')).toEqual({ language_code: 'en' });
    expect(languageLock('eleven_flash_v2_5')).toEqual({ language_code: 'en' });
    expect(languageLock('eleven_multilingual_v2')).toEqual({});
  });
});

describe('normalizeForSpeech: say it the way a teacher would', () => {
  const cases: [string, string][] = [
    ['yo-yo', 'yo yo'],
    ['Look at the yo-yo!', 'Look at the yo yo!'],
    ['Mr. Smith is here', 'Mister Smith is here'],
    ['Dr Lee', 'Doctor Lee'],
    ['I have 3 apples and 12 pens', 'I have three apples and twelve pens'],
    ['Count to 10', 'Count to ten'],
    ['the 1st and the 3rd', 'the first and the third'],
    ['Read SAT and AT', 'Read sat and AT'],
    ['Say PIP and MIA', 'Say pip and mia'],
    ['HAT', 'Hat'],
    ['I am FIVE! Tap FIVE candles', 'I am five! Tap five candles'],
    ['Wow! HAT, MAT and BAT', 'Wow! Hat, mat and bat'],
    ['red, blue, AND purple', 'red, blue, and purple'],
    ['Every day — 100% of the time', 'Every day, one hundred percent of the time'],
    ['Watch TV and sing the ABC song', 'Watch T V and sing the ABC song'],
    ['OK, let us go', 'Okay, let us go'],
    ['You did it! ✨🏆', 'You did it!'],
    ['he/she is happy', 'he or she is happy'],
    ['Tom & Jerry', 'Tom and Jerry'],
    ['Wait... go!', 'Wait, go!'],
    ['A T-shirt', 'A T shirt'],
    ['Not now — later', 'Not now, later'],
    ['The year is 2026', 'The year is 2026'],
    ['It costs 3.5 dollars', 'It costs 3.5 dollars'],
    ['  lots   of   space  ', 'lots of space'],
    ['', ''],
  ];
  for (const [input, expected] of cases) {
    it(`"${input}" -> "${expected}"`, () => expect(normalizeForSpeech(input)).toBe(expected));
  }

  it('does not touch words that merely contain an abbreviation', () => {
    expect(normalizeForSpeech('book, drink, dress, movies, ms')).toBe('book, drink, dress, movies, Miss');
  });

  it('passes SSML through untouched (the author controls it)', () => {
    const ssml = '<phoneme alphabet="ipa" ph="æ">a</phoneme>';
    expect(normalizeForSpeech(ssml)).toBe(ssml);
  });

  it('is idempotent', () => {
    for (const [input] of cases) expect(normalizeForSpeech(normalizeForSpeech(input))).toBe(normalizeForSpeech(input));
  });

  it('numberToWords', () => {
    expect(numberToWords(0)).toBe('zero');
    expect(numberToWords(21)).toBe('twenty one');
    expect(numberToWords(100)).toBe('one hundred');
    expect(numberToWords(342)).toBe('three hundred forty two');
    expect(numberToWords(1500)).toBe('1500');
  });
});

describe('speechRisks: what a TTS cannot say correctly', () => {
  it('flags spelled-out sounds and phoneme notation (they must be recorded files)', () => {
    expect(speechRisks('Say sss for snake').map((r) => r.code)).toContain('spelled-sound');
    expect(speechRisks('Find /h/ in hat').map((r) => r.code)).toContain('phoneme-notation');
  });
  it('flags raw formatting problems that normalization fixes', () => {
    const raw = speechRisks('Mr. Lee has 3 cats & a PIG ✨').map((r) => r.code);
    expect(raw).toEqual(expect.arrayContaining(['abbreviation', 'digits', 'symbol', 'all-caps-word', 'emoji']));
    expect(unresolvedSpeechRisks('Mr. Lee has 3 cats & a PIG ✨')).toEqual([]);
  });
  it('flags other scripts (the voice may switch language/accent)', () => {
    expect(speechRisks('مرحبا hello').map((r) => r.code)).toContain('non-latin-script');
  });
  it('plain teaching sentences are clean', () => {
    expect(speechRisks("It's a red ball. What is it?")).toEqual([]);
  });
});
