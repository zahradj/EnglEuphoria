
import { useState, useRef, useEffect } from "react";

export function useLessonState(externalLessonStarted: boolean | undefined, isTeacher: boolean, onAbsent: (msg: string) => void) {
  const [lessonStarted, setLessonStarted] = useState(externalLessonStarted ?? false);
  const [waitingSince, setWaitingSince] = useState<number | null>(null);
  const lessonStartTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lessonStarted) {
      setWaitingSince(Date.now());
      if (!lessonStartTimeout.current) {
        lessonStartTimeout.current = setTimeout(() => {
          const now = Date.now();
          if (!lessonStarted && waitingSince) {
            const minutes = Math.round((now - waitingSince) / 60000);
            if (minutes >= 5) {
              if (isTeacher) {
                onAbsent("Student marked absent (not joined within 5min)");
              } else {
                onAbsent("Teacher marked absent (lesson not started in 5min)");
              }
            }
          }
        }, 300000);
      }
    } else {
      if (lessonStartTimeout.current) {
        clearTimeout(lessonStartTimeout.current);
        lessonStartTimeout.current = null;
      }
      setWaitingSince(null);
    }
    return () => { if (lessonStartTimeout.current) clearTimeout(lessonStartTimeout.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonStarted, isTeacher, waitingSince]);

  return {
    lessonStarted,
    setLessonStarted,
    handleStartLesson: () => setLessonStarted(true)
  };
}
