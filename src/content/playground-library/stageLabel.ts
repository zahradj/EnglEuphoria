/**
 * Teacher notes carry the lesson stage for the teacher panel and the quality gate ("Guided: …", "Free: …",
 * "Present: …", "Reading: …", "Check: …", "Extra time (Guided): …" — blueprint §3g). Many scenes also print `teacher`
 * as the on-screen instruction, where a child must not see "Guided:". `withoutStage` removes the label for display.
 */
const STAGE = /^\s*(?:Extra time\s*(?:\((?:Guided|Free)\))?|Guided|Free|Present|Reading|Check|Brain break)\s*:\s*/i;

export const withoutStage = (t: string | undefined): string | undefined => {
  if (!t) return t;
  const s = t.replace(STAGE, '');
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

/** The scene as the child sees it: the stage label is removed from its (and a wrapped Pre-A1 scene's) teacher note. */
export function displayScene<T>(scene: T): T {
  const s = scene as unknown as { teacher?: string; scene?: { teacher?: string } };
  if (typeof s.teacher !== 'string' || !STAGE.test(s.teacher)) {
    if (s.scene && typeof s.scene.teacher === 'string' && STAGE.test(s.scene.teacher)) return { ...s, scene: { ...s.scene, teacher: withoutStage(s.scene.teacher) } } as unknown as T;
    return scene;
  }
  const out: { teacher?: string; scene?: { teacher?: string } } = { ...s, teacher: withoutStage(s.teacher) };
  if (s.scene && typeof s.scene.teacher === 'string') out.scene = { ...s.scene, teacher: withoutStage(s.scene.teacher) };
  return out as unknown as T;
}
