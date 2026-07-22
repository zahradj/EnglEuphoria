
import { VideoFeed } from "./VideoFeed";
import { type VideoFeedType } from "./types";

interface SideVideoFeedProps {
  feed: VideoFeedType;
  isCurrentUser: boolean;
  onClickFeed: (id: string) => void;
}

export function SideVideoFeed({ feed, isCurrentUser, onClickFeed }: SideVideoFeedProps) {
  return (
    <div
      className="w-52 flex-shrink-0 aspect-video bg-black rounded-md overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-primary transition-all"
      onClick={() => onClickFeed(feed.id)}
    >
      <VideoFeed
        feed={feed}
        isSmall={true}
        isCurrentUser={isCurrentUser}
      />
    </div>
  );
}
