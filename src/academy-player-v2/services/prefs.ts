// Comfort preferences of the student: Calm mode and sound. Saved on the device; the system's reduced-motion setting turns Calm on by default.
const KEY = 'academy-player-prefs-v2';
export interface Prefs { calm: boolean; sound: boolean }

export function defaultPrefs(): Prefs {
  let calm = false;
  try { calm = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
  return { calm, sound: true };
}
export function loadPrefs(): Prefs {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as Partial<Prefs> | null;
    const d = defaultPrefs();
    return { calm: typeof v?.calm === 'boolean' ? v.calm : d.calm, sound: typeof v?.sound === 'boolean' ? v.sound : d.sound };
  } catch { return defaultPrefs(); }
}
export function savePrefs(p: Prefs): void { try { window.localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ } }
