
import { Mic, MicOff, Video, VideoOff, Hand, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export interface VideoFeedProps {
  feed: {
    id: string;
    name: string;
    isTeacher: boolean;
    isMuted: boolean;
    isCameraOff: boolean;
    isHandRaised?: boolean;
    videoSrc?: string;
  };
  isSmall: boolean;
  isCurrentUser: boolean;
  onToggleMute?: (id: string) => void;
  onToggleCamera?: (id: string) => void;
  onRaiseHand?: (id: string) => void;
}

export function VideoFeed({
  feed,
  isSmall,
  isCurrentUser,
  onToggleMute,
  onToggleCamera,
  onRaiseHand,
}: VideoFeedProps) {
  const { languageText } = useLanguage();
  const { id, name, isTeacher, isMuted, isCameraOff, isHandRaised, videoSrc } = feed;

  return (
    <>
      {/* Video Placeholder */}
      {isCameraOff ? (
        <div className="h-full w-full flex flex-col items-center justify-center bg-muted-foreground/10">
          <UserCircle2 className={`${isSmall ? 'h-12 w-12' : 'h-20 w-20'} text-muted-foreground/80`} />
          <span className={`${isSmall ? 'text-sm' : 'text-lg'} text-white font-medium mt-1`}>{name}</span>
        </div>
      ) : (
        <div className="h-full w-full bg-muted-foreground/20">
          {videoSrc ? (
            <video 
              src={videoSrc}
              className="h-full w-full object-cover"
              autoPlay
              muted
            />
          ) : (
            // Placeholder for real video
            <div className="h-full w-full flex items-center justify-center">
              <span className={`text-white/80 ${isSmall ? 'text-sm' : 'text-base'}`}>{name}'s video</span>
            </div>
          )}
        </div>
      )}
      
      {/* Status badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isTeacher && (
          <span className="bg-teal px-2 py-0.5 rounded-full text-xs text-white">
            {languageText.teacher}
          </span>
        )}
        {isCurrentUser && (
          <span className="bg-purple px-2 py-0.5 rounded-full text-xs text-white">
            {languageText.you}
          </span>
        )}
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {isMuted && (
            <div className="bg-red-500 rounded-full p-1">
              <MicOff size={isSmall ? 12 : 16} className="text-white" />
            </div>
          )}
          
          {isHandRaised && (
            <div className="bg-yellow rounded-full p-1">
              <Hand size={isSmall ? 12 : 16} className="text-yellow-dark" />
            </div>
          )}
        </div>

        {/* Only show control buttons for current user and not in small view */}
        {isCurrentUser && !isSmall && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full size-8 ${
                isMuted ? "bg-red-500 text-white border-transparent" : "bg-black/30 text-white border-white/20"
              }`}
              onClick={() => onToggleMute?.(id)}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full size-8 ${
                isCameraOff ? "bg-red-500 text-white border-transparent" : "bg-black/30 text-white border-white/20"
              }`}
              onClick={() => onToggleCamera?.(id)}
            >
              {isCameraOff ? <VideoOff size={14} /> : <Video size={14} />}
            </Button>
            
            {onRaiseHand && (
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full size-8 ${
                  isHandRaised ? "bg-yellow text-yellow-dark border-transparent" : "bg-black/30 text-white border-white/20"
                }`}
                onClick={() => onRaiseHand(id)}
              >
                <Hand size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
