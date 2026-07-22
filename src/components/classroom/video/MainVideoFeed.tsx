
import { Button } from "@/components/ui/button";
import { Maximize2, Expand } from "lucide-react";
import { VideoFeed, VideoFeedProps } from "./VideoFeed";

interface MainVideoFeedProps extends Omit<VideoFeedProps, 'isSmall'> {
  onMaximize?: (id: string) => void;
}

export function MainVideoFeed({
  feed,
  isCurrentUser,
  onToggleMute,
  onToggleCamera,
  onRaiseHand,
  onMaximize,
}: MainVideoFeedProps) {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative min-h-[200px] sm:min-h-[300px] md:min-h-[400px] w-full">
      <VideoFeed
        feed={feed}
        isSmall={false}
        isCurrentUser={isCurrentUser}
        onToggleMute={onToggleMute}
        onToggleCamera={onToggleCamera}
        onRaiseHand={onRaiseHand}
      />
      
      <div className="absolute top-2 right-2 flex gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/30 hover:bg-black/50 text-white border-white/20"
          onClick={() => onMaximize?.(feed.id)}
        >
          <Expand size={16} />
        </Button>
      </div>
    </div>
  );
}
