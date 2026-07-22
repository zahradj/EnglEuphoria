
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Video, FileText, Users, Gamepad2 } from "lucide-react";

interface TabsNavigationProps {
  isTeacherView: boolean;
}

export function TabsNavigation({ isTeacherView }: TabsNavigationProps) {
  const { languageText } = useLanguage();

  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="video" className="flex items-center gap-2">
        <Video size={16} />
        <span>Video & Materials</span>
      </TabsTrigger>
      <TabsTrigger value="whiteboard" className="flex items-center gap-2">
        <FileText size={16} />
        <span>Interactive Board</span>
      </TabsTrigger>
      <TabsTrigger value="students" className="flex items-center gap-2">
        {isTeacherView ? <Users size={16} /> : <Gamepad2 size={16} />}
        <span>{isTeacherView ? languageText.students : languageText.lessons}</span>
      </TabsTrigger>
    </TabsList>
  );
}
