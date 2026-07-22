import { type ComponentType } from "react";
import type { PlaygroundLessonNumber } from "@/playground-blueprint/unitTemplate";

/**
 * Scaled preview wrapper. Renders the full PHASE_REGISTRY lesson component
 * (same one used by PlaygroundLessonPlayer) inside a fitted frame.
 */
export function PagePreview({
  lessonNumber,
  LessonComponent,
}: {
  lessonNumber: PlaygroundLessonNumber;
  LessonComponent: ComponentType;
}) {
  return (
    <div key={lessonNumber} className="h-full w-full overflow-auto bg-orange-50/40">
      <LessonComponent />
    </div>
  );
}
