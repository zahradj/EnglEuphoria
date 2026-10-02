/** Where a Playground curriculum row plays, by its `ai_metadata.contentFormat`.
 *  Shared by the Playground Library and the student dashboard's My Lessons
 *  tab so a lesson always opens the same player from every entry point. */
export interface LessonRouteMeta {
  contentFormat?: string | null;
  unit_number?: number | string | null;
  lesson_number?: number | string | null;
}

/** Route that plays the lesson, or null when the row has no playable
 *  scene content yet (an empty scaffold slot). */
export function playgroundLessonPath(rowId: string, m: LessonRouteMeta | null | undefined): string | null {
  const fmt = m?.contentFormat;
  const unit = Number(m?.unit_number ?? 1) || 1;
  const lesson = Number(m?.lesson_number ?? 1) || 1;
  switch (fmt) {
    case 'lep1-rich':
      // Unit 1's routes predate per-unit routing — keep them stable. Every
      // other unit gets a unit-scoped path so lesson numbers don't collide.
      return unit === 1 ? `/playground-scene/lesson-${lesson}` : `/playground-scene/unit-${unit}-lesson-${lesson}`;
    case 'wt-rich': return `/playground-scene/welcome-town-lesson-${lesson}`;
    case 'wt-a2-rich': return `/playground-scene/a2-unit-${unit}-lesson-${lesson}`;
    case 'jungle-rich': return `/playground-scene/jungle-lesson-${lesson}`;
    case 'castle-rich': return `/playground-scene/castle-lesson-${lesson}`;
    case 'scene-player': return `/playground-scene/play/${rowId}`;
    default: return null;
  }
}

/** Registry key of the lesson's Homework Quest / grammar entry. */
export function playgroundLessonKey(m: LessonRouteMeta | null | undefined): string | null {
  if (!m?.contentFormat || m.unit_number == null || m.lesson_number == null) return null;
  return `${m.contentFormat}-${m.unit_number}-${m.lesson_number}`;
}
