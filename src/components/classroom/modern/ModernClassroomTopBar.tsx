import { ArrowLeft, Copy, Clock, FileText, Circle, Settings, HelpCircle, X } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ModernClassroomTopBarProps {
  onBack: () => void;
  lessonTitle: string;
  roomCode?: string;
  currentSlide?: number;
  totalSlides?: number;
  sessionTime: string;
  isRecording?: boolean;
  connectionQuality: "excellent" | "good" | "poor";
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onExitClick: () => void;
}

export function ModernClassroomTopBar({
  onBack,
  lessonTitle,
  roomCode,
  currentSlide,
  totalSlides,
  sessionTime,
  isRecording = false,
  connectionQuality,
  onSettingsClick,
  onHelpClick,
  onExitClick
}: ModernClassroomTopBarProps) {
  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast.success("Room code copied to clipboard");
    }
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case "excellent": return "text-success";
      case "good": return "text-warning";
      case "poor": return "text-error";
    }
  };

  return (
    <div className="h-full px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <GlassButton
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </GlassButton>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground truncate max-w-[200px] lg:max-w-[400px]">
            {lessonTitle}
          </h1>
          {roomCode && (
            <button
              onClick={handleCopyRoomCode}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Room: {roomCode}</span>
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Center Section */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-mono font-medium">{sessionTime}</span>
        </div>

        {currentSlide !== undefined && totalSlides !== undefined && (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <FileText className="w-4 h-4 text-accent" />
            <span className="font-medium">
              {currentSlide} / {totalSlides}
            </span>
          </div>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-error animate-pulse">
            <div className="w-2 h-2 rounded-full bg-error" />
            <span className="font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg glass-light",
          getConnectionColor()
        )}>
          <Circle className="w-2 h-2 fill-current" />
          <span className="hidden sm:inline capitalize">{connectionQuality}</span>
        </div>

        {onSettingsClick && (
          <GlassButton
            size="sm"
            onClick={onSettingsClick}
            className="p-2"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </GlassButton>
        )}

        {onHelpClick && (
          <GlassButton
            size="sm"
            onClick={onHelpClick}
            className="p-2"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </GlassButton>
        )}

        <GlassButton
          size="sm"
          variant="default"
          onClick={onExitClick}
          className="flex items-center gap-2 text-error hover:text-error"
          aria-label="Exit classroom"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </GlassButton>
      </div>
    </div>
  );
}
