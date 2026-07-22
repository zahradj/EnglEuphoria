
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VideoConferencePanel } from "@/components/classroom/VideoConferencePanel";
import { TeachingMaterial } from "@/components/classroom/TeachingMaterial";
import { ESLWhiteboard } from "@/components/classroom/ESLWhiteboard";
import { StudentsTab } from "@/components/classroom/tabs/StudentsTab";
import { LessonTab } from "@/components/classroom/tabs/LessonTab";
import { useLanguage } from "@/contexts/LanguageContext";

interface MainContentTabsProps {
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
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  onToggleMute: (id: string) => void;
  onToggleVideo: (id: string) => void;
  onToggleHand: (id: string) => void;
  onQuizComplete: (score: number, total: number) => void;
  onMessageStudent: (studentId: string) => void;
  onToggleSpotlight: (studentId: string) => void;
}

export function MainContentTabs({
  videoFeeds,
  students,
  quizQuestions,
  currentUserId,
  isTeacherView,
  isMuted,
  isVideoOff,
  isHandRaised,
  onToggleMute,
  onToggleVideo,
  onToggleHand,
  onQuizComplete,
  onMessageStudent,
  onToggleSpotlight,
}: MainContentTabsProps) {
  const { languageText } = useLanguage();
  const [activeTab, setActiveTab] = useState("video");

  const videoWithHandRaised = videoFeeds.map(feed => ({
    ...feed,
    isHandRaised: feed.id === currentUserId ? isHandRaised : feed.isHandRaised
  }));

  return (
    <Tabs defaultValue="video" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="video">{languageText.videoAndSlides}</TabsTrigger>
        <TabsTrigger value="whiteboard">{languageText.whiteboard}</TabsTrigger>
        <TabsTrigger value="students">{isTeacherView ? languageText.students : languageText.lessons}</TabsTrigger>
      </TabsList>

      <TabsContent value="video" className="space-y-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TeachingMaterial
              materialType="pdf"
              source="ESL_Animals_Lesson.pdf"
              currentPage={1}
              totalPages={5}
              allowAnnotation
            />
          </div>
          <div>
            <VideoConferencePanel
              feeds={videoWithHandRaised}
              currentUserId={currentUserId}
              onToggleMute={onToggleMute}
              onToggleCamera={onToggleVideo}
              onRaiseHand={onToggleHand}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="whiteboard" className="pt-4">
        <ESLWhiteboard isCollaborative={true} />
      </TabsContent>

      <TabsContent value="students" className="pt-4">
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
      </TabsContent>
    </Tabs>
  );
}
