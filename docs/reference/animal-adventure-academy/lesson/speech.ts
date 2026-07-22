// Lightweight wrapper around the browser SpeechSynthesis API.
// Kid-friendly default: slower rate, slightly higher pitch.

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  // Prefer a female/child-sounding voice when available
  cachedVoice =
    en.find((v) => /samantha|google us english|female|child|karen|tessa/i.test(v.name)) ||
    en[0] ||
    voices[0] ||
    null;
  return cachedVoice;
}

export function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.85;
    u.pitch = opts.pitch ?? 1.15;
    u.lang = "en-US";
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

// Prime voice list on first interaction
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}
