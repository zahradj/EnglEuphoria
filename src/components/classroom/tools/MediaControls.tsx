
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Mic, MicOff, Video, VideoOff, Hand, Layout, BookOpen, Maximize2 } from "lucide-react";

interface MediaControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  currentLayout: string;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleHand: () => void;
  onLayoutChange: (layout: string) => void;
}

export function MediaControls({
  isMuted,
  isVideoOff,
  isHandRaised,
  currentLayout,
  onToggleMute,
  onToggleVideo,
  onToggleHand,
  onLayoutChange
}: MediaControlsProps) {
  const handleLayoutChange = (layout: string) => {
    if (!layout) return;
    onLayoutChange(layout);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        className={isMuted ? "bg-destructive text-white hover:text-white hover:bg-destructive/90" : ""}
        onClick={onToggleMute}
      >
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      
      <Button
        size="icon"
        variant="outline"
        className={isVideoOff ? "bg-destructive text-white hover:text-white hover:bg-destructive/90" : ""}
        onClick={onToggleVideo}
      >
        {isVideoOff ? <VideoOff /> : <Video />}
      </Button>
      
      <Button
        size="icon"
        variant="outline"
        className={isHandRaised ? "bg-yellow text-yellow-dark hover:text-yellow-dark hover:bg-yellow/90" : ""}
        onClick={onToggleHand}
      >
        <Hand />
      </Button>
      
      <Separator orientation="vertical" className="h-8" />
      
      {/* Layout Controls */}
      <ToggleGroup type="single" value={currentLayout} onValueChange={handleLayoutChange}>
        <ToggleGroupItem value="default" aria-label="Default view">
          <Layout size={18} />
        </ToggleGroupItem>
        <ToggleGroupItem value="material" aria-label="Material focus">
          <BookOpen size={18} />
        </ToggleGroupItem>
        <ToggleGroupItem value="video" aria-label="Video focus">
          <Maximize2 size={18} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
