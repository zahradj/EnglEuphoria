
import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  isTeacher: boolean;
  onStartLesson: () => void;
}

export function LessonStartPrompt({ isTeacher, onStartLesson }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {isTeacher ? (
        <>
          <span className="font-bold text-xl text-gray-700 mb-2">
            Ready to Start the Lesson?
          </span>
          <Button
            onClick={onStartLesson}
            className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg text-lg hover:bg-blue-700 transition"
          >
            Start Lesson
          </Button>
          <span className="mt-4 text-sm text-gray-500">Students will join when you start.</span>
        </>
      ) : (
        <>
          <span className="font-bold text-xl text-gray-700 mb-2">
            Waiting for Teacher to Start the Lesson...
          </span>
          <div className="mt-2 text-sm text-gray-400">
            This window will automatically connect once your teacher begins.<br />
            If the lesson doesn't start in 5 minutes the teacher will be marked absent.
          </div>
        </>
      )}
    </div>
  );
}
