
import { useState } from "react";
import { MainVideoFeed } from "./video/MainVideoFeed";
import { CompactVideoFeed } from "./video/CompactVideoFeed";
import { SideVideoFeed } from "./video/SideVideoFeed";
import { type VideoFeedType } from "./video/types";

interface VideoConferencePanelProps {
  feeds: VideoFeedType[];
  onToggleMute: (id: string) => void;
  onToggleCamera: (id: string) => void;
  onRaiseHand?: (id: string) => void;
  onMaximize?: (id: string) => void;
  currentUserId: string;
  compact?: boolean;
}

export function VideoConferencePanel({
  feeds,
  onToggleMute,
  onToggleCamera,
  onRaiseHand,
  onMaximize,
  currentUserId,
  compact = false,
}: VideoConferencePanelProps) {
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(
    feeds.find(feed => feed.isTeacher)?.id || null
  );

  // Sort feeds to put active speaker first, then teacher, then others
  const sortedFeeds = [...feeds].sort((a, b) => {
    if (a.id === activeSpeakerId) return -1;
    if (b.id === activeSpeakerId) return 1;
    if (a.isTeacher) return -1;
    if (b.isTeacher) return 1;
    return 0;
  });

  const mainFeed = sortedFeeds[0] || null;
  const sideFeeds = sortedFeeds.slice(1);

  const isCurrentUser = (id: string) => id === currentUserId;

  // In compact mode, only show the main feed
  if (compact) {
    if (!mainFeed) return null;
    
    return (
      <CompactVideoFeed
        stream={null} // Would need to be connected to actual WebRTC stream
        isConnected={false} // Would need to be connected to actual WebRTC state
        isMuted={mainFeed.isMuted}
        isCameraOff={mainFeed.isCameraOff}
        userName={mainFeed.name}
        userRole={mainFeed.isTeacher ? 'teacher' : 'student'}
        isOwnVideo={isCurrentUser(mainFeed.id)}
        onToggleMute={() => onToggleMute(mainFeed.id)}
        onToggleCamera={() => onToggleCamera(mainFeed.id)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* Main Video Feed */}
      {mainFeed && (
        <MainVideoFeed
          feed={mainFeed}
          isCurrentUser={isCurrentUser(mainFeed.id)}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onRaiseHand={onRaiseHand}
          onMaximize={onMaximize}
        />
      )}

      {/* Side Video Feeds */}
      {sideFeeds.length > 0 && (
        <div className="flex overflow-x-auto gap-2 pb-2">
          {sideFeeds.map(feed => (
            <SideVideoFeed
              key={feed.id}
              feed={feed}
              isCurrentUser={isCurrentUser(feed.id)}
              onClickFeed={setActiveSpeakerId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
