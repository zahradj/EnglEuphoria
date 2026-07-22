
import React from "react";
import { VideoFeed } from "./VideoFeed";

interface VideoFeedType {
  id: string;
  name: string;
  isTeacher: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised?: boolean;
}

interface SimpleVideoPanelProps {
  feeds: VideoFeedType[];
  currentUserId: string;
  isOneOnOne: boolean;
  onToggleMute: (id: string) => void;
  onToggleVideo: (id: string) => void;
  onToggleHand: (id: string) => void;
}

export function SimpleVideoPanel({
  feeds,
  currentUserId,
  isOneOnOne,
  onToggleMute,
  onToggleVideo,
  onToggleHand,
}: SimpleVideoPanelProps) {
  const isCurrentUser = (id: string) => id === currentUserId;

  if (isOneOnOne) {
    // One-on-one: Show teacher and student side by side
    const teacher = feeds.find(feed => feed.isTeacher);
    const student = feeds.find(feed => !feed.isTeacher);

    return (
      <div className="bg-black rounded-lg p-2 shadow-lg">
        <div className="flex gap-2">
          {teacher && (
            <div className="flex-1 aspect-video bg-muted-foreground/20 rounded overflow-hidden relative">
              <VideoFeed
                feed={teacher}
                isSmall={false}
                isCurrentUser={isCurrentUser(teacher.id)}
                onToggleMute={onToggleMute}
                onToggleCamera={onToggleVideo}
                onRaiseHand={onToggleHand}
              />
            </div>
          )}
          {student && (
            <div className="flex-1 aspect-video bg-muted-foreground/20 rounded overflow-hidden relative">
              <VideoFeed
                feed={student}
                isSmall={false}
                isCurrentUser={isCurrentUser(student.id)}
                onToggleMute={onToggleMute}
                onToggleCamera={onToggleVideo}
                onRaiseHand={onToggleHand}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Group: Show all participants in a row
  return (
    <div className="bg-black rounded-lg p-2 shadow-lg">
      <div className="flex gap-2 overflow-x-auto">
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className="flex-shrink-0 w-32 h-20 bg-muted-foreground/20 rounded overflow-hidden relative"
          >
            <VideoFeed
              feed={feed}
              isSmall={true}
              isCurrentUser={isCurrentUser(feed.id)}
              onToggleMute={onToggleMute}
              onToggleCamera={onToggleVideo}
              onRaiseHand={onToggleHand}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
