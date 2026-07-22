
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Trophy, Book } from "lucide-react";
import { StudentProgressHeader } from "./StudentProgressHeader";
import { ChatTabContent } from "./TabContent/ChatTabContent";
import { RewardsTabContent } from "./TabContent/RewardsTabContent";
import { DictionaryTabContent } from "./TabContent/DictionaryTabContent";

interface StudentInfoTabsProps {
  studentName: string;
  studentXP: number;
  activeRightTab: string;
  onTabChange: (tab: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
}

export function StudentInfoTabs({
  studentName,
  studentXP,
  activeRightTab,
  onTabChange,
  currentUser
}: StudentInfoTabsProps) {
  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <Tabs value={activeRightTab} onValueChange={onTabChange} className="h-full flex flex-col">
        <StudentProgressHeader
          studentName={studentName}
          studentXP={studentXP}
          currentUser={currentUser}
        />

        <TabsList className="grid w-full grid-cols-3 m-0 rounded-none flex-shrink-0">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageCircle size={14} />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1">
            <Trophy size={14} />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="dictionary" className="flex items-center gap-1">
            <Book size={14} />
            <span className="hidden sm:inline">Dictionary</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full p-4">
            <ChatTabContent />
          </TabsContent>

          <TabsContent value="rewards" className="h-full p-4">
            <RewardsTabContent />
          </TabsContent>

          <TabsContent value="dictionary" className="h-full p-4">
            <DictionaryTabContent />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
