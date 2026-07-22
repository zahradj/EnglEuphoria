
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { MediaControls } from "./tools/MediaControls";
import { TeachingTools } from "./tools/TeachingTools";

interface ToolsPanelProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleHand: () => void;
  onShowGames: () => void;
  onLayoutChange: (layout: string) => void;
  onShowRewards: () => void;
  onStartTimer: () => void;
  onUploadMaterial: () => void;
  isTeacherView?: boolean;
}

export function ToolsPanel({
  isMuted,
  isVideoOff,
  isHandRaised,
  onToggleMute,
  onToggleVideo,
  onToggleHand,
  onShowGames,
  onLayoutChange,
  onShowRewards,
  onStartTimer,
  onUploadMaterial,
  isTeacherView = true
}: ToolsPanelProps) {
  const { languageText } = useLanguage();
  const { toast } = useToast();
  const [currentLayout, setCurrentLayout] = useState("default");

  const handleLayoutChange = (layout: string) => {
    if (!layout) return;
    setCurrentLayout(layout);
    onLayoutChange(layout);
    
    toast({
      title: languageText.layoutChanged,
      description: `${languageText.switchedTo} ${layout} ${languageText.view}`,
    });
  };

  return (
    <Card className="p-3">
      <div className="flex flex-wrap gap-3 justify-between">
        {/* Media Controls */}
        <MediaControls 
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isHandRaised={isHandRaised}
          currentLayout={currentLayout}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onToggleHand={onToggleHand}
          onLayoutChange={handleLayoutChange}
        />

        {/* Teaching Tools */}
        <TeachingTools 
          permissions={{
            canControlLessonFlow: isTeacherView,
            canUploadContent: isTeacherView,
            canCreatePolls: isTeacherView,
            canSpotlightStudents: isTeacherView,
          }}
          onStartTimer={onStartTimer}
          onUploadMaterial={onUploadMaterial}
          onShowGames={onShowGames}
          onShowRewards={onShowRewards}
        />
      </div>
    </Card>
  );
}
