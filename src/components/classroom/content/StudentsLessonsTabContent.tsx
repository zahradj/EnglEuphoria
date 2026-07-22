
import React from "react";
import { VideoPanel } from "@/components/classroom/video/VideoPanel";
import { StudentsTab } from "@/components/classroom/tabs/StudentsTab";
import { LessonTab } from "@/components/classroom/tabs/LessonTab";

interface StudentsLessonsTabContentProps {
  videoFeeds: Array<{
    id: string;
    name: string;
    isTeacher: boolean;
    isMuted: boolean;
    isCameraOff: boolean;
    isHandRaised?: boolean;
  }>;
  students: Array<{
    id: string;
    name: string;
    avatar: string;
    status: string;
    isCurrentUser: boolean;
  }>;
  quizQuestions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  currentUserId: string;
  isTeacherView: boolean;
  currentPage: number;
  onToggleMute: (id: string) => void;
  onToggleVideo: (id: string) => void;
  onToggleHand: (id: string) => void;
  onQuizComplete: (score: number, total: number) => void;
  onMessageStudent: (studentId: string) => void;
  onToggleSpotlight: (studentId: string) => void;
}

export function StudentsLessonsTabContent({
  videoFeeds,
  students,
  quizQuestions,
  currentUserId,
  isTeacherView,
  currentPage,
  onToggleMute,
  onToggleVideo,
  onToggleHand,
  onQuizComplete,
  onMessageStudent,
  onToggleSpotlight
}: StudentsLessonsTabContentProps) {
  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="w-full">
        <VideoPanel
          videoFeeds={videoFeeds}
          currentUserId={currentUserId}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onToggleHand={onToggleHand}
          oneOnOneMode={true}
          currentPage={currentPage}
        />
      </div>
      <div className="w-full">
        {isTeacherView ? (
          <StudentsTab
            students={students}
            onMessageStudent={onMessageStudent}
            onToggleSpotlight={onToggleSpotlight}
          />
        ) : (
          <LessonTab
            quizQuestions={quizQuestions}
            onQuizComplete={onQuizComplete}
          />
        )}
      </div>
    </div>
  );
}
