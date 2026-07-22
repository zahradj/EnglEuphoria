
import { Button } from "@/components/ui/button";
import { ClassroomChat } from "@/components/classroom/ClassroomChat";
import { useLanguage } from "@/contexts/LanguageContext";

interface Student {
  id: string;
  name: string;
  avatar: string;
  status: string;
  isCurrentUser: boolean;
}

interface SidebarContentProps {
  studentName: string;
  isChatOpen: boolean;
  students: Student[];
  isTeacherView: boolean;
  toggleChat: () => void;
}

export function SidebarContent({
  studentName,
  isChatOpen,
  students,
  isTeacherView,
  toggleChat,
}: SidebarContentProps) {
  const { languageText } = useLanguage();
  
  if (isChatOpen) {
    return (
      <div className="space-y-4">
        <ClassroomChat
          teacherName="Ms. Johnson"
          studentName={studentName}
        />
        <Button variant="outline" onClick={toggleChat} className="w-full">
          {languageText.closeChat}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chat button when chat is closed */}
      <Button onClick={toggleChat} className="w-full">
        {languageText.openChat}
      </Button>
    </div>
  );
}
